import React, { useState } from 'react';
import { MessageCircle, Mail, Phone, Send, HelpCircle, AlertTriangle, Check, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Cum pot să rezerv o călătorie?',
    answer: 'Pentru a rezerva o călătorie, selectați destinația și data dorită din pagina principală, alegeți călătoria care vi se potrivește și urmați pașii de rezervare. Veți primi o confirmare prin email după finalizarea rezervării.'
  },
  {
    question: 'Cum pot să anulez o rezervare?',
    answer: 'Puteți anula o rezervare din secțiunea "Călătoriile mele" din contul dvs. Anularea este gratuită cu cel puțin 24 de ore înainte de plecare. Pentru anulări cu mai puțin de 24 de ore înainte, vă rugăm să ne contactați direct.'
  },
  {
    question: 'Ce se întâmplă dacă autobuzul întârzie?',
    answer: 'În cazul întârzierilor, veți fi notificat prin email și SMS. Compania de transport este responsabilă să vă asigure transportul la destinație sau să vă ofere o alternativă satisfăcătoare.'
  },
  {
    question: 'Cum pot să contactez șoferul?',
    answer: 'După confirmarea rezervării, veți primi detaliile de contact ale șoferului în secțiunea "Călătoriile mele". Puteți comunica direct cu șoferul prin intermediul platformei noastre.'
  },
  {
    question: 'Care sunt metodele de plată acceptate?',
    answer: 'Acceptăm plăți cu cardul (Visa, Mastercard), transfer bancar și plata în numerar la urcarea în autobuz (pentru anumite rute). Toate plățile online sunt securizate și criptate.'
  }
];

export function Support() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success('Mesajul a fost trimis cu succes! Vă vom contacta în curând.');
    }, 1500);
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Centru de Suport</h1>
          <p className="text-lg text-gray-600">
            Suntem aici să vă ajutăm. Găsiți răspunsuri la întrebările frecvente sau contactați-ne direct.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="ml-4 text-lg font-semibold">Email</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Răspundem la emailuri în maxim 24 de ore
            </p>
            <a
              href="mailto:support@gomoldova.com"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              support@gomoldova.com
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="ml-4 text-lg font-semibold">Telefon</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Disponibil Luni-Vineri, 9:00 - 18:00
            </p>
            <a
              href="tel:+37360123456"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              +373 60 123 456
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="ml-4 text-lg font-semibold">Chat Live</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Chat instant cu echipa noastră de suport
            </p>
            <button 
              onClick={() => {/* Implement chat functionality */}}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Începe chat
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Întrebări Frecvente</h2>
            <p className="text-gray-600">
              Găsiți rapid răspunsuri la cele mai comune întrebări
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="mb-4 bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none"
                >
                  <span className="text-lg font-medium text-gray-900">
                    {faq.question}
                  </span>
                  {openFAQ === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Help Section */}
        <div className="bg-blue-50 rounded-2xl p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <HelpCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Nu ați găsit răspunsul căutat?
            </h2>
            <p className="text-gray-600 mb-6">
              Echipa noastră de suport este disponibilă să vă ajute cu orice întrebare sau problemă întâmpinată.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/contact-us"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Contactează-ne
              </Link>
              <Link
                to="/help"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
              >
                Centru de Ajutor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}