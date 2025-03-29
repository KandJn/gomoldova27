import React from 'react';
import { useTranslation } from 'react-i18next';

const HowItWorks: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t('how_it_works.title')}</h1>
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('how_it_works.section1.title')}</h2>
          <p className="text-gray-600">{t('how_it_works.section1.content')}</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('how_it_works.section2.title')}</h2>
          <p className="text-gray-600">{t('how_it_works.section2.content')}</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t('how_it_works.section3.title')}</h2>
          <p className="text-gray-600">{t('how_it_works.section3.content')}</p>
        </section>
      </div>
    </div>
  );
};

export default HowItWorks; 