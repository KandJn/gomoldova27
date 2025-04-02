import React, { useContext } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Car, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../lib/store';
import { useAvatar } from '../contexts/AvatarContext';
import { AuthModal } from './AuthModal';
import { ChatModal } from './ChatModal';
import { LanguageSelector } from './LanguageSelector';
import { ProfileDropdown } from './ProfileDropdown';
import { ScrollToTop } from './ScrollToTop';
import { Toaster } from 'react-hot-toast';
import { PageTransition } from './PageTransition';
import { AppContext } from '../App';

export const Layout = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('Layout must be used within AppContext.Provider');
  
  const { user } = useAuthStore();
  const { avatarTimestamp } = useAvatar();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <ScrollToTop />
      <Toaster position="top-center" />
      <AuthModal 
        isOpen={context.isAuthModalOpen} 
        onClose={() => context.setIsAuthModalOpen(false)} 
      />
      <ChatModal
        isOpen={context.isChatModalOpen}
        onClose={() => {
          context.setIsChatModalOpen(false);
          context.setChatRecipientId(null);
        }}
        recipientId={context.chatRecipientId}
      />
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Car className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">GoMoldova</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {user?.id ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/offer-seats/departure"
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Car className="h-5 w-5" />
                    <span>{t('nav.offer_ride')}</span>
                  </Link>
                  <LanguageSelector />
                  <div className="relative flex items-center">
                    <button
                      onMouseEnter={() => context.setIsProfileDropdownOpen(true)}
                      onClick={() => context.setIsProfileDropdownOpen(!context.isProfileDropdownOpen)}
                      onMouseLeave={() => {
                        setTimeout(() => {
                          if (!document.querySelector('.profile-dropdown:hover')) {
                            context.setIsProfileDropdownOpen(false);
                          }
                        }, 500);
                      }}
                      className="flex items-center space-x-2 px-2 py-1 hover:bg-gray-50 rounded-md"
                    >
                      <div className="relative flex items-center">
                        <img
                          src={context.profile?.avatar_url 
                            ? `${context.profile.avatar_url}?v=${avatarTimestamp}` 
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(context.profile?.full_name || user?.email || 'U')}&background=random&color=fff&size=48`}
                          alt={context.profile?.full_name || user?.email || 'User'}
                          className="w-10 h-10 rounded-full ring-2 ring-white object-cover shadow-sm"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(context.profile?.full_name || user?.email || 'U')}&background=random&color=fff&size=48`;
                            if (target.src !== fallbackUrl) {
                              target.src = fallbackUrl;
                            }
                          }}
                        />
                        {context.notifications.length > 0 && (
                          <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white text-xs font-medium">{context.notifications.length}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700 hidden lg:block">
                        {context.profile?.full_name || 'Utilizator'}
                      </span>
                    </button>
                    <ProfileDropdown
                      isOpen={context.isProfileDropdownOpen}
                      onClose={() => {
                        context.setIsProfileDropdownOpen(false);
                        if (context.notifications.length > 0) {
                          context.markNotificationsAsRead();
                        }
                      }}
                      onMouseLeave={() => context.setIsProfileDropdownOpen(false)}
                      onOpenChat={(userId) => {
                        context.setChatRecipientId(userId);
                        context.setIsChatModalOpen(true);
                        context.setIsProfileDropdownOpen(false);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <LanguageSelector />
                  <button
                    onClick={() => context.setIsAuthModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all-300"
                  >
                    Autentificare
                  </button>
                </div>
              )}
            </div>

            <div className="md:hidden">
              <button
                onClick={() => context.setIsMenuOpen(!context.isMenuOpen)}
                className="text-gray-700"
              >
                {context.isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {context.isMenuOpen && (
          <div className="md:hidden animate-slide-down">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user?.id && (
                <Link
                  to="/offer-seats/departure"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 w-full text-left"
                  onClick={() => context.setIsMenuOpen(false)}
                >
                  Oferă o călătorie
                </Link>
              )}
              {user ? (
                <>
                  <span className="block px-3 py-2 text-gray-700">{user.email}</span>
                  <button
                    onClick={context.handleLogout}
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 w-full text-left"
                  >
                    Deconectare
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    context.setIsAuthModalOpen(true);
                    context.setIsMenuOpen(false);
                  }}
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 w-full text-left"
                >
                  Autentificare
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="min-h-screen">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>

      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.about.title')}</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/how-it-works" className="hover:text-blue-400 transition-all-300">
                    {t('footer.about.how_it_works')}
                  </Link>
                </li>
                <li>
                  <Link to="/about-company" className="hover:text-blue-400 transition-all-300">
                    {t('footer.about.company')}
                  </Link>
                </li>
                <li>
                  <Link to="/press" className="hover:text-blue-400 transition-all-300">
                    {t('footer.about.press')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.info.title')}</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/help" className="hover:text-blue-400 transition-all-300">
                    {t('footer.info.help')}
                  </Link>
                </li>
                <li>
                  <Link to="/safety" className="hover:text-blue-400 transition-all-300">
                    {t('footer.info.safety')}
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-blue-400 transition-all-300">
                    {t('footer.info.terms')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.contact.title')}</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/support" className="hover:text-blue-400 transition-all-300">
                    {t('footer.contact.support')}
                  </Link>
                </li>
                <li>
                  <Link to="/contact-us" className="hover:text-blue-400 transition-all-300">
                    {t('footer.contact.contact_us')}
                  </Link>
                </li>
                <li>
                  <Link to="/partners" className="hover:text-blue-400 transition-all-300">
                    {t('footer.contact.partners')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}; 