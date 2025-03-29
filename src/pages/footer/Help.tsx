import React from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, Mail, Phone, MessageSquare, BookOpen, Shield, CreditCard, Clock } from 'lucide-react';

export const Help: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('help.title')}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('help.subtitle')}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <Mail className="h-8 w-8 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('help.quick_actions.email.title')}</h3>
            <p className="text-gray-600 mb-4">{t('help.quick_actions.email.content')}</p>
            <a href="mailto:support@gomoldova.md" className="text-blue-600 hover:text-blue-800">
              support@gomoldova.md
            </a>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <Phone className="h-8 w-8 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('help.quick_actions.phone.title')}</h3>
            <p className="text-gray-600 mb-4">{t('help.quick_actions.phone.content')}</p>
            <a href="tel:+37322123456" className="text-blue-600 hover:text-blue-800">
              +373 22 123 456
            </a>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('help.quick_actions.chat.title')}</h3>
            <p className="text-gray-600 mb-4">{t('help.quick_actions.chat.content')}</p>
            <button className="text-blue-600 hover:text-blue-800">
              {t('help.quick_actions.chat.button')}
            </button>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <Clock className="h-8 w-8 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('help.quick_actions.hours.title')}</h3>
            <p className="text-gray-600 mb-4">{t('help.quick_actions.hours.content')}</p>
            <p className="text-blue-600">24/7</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('help.faq.title')}</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">{t('help.faq.q1')}</h3>
              <p className="text-gray-600">{t('help.faq.a1')}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">{t('help.faq.q2')}</h3>
              <p className="text-gray-600">{t('help.faq.a2')}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">{t('help.faq.q3')}</h3>
              <p className="text-gray-600">{t('help.faq.a3')}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">{t('help.faq.q4')}</h3>
              <p className="text-gray-600">{t('help.faq.a4')}</p>
            </div>
          </div>
        </div>

        {/* Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <BookOpen className="h-6 w-6 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('help.categories.booking.title')}</h3>
            <p className="text-gray-600 mb-4">{t('help.categories.booking.content')}</p>
            <a href="#" className="text-blue-600 hover:text-blue-800">
              {t('help.categories.booking.link')}
            </a>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('help.categories.safety.title')}</h3>
            <p className="text-gray-600 mb-4">{t('help.categories.safety.content')}</p>
            <a href="#" className="text-blue-600 hover:text-blue-800">
              {t('help.categories.safety.link')}
            </a>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <CreditCard className="h-6 w-6 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('help.categories.payment.title')}</h3>
            <p className="text-gray-600 mb-4">{t('help.categories.payment.content')}</p>
            <a href="#" className="text-blue-600 hover:text-blue-800">
              {t('help.categories.payment.link')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};