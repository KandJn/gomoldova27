import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, AlertTriangle, CheckCircle, Info, Lock, UserCheck } from 'lucide-react';

export const Safety: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('safety.title')}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('safety.subtitle')}
          </p>
        </div>

        {/* Safety Overview */}
        <div className="bg-blue-50 p-8 rounded-lg mb-16">
          <div className="flex items-center mb-4">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">{t('safety.overview.title')}</h2>
          </div>
          <p className="text-gray-600">{t('safety.overview.content')}</p>
        </div>

        {/* Safety Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <UserCheck className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">{t('safety.guidelines.verification.title')}</h3>
            </div>
            <p className="text-gray-600 mb-4">{t('safety.guidelines.verification.content')}</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>{t('safety.guidelines.verification.points.identity')}</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>{t('safety.guidelines.verification.points.background')}</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>{t('safety.guidelines.verification.points.reviews')}</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-900">{t('safety.guidelines.payment.title')}</h3>
            </div>
            <p className="text-gray-600 mb-4">{t('safety.guidelines.payment.content')}</p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>{t('safety.guidelines.payment.points.secure')}</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>{t('safety.guidelines.payment.points.transparent')}</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>{t('safety.guidelines.payment.points.protection')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('safety.tips.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Info className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">{t('safety.tips.before.title')}</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1" />
                  <span>{t('safety.tips.before.points.verify')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1" />
                  <span>{t('safety.tips.before.points.review')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1" />
                  <span>{t('safety.tips.before.points.share')}</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Info className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">{t('safety.tips.during.title')}</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1" />
                  <span>{t('safety.tips.during.points.belt')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1" />
                  <span>{t('safety.tips.during.points.alert')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1" />
                  <span>{t('safety.tips.during.points.comfort')}</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Info className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">{t('safety.tips.after.title')}</h3>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1" />
                  <span>{t('safety.tips.after.points.rate')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1" />
                  <span>{t('safety.tips.after.points.report')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-1" />
                  <span>{t('safety.tips.after.points.feedback')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Emergency Support */}
        <div className="bg-red-50 p-8 rounded-lg">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">{t('safety.emergency.title')}</h2>
          </div>
          <p className="text-gray-600 mb-4">{t('safety.emergency.content')}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="tel:+37322123456" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
              {t('safety.emergency.call')}
            </a>
            <a href="mailto:safety@gomoldova.md" className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              {t('safety.emergency.email')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};