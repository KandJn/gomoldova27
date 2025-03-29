import React from 'react';
import { useTranslation } from 'react-i18next';
import { Newspaper, Download, ExternalLink, Calendar, Mail, Phone, MapPin } from 'lucide-react';

export const Press: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('press.title')}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('press.subtitle')}
          </p>
        </div>

        {/* Press Contacts */}
        <div className="mb-16">
          <div className="bg-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('press.section1.title')}</h2>
            <p className="text-gray-600 mb-6">
              {t('press.section1.content')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('press.section1.department')}</h3>
                <div className="space-y-2">
                  <p className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    press@gomoldova.md
                  </p>
                  <p className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    +373 22 123 456
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{t('press.section1.spokesperson')}</h3>
                <p className="text-gray-600">{t('press.section1.spokesperson_name')}</p>
                <p className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  elena.popescu@gomoldova.md
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Press Releases */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('press.section2.title')}</h2>
          
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center text-gray-500 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                <span>15 Martie 2025</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('press.section2.release1.title')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('press.section2.release1.content')}
              </p>
              <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center">
                <ExternalLink className="h-4 w-4 mr-1" />
                {t('press.section2.read_more')}
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center text-gray-500 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                <span>2 Aprilie 2025</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('press.section2.release2.title')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('press.section2.release2.content')}
              </p>
              <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center">
                <ExternalLink className="h-4 w-4 mr-1" />
                {t('press.section2.read_more')}
              </a>
            </div>
          </div>
        </div>

        {/* Media Resources */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('press.section3.title')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Newspaper className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-xl font-semibold">{t('press.section3.press_kit')}</h3>
              </div>
              <p className="text-gray-600 mb-4">
                {t('press.section3.press_kit_content')}
              </p>
              <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center">
                <Download className="h-4 w-4 mr-1" />
                {t('press.section3.download_kit')}
              </a>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Newspaper className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-xl font-semibold">{t('press.section3.brand_assets')}</h3>
              </div>
              <p className="text-gray-600 mb-4">
                {t('press.section3.brand_assets_content')}
              </p>
              <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center">
                <Download className="h-4 w-4 mr-1" />
                {t('press.section3.download_assets')}
              </a>
            </div>
          </div>
        </div>

        {/* Subscribe */}
        <div className="bg-blue-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">{t('press.section4.title')}</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            {t('press.section4.content')}
          </p>
          <form className="max-w-md mx-auto">
            <div className="flex">
              <input
                type="email"
                placeholder={t('press.section4.email_placeholder')}
                className="flex-1 py-2 px-4 rounded-l-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-800 hover:bg-blue-900 text-white py-2 px-4 rounded-r-md"
              >
                {t('press.section4.subscribe')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};