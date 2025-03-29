import React, { useState, useEffect, createContext, useContext } from 'react';
import './i18n/config';
import { Car, Search, MapPin, Calendar, Clock, Users as UsersIcon, Menu, X, Shield, Star, Heart, Zap, ArrowRight, Bell, Check, Bus, User, Map } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useAuthStore, useSearchStore } from './lib/store';
import { AuthModal } from './components/AuthModal';
import { ProfileDropdown } from './components/ProfileDropdown';
import { ChatModal } from './components/ChatModal';
import { LanguageSelector } from './components/LanguageSelector';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { Link, Outlet, createBrowserRouter, RouterProvider, Navigate, redirect } from 'react-router-dom';
import { PlacesAutocomplete } from './components/PlacesAutocomplete';
import { AboutUs } from './pages/AboutUs';
import { Information } from './pages/Information';
import { Contact } from './pages/Contact';
import { TripDetails } from './pages/TripDetails';
import { BookingConfirmation } from './pages/BookingConfirmation';
import { TripsListing } from './pages/TripsListing';
import { MyTrips } from './pages/MyTrips';
import { Profile } from './pages/Profile';
import { Transfers } from './pages/Transfers';
import { Payments } from './pages/Payments';
import { RegisterEmail } from './pages/register/Email';
import { RegisterName } from './pages/register/Name';
import { RegisterBirthYear } from './pages/register/BirthYear';
import { RegisterGender } from './pages/register/Gender';
import { Password } from './pages/register/Password';
import { PhoneFill } from './pages/phone/Fill';
import { Messages } from './pages/Messages';
import { useTranslation } from 'react-i18next';
import { DeparturePage } from './pages/offer-seats/DeparturePage';
import { PreciseDeparturePage } from './pages/offer-seats/PreciseDeparturePage';
import { ArrivalPage } from './pages/offer-seats/ArrivalPage';
import { ArrivalPrecisePage } from './pages/offer-seats/ArrivalPrecisePage';
import { ChooseYourRoutePage } from './pages/offer-seats/ChooseYourRoutePage';
import { DeclaredStopoversPage } from './pages/offer-seats/DeclaredStopoversPage';
import { DepartureDatePage } from './pages/offer-seats/DepartureDatePage';
import { DepartureTimePage } from './pages/offer-seats/DepartureTimePage';
import { SeatsPage } from './pages/offer-seats/SeatsPage';
import { PriceRecommendationPage } from './pages/offer-seats/PriceRecommendationPage';
import { ReturnTripPage } from './pages/offer-seats/ReturnTripPage';
import { HowItWorks } from './pages/footer/HowItWorks';
import { AboutCompany } from './pages/footer/AboutCompany';
import { Press } from './pages/footer/Press';
import { Help } from './pages/footer/Help';
import { Safety } from './pages/footer/Safety';
import { Terms } from './pages/footer/Terms';
import { Support } from './pages/footer/Support';
import { ContactUs } from './pages/footer/ContactUs';
import { Partners } from './pages/footer/Partners';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminVerifications } from './pages/admin/Verifications';
import { AdminUsers } from './pages/admin/Users';
import { Reports } from './pages/admin/Reports';
import { Analytics } from './pages/admin/Analytics';
import { Settings } from './pages/admin/Settings';
import { Trips } from './pages/admin/Trips';
import { Alerts } from './pages/admin/Alerts';
import { NotificationsDropdown } from './components/NotificationsDropdown';
import { BookingRequests } from './pages/BookingRequests';
import { ScrollToTop } from './components/ScrollToTop';
import { BusCompanyRegistration } from './pages/BusCompanyRegistration';
import { BusCompanyRegistrations } from './pages/admin/BusCompanyRegistrations';
import { TestLogin } from './pages/TestLogin';
import { ResetPassword } from './pages/auth/ResetPassword';
import { createClient } from '@supabase/supabase-js';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { AvatarProvider, useAvatar } from './contexts/AvatarContext';
import { BusCompanyDashboard } from './pages/bus-company/BusCompanyDashboard';
import { BusManagement } from './pages/bus-company/BusManagement';
import { TripManagement } from './pages/bus-company/TripManagement';
import { NewTrip } from './pages/bus-company/NewTrip';
import { EditTrip } from './pages/bus-company/EditTrip';
import { NewBus } from './pages/bus-company/NewBus';
import { BusCompanyLayout } from './components/bus-company/BusCompanyLayout';
import { BookingManagement } from './pages/bus-company/BookingManagement';
import { DebugProvider, useDebug } from './contexts/DebugContext';
import { EditBus } from './pages/bus-company/EditBus';
import { BusCompanySettings } from './pages/bus-company/Settings';
import { ConfirmBooking } from './pages/ConfirmBooking';
import { MyBookings } from './pages/MyBookings';
import { AdminGuard } from './components/admin/AdminGuard';
import { AdminBusCompanies } from './pages/admin/bus-companies';
import { AdminBookings } from './pages/admin/Bookings';
import { AdminReports } from './pages/admin/Reports';
import { AdminSettings } from './pages/admin/Settings';
import { BusCompanyBuses } from './pages/bus-company/BusManagement';
import { BusCompanyTrips } from './pages/bus-company/TripManagement';
import { BusCompanyBookings } from './pages/bus-company/BookingManagement';
import { LoadingSpinner } from './components/LoadingSpinner';
import { HomePage } from './pages/Home.tsx';
import { BusCompanyGuard } from './components/bus-company/BusCompanyGuard';
import { SetPassword } from './pages/bus-company/SetPassword';
import { PageTransition } from './components/PageTransition';
import { UpdatePassword } from './pages/auth/UpdatePassword';

// Move handleOpenChat outside and make it a standalone function
const handleOpenChat = (setChatRecipientId: (id: string) => void, setIsChatModalOpen: (open: boolean) => void) => (userId: string) => {
    setChatRecipientId(userId);
    setIsChatModalOpen(true);
  };

interface AppContextType {
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (value: boolean) => void;
  isProfileDropdownOpen: boolean;
  setIsProfileDropdownOpen: (value: boolean) => void;
  isChatModalOpen: boolean;
  setIsChatModalOpen: (value: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (value: boolean) => void;
  chatRecipientId: string | null;
  setChatRecipientId: (value: string | null) => void;
  notifications: any[];
  setNotifications: (value: any[]) => void;
  profile: any;
  setProfile: (value: any) => void;
  handleLogout: () => void;
  markNotificationsAsRead: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

function Layout() {
  const context = useContext(AppContext);
  if (!context) throw new Error('Layout must be used within AppContext.Provider');
  
  const { user } = useAuthStore();
  const { avatarTimestamp } = useAvatar();
  const { toggleDebugMode, isDebugMode } = useDebug();

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
              <button
                onClick={toggleDebugMode}
                className={`px-3 py-1 rounded text-sm ${
                  isDebugMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Debug
              </button>
              
              {user?.id && (
                <Link
                  to="/offer-seats/departure"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                >
                  Oferă o călătorie
                </Link>
              )}

              {user ? (
                <div className="flex items-center space-x-4">
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
              <h3 className="text-lg font-semibold mb-4">Despre</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/how-it-works" className="hover:text-blue-400 transition-all-300">
                    Cum funcționează
                  </Link>
                </li>
                <li>
                  <Link to="/about-company" className="hover:text-blue-400 transition-all-300">
                    Despre companie
                  </Link>
                </li>
                <li>
                  <Link to="/press" className="hover:text-blue-400 transition-all-300">
                    Presă
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Informații</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/help" className="hover:text-blue-400 transition-all-300">
                    Ajutor
                  </Link>
                </li>
                <li>
                  <Link to="/safety" className="hover:text-blue-400 transition-all-300">
                    Siguranță
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-blue-400 transition-all-300">
                    Termeni
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/support" className="hover:text-blue-400 transition-all-300">
                    Suport
                  </Link>
                </li>
                <li>
                  <Link to="/contact-us" className="hover:text-blue-400 transition-all-300">
                    Contactează-ne
                  </Link>
                </li>
                <li>
                  <Link to="/partners" className="hover:text-blue-400 transition-all-300">
                    Parteneri
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p>&copy; {new Date().getFullYear()} GoMoldova. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [chatRecipientId, setChatRecipientId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const { user, setUser } = useAuthStore();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, avatar_url, address, city, country, created_at, updated_at')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      
      // Get registration name from storage to use if profile name is empty
      const registrationName = localStorage.getItem('registration_name') || sessionStorage.getItem('registration_name') || null;
      const registrationFirstName = localStorage.getItem('registration_first_name') || sessionStorage.getItem('registration_first_name') || null;
      const registrationLastName = localStorage.getItem('registration_last_name') || sessionStorage.getItem('registration_last_name') || null;
      
      const fullName = data?.full_name || registrationName;
      
      // Split name into first and last if we don't have individual parts
      let firstName = registrationFirstName;
      let lastName = registrationLastName;
      
      if (!firstName && !lastName && fullName) {
        const nameParts = fullName.trim().split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }
      
      // Update profile in database if name was empty but we have registration name
      if (data && !data.full_name && registrationName) {
        await supabase
          .from('profiles')
          .update({ full_name: registrationName })
          .eq('id', user?.id);
      }
      
      if (data) {
        // Add the email from the user object and name components
        setProfile({
          ...data,
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          email: user?.email || null,
          preferred_language: 'ro'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .is('read_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const subscribeToNotifications = () => {
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`,
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsMenuOpen(false);
      setIsProfileDropdownOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error logging out');
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user?.id)
        .is('read_at', null);

      if (error) throw error;
      setNotifications([]);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const contextValue = {
    isMenuOpen,
    setIsMenuOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isProfileDropdownOpen,
    setIsProfileDropdownOpen,
    isChatModalOpen,
    setIsChatModalOpen,
    isNotificationsOpen,
    setIsNotificationsOpen,
    chatRecipientId,
    setChatRecipientId,
    notifications,
    setNotifications,
    profile,
    setProfile,
    handleLogout,
    markNotificationsAsRead
  };

  const router = createBrowserRouter([
    // Redirects for language-prefixed URLs
    {
      path: '/:lang(ro|ru|en)/*',
      loader: ({ params }) => {
        // Store the language preference
        const lang = params.lang;
        if (lang) {
          localStorage.setItem('i18nextLng', lang);
          // Update the language without changing URL
          i18n.changeLanguage(lang);
        }
        
        // Get the rest of the path without the language prefix
        const pathname = window.location.pathname;
        const newPath = pathname.replace(/^\/(?:ro|ru|en)/, '');
        
        // Redirect to the same path without the language prefix
        return redirect(newPath || '/');
      }
    },
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'trips', element: <TripsListing /> },
        { path: 'trips/my', element: <Navigate to="/my-trips" replace /> },
        { path: 'my-trips', element: <MyTrips /> },
        { path: 'trips/:id', element: <TripDetails /> },
        { path: 'trip/:id', element: <TripDetails /> },
        { path: 'trip/:id/book', element: <BookingConfirmation /> },
        { path: 'profile', element: <Profile /> },
        { path: 'transfers', element: <Transfers /> },
        { path: 'payments', element: <Payments /> },
        { path: 'booking-requests', element: <BookingRequests /> },
        { path: 'messages', element: <Messages /> },
        { path: 'bus-company-registration', element: <BusCompanyRegistration /> },
        { path: 'bus-company/set-password', element: <SetPassword /> },
        { path: 'register/email', element: <RegisterEmail /> },
        { path: 'register/name', element: <RegisterName /> },
        { path: 'register/birth-year', element: <RegisterBirthYear /> },
        { path: 'register/birthyear', element: <RegisterBirthYear /> },
        { path: 'register/gender', element: <RegisterGender /> },
        { path: 'register/password', element: <Password /> },
        { path: 'phone/fill', element: <PhoneFill /> },
        { path: 'offer-seats/departure', element: <DeparturePage /> },
        { path: 'offer-seats/departure/precise', element: <PreciseDeparturePage /> },
        { path: 'offer-seats/arrival', element: <ArrivalPage /> },
        { path: 'offer-seats/arrival/precise', element: <ArrivalPrecisePage /> },
        { path: 'offer-seats/choose-your-route', element: <ChooseYourRoutePage /> },
        { path: 'offer-seats/stopovers', element: <DeclaredStopoversPage /> },
        { path: 'offer-seats/declared-stopovers', element: <DeclaredStopoversPage /> },
        { path: 'offer-seats/departure-date', element: <DepartureDatePage /> },
        { path: 'offer-seats/departure-date/time', element: <DepartureTimePage /> },
        { path: 'offer-seats/seats', element: <SeatsPage /> },
        { path: 'offer-seats/price', element: <PriceRecommendationPage /> },
        { path: 'offer-seats/price-recommendation', element: <PriceRecommendationPage /> },
        { path: 'offer-seats/return', element: <ReturnTripPage /> },
        { path: 'offer-seats/return-trip', element: <ReturnTripPage /> },
        { path: 'how-it-works', element: <HowItWorks /> },
        { path: 'about-company', element: <AboutCompany /> },
        { path: 'press', element: <Press /> },
        { path: 'help', element: <Help /> },
        { path: 'safety', element: <Safety /> },
        { path: 'terms', element: <Terms /> },
        { path: 'support', element: <Support /> },
        { path: 'contact-us', element: <ContactUs /> },
        { path: 'partners', element: <Partners /> },
        {
          path: 'admin',
          element: <AdminGuard><AdminLayout /></AdminGuard>,
          children: [
            { path: '', element: <AdminDashboard /> },
            { path: 'users', element: <AdminUsers /> },
            { path: 'trips', element: <Trips /> },
            { path: 'verifications', element: <AdminVerifications /> },
            { path: 'analytics', element: <Analytics /> },
            { path: 'alerts', element: <Alerts /> },
            { path: 'bus-companies', element: <AdminBusCompanies /> },
            { path: 'bookings', element: <AdminBookings /> },
            { path: 'reports', element: <AdminReports /> },
            { path: 'settings', element: <AdminSettings /> },
          ],
        },
        {
          path: 'bus-company',
          element: <BusCompanyGuard><BusCompanyLayout /></BusCompanyGuard>,
          children: [
            { path: '', element: <BusCompanyDashboard /> },
            { path: 'buses', element: <BusCompanyBuses /> },
            { path: 'trips', element: <BusCompanyTrips /> },
            { path: 'bookings', element: <BusCompanyBookings /> },
            { path: 'settings', element: <BusCompanySettings /> },
          ],
        },
        { path: 'how-it-works', element: <HowItWorks /> },
        { path: 'about-company', element: <AboutCompany /> },
        { path: 'reset-password', element: <ResetPassword /> },
        { path: 'update-password', element: <UpdatePassword /> },
      ],
    },
  ], {
    future: {
      v7_startTransition: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  });

  return (
    <AppContext.Provider value={contextValue}>
      <NotificationsProvider>
      <AvatarProvider>
          <DebugProvider>
            <RouterProvider 
              router={router}
              future={{
                v7_startTransition: true
              }}
            />
          </DebugProvider>
        </AvatarProvider>
        </NotificationsProvider>
    </AppContext.Provider>
  );
}

export default App;
