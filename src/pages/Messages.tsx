import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import { MessageCircle, Send, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  sender: {
    full_name: string;
    avatar_url: string | null;
  };
  receiver: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface ChatMessage {
  id: number;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  read_at: string | null;
}

export function Messages() {
  const [conversations, setConversations] = useState<Message[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; avatar_url: string | null } | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuthStore();
  const messagesStartRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
      subscribeToMessages();
    }
  }, [user]);

  useEffect(() => {
    if (selectedUser) {
      fetchChatMessages(selectedUser.id);
    }
  }, [selectedUser]);

  const scrollToTop = () => {
    setTimeout(() => {
      messagesStartRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(
            full_name,
            avatar_url
          ),
          receiver:profiles!messages_receiver_id_fkey(
            full_name,
            avatar_url
          )
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation partner
      const conversationsMap = data?.reduce((acc, message) => {
        const partnerId = message.sender_id === user.id ? message.receiver_id : message.sender_id;
        const partner = message.sender_id === user.id ? message.receiver : message.sender;
        
        if (!acc[partnerId]) {
          acc[partnerId] = {
            ...message,
            partner: {
              id: partnerId,
              name: partner.full_name,
              avatar_url: partner.avatar_url
            }
          };
        }
        return acc;
      }, {} as Record<string, any>);

      setConversations(Object.values(conversationsMap));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Nu s-au putut încărca conversațiile');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async (partnerId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChatMessages(data || []);

      // Mark messages as read - directly update the messages table
      const unreadMessages = data?.filter(msg => msg.receiver_id === user.id && !msg.read_at) || [];
      if (unreadMessages.length > 0) {
        const { error: updateError } = await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('receiver_id', user.id)
          .eq('sender_id', partnerId)
          .is('read_at', null);

        if (updateError) {
          console.error('Error marking messages as read:', updateError);
        }
      }

      // Scroll to top after messages are loaded
      scrollToTop();
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      toast.error('Nu s-au putut încărca mesajele');
    }
  };

  const subscribeToMessages = () => {
    if (!user) return;

    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(receiver_id.eq.${user.id},sender_id.eq.${user.id})`,
      }, () => {
        fetchConversations();
        if (selectedUser) {
          fetchChatMessages(selectedUser.id);
        }
      })
      .subscribe();

    return () => subscription.unsubscribe();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedUser || !newMessage.trim()) return;

    try {
      const { error } = await supabase.from('messages').insert([
        {
          content: newMessage.trim(),
          sender_id: user.id,
          receiver_id: selectedUser.id,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
      
      // Clear the input
      setNewMessage('');
      
      // Fetch updated messages
      await fetchChatMessages(selectedUser.id);
      
      // Fetch updated conversations to reflect the latest message
      await fetchConversations();
      
      // Scroll to bottom
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Nu s-a putut trimite mesajul');
    }
  };

  const handleOpenChat = (userId: string, userName: string, avatarUrl: string | null) => {
    setSelectedUser({ id: userId, name: userName, avatar_url: avatarUrl });
  };

  const filteredConversations = conversations.filter(conv => 
    conv.partner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow h-[calc(100vh-12rem)] flex overflow-hidden">
        {/* Left sidebar - Conversations */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Caută conversații..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Se încarcă...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Nu aveți conversații
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    selectedUser?.id === conversation.partner.id ? 'bg-blue-50' : ''
                  } ${
                    !conversation.read_at && conversation.receiver_id === user?.id
                      ? 'bg-blue-50'
                      : ''
                  }`}
                  onClick={() => handleOpenChat(
                    conversation.partner.id, 
                    conversation.partner.name,
                    conversation.partner.avatar_url
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        conversation.partner.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          conversation.partner.name
                        )}&background=random`
                      }
                      alt={conversation.partner.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {conversation.partner.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.content}
                      </p>
                    </div>
                    {!conversation.read_at && conversation.receiver_id === user?.id && (
                      <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right side - Chat */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
                <img
                  src={
                    selectedUser.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      selectedUser.name
                    )}&background=random`
                  }
                  alt={selectedUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-medium text-gray-900">{selectedUser.name}</h2>
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div ref={messagesStartRef} />
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.sender_id === user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === user?.id
                          ? 'text-blue-100'
                          : 'text-gray-500'
                      }`}>
                        {format(new Date(message.created_at), 'HH:mm', { locale: ro })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Scrie un mesaj..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Selectează o conversație pentru a începe
            </div>
          )}
        </div>
      </div>
    </div>
  );
}