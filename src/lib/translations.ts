import { useLanguageStore } from './store';

type TranslationKey = string;

interface Translations {
  [key: string]: {
    [key in TranslationKey]: string;
  };
}

export const translations: Translations = {
  ro: {
    // Navigation
    'nav.offer_ride': 'Oferă un loc',
    'nav.login': 'Autentificare',
    'nav.logout': 'Deconectare',
    
    // Hero Section
    'hero.title': 'Călătorește în Moldova cu încredere',
    
    // Search
    'search.from_placeholder': 'De unde pleci?',
    'search.to_placeholder': 'Unde mergi?',
    'search.button': 'Caută',
    
    // Trip Listings
    'trips.available': 'Călătorii disponibile',
    'trips.seats_of': 'din',
    'trips.seats_available': 'locuri disponibile',
    'trips.view_details': 'Vezi detalii',
    
    // Success Messages
    'success.trip_booked': 'Călătorie rezervată cu succes!',
    'success.logout': 'Deconectare reușită',
    
    // Error Messages
    'errors.load_trips': 'Eroare la încărcarea călătoriilor',
    'errors.book_trip': 'Eroare la rezervarea călătoriei',
    'errors.logout': 'Eroare la deconectare',
    
    // Footer
    'footer.about.title': 'Despre noi',
    'footer.about.how_it_works': 'Cum funcționează',
    'footer.about.company': 'Despre companie',
    'footer.about.press': 'Presă',
    
    'footer.info.title': 'Informații',
    'footer.info.help': 'Ajutor',
    'footer.info.safety': 'Siguranță',
    'footer.info.terms': 'Termeni și condiții',
    
    'footer.contact.title': 'Contact',
    'footer.contact.support': 'Suport',
    'footer.contact.contact_us': 'Contactează-ne',
    'footer.contact.partners': 'Parteneri',
    
    'footer.copyright': '© 2025 GoMoldova. Toate drepturile rezervate.',
  },
  en: {
    // Navigation
    'nav.offer_ride': 'Offer a Ride',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    
    // Hero Section
    'hero.title': 'Travel in Moldova with confidence',
    
    // Search
    'search.from_placeholder': 'Where from?',
    'search.to_placeholder': 'Where to?',
    'search.button': 'Search',
    
    // Trip Listings
    'trips.available': 'Available Trips',
    'trips.seats_of': 'of',
    'trips.seats_available': 'seats available',
    'trips.view_details': 'View details',
    
    // Success Messages
    'success.trip_booked': 'Trip booked successfully!',
    'success.logout': 'Logged out successfully',
    
    // Error Messages
    'errors.load_trips': 'Error loading trips',
    'errors.book_trip': 'Error booking trip',
    'errors.logout': 'Error logging out',
    
    // Footer
    'footer.about.title': 'About Us',
    'footer.about.how_it_works': 'How it Works',
    'footer.about.company': 'About Company',
    'footer.about.press': 'Press',
    
    'footer.info.title': 'Information',
    'footer.info.help': 'Help',
    'footer.info.safety': 'Safety',
    'footer.info.terms': 'Terms & Conditions',
    
    'footer.contact.title': 'Contact',
    'footer.contact.support': 'Support',
    'footer.contact.contact_us': 'Contact Us',
    'footer.contact.partners': 'Partners',
    
    'footer.copyright': '© 2025 GoMoldova. All rights reserved.',
  },
  ru: {
    // Navigation
    'nav.offer_ride': 'Предложить поездку',
    'nav.login': 'Войти',
    'nav.logout': 'Выйти',
    
    // Hero Section
    'hero.title': 'Путешествуйте по Молдове с уверенностью',
    
    // Search
    'search.from_placeholder': 'Откуда?',
    'search.to_placeholder': 'Куда?',
    'search.button': 'Поиск',
    
    // Trip Listings
    'trips.available': 'Доступные поездки',
    'trips.seats_of': 'из',
    'trips.seats_available': 'свободных мест',
    'trips.view_details': 'Подробнее',
    
    // Success Messages
    'success.trip_booked': 'Поездка успешно забронирована!',
    'success.logout': 'Выход выполнен успешно',
    
    // Error Messages
    'errors.load_trips': 'Ошибка при загрузке поездок',
    'errors.book_trip': 'Ошибка при бронировании поездки',
    'errors.logout': 'Ошибка при выходе',
    
    // Footer
    'footer.about.title': 'О нас',
    'footer.about.how_it_works': 'Как это работает',
    'footer.about.company': 'О компании',
    'footer.about.press': 'Пресса',
    
    'footer.info.title': 'Информация',
    'footer.info.help': 'Помощь',
    'footer.info.safety': 'Безопасность',
    'footer.info.terms': 'Условия использования',
    
    'footer.contact.title': 'Контакты',
    'footer.contact.support': 'Поддержка',
    'footer.contact.contact_us': 'Связаться с нами',
    'footer.contact.partners': 'Партнеры',
    
    'footer.copyright': '© 2025 GoMoldova. Все права защищены.',
  },
};

export function useTranslation() {
  const { language } = useLanguageStore();
  
  const t = (key: TranslationKey): string => {
    return translations[language]?.[key] || key;
  };
  
  return { t };
}