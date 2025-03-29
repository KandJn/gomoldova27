import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  onSendMessage: (message: string) => Promise<void> | void;
}

export function ChatModal({ isOpen, onClose, recipientName, onSendMessage }: ChatModalProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    try {
      setIsSending(true);
      await onSendMessage(message.trim());
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Mesaj pentru șofer
            </h3>
            <p className="text-sm text-gray-500 mt-1">{recipientName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message Form */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Scrie un mesaj despre călătorie..."
              className="w-full h-32 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500 resize-none"
              maxLength={500}
              disabled={isSending}
            />
            <div className="mt-1 text-right text-sm text-gray-500">
              {message.length}/500
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              disabled={isSending}
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={!message.trim() || isSending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
            >
              {isSending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Se trimite...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Trimite</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}