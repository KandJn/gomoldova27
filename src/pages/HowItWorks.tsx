import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, CreditCard, Users } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const { t, i18n } = useTranslation();

  // Debug logging for translations
  useEffect(() => {
    console.log('Current language:', i18n.language);
    const testKeys = [
      'how_it_works.title',
      'how_it_works.subtitle',
      'how_it_works.step1.title',
      'how_it_works.step1.description',
      'how_it_works.step2.title',
      'how_it_works.step2.description',
      'how_it_works.step3.title',
      'how_it_works.step3.description',
      'how_it_works.for_drivers.title',
      'how_it_works.for_drivers.description',
      'how_it_works.for_passengers.title',
      'how_it_works.for_passengers.description'
    ];

    testKeys.forEach(key => {
      console.log(`Translation for ${key}:`, t(key));
    });

    const handleLanguageChange = () => {
      console.log('Language changed to:', i18n.language);
      testKeys.forEach(key => {
        console.log(`Translation for ${key}:`, t(key));
      });
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, t]);

  // Get translations with explicit language
  const translations = {
    title: t('how_it_works.title', { lng: i18n.language }),
    subtitle: t('how_it_works.subtitle', { lng: i18n.language }),
    step1: {
      title: t('how_it_works.step1.title', { lng: i18n.language }),
      description: t('how_it_works.step1.description', { lng: i18n.language })
    },
    step2: {
      title: t('how_it_works.step2.title', { lng: i18n.language }),
      description: t('how_it_works.step2.description', { lng: i18n.language })
    },
    step3: {
      title: t('how_it_works.step3.title', { lng: i18n.language }),
      description: t('how_it_works.step3.description', { lng: i18n.language })
    },
    for_drivers: {
      title: t('how_it_works.for_drivers.title', { lng: i18n.language }),
      description: t('how_it_works.for_drivers.description', { lng: i18n.language })
    },
    for_passengers: {
      title: t('how_it_works.for_passengers.title', { lng: i18n.language }),
      description: t('how_it_works.for_passengers.description', { lng: i18n.language })
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{translations.title}</h1>
        <p className="text-xl text-gray-600">{translations.subtitle}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{translations.step1.title}</h2>
          <p className="text-gray-600">{translations.step1.description}</p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{translations.step2.title}</h2>
          <p className="text-gray-600">{translations.step2.description}</p>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{translations.step3.title}</h2>
          <p className="text-gray-600">{translations.step3.description}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">{translations.for_drivers.title}</h2>
          <p className="text-gray-600">{translations.for_drivers.description}</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">{translations.for_passengers.title}</h2>
          <p className="text-gray-600">{translations.for_passengers.description}</p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks; 