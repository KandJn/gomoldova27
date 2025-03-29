import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Car, UsersIcon, Shield, Star, Heart, Search, Check, Bus, User } from 'lucide-react';
import { PlacesAutocomplete } from '../components/PlacesAutocomplete';
import { useSearchStore } from '../lib/store';

export function HomePage() {
  const searchParams = useSearchStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative min-h-screen bg-gradient-to-b from-blue-200 via-blue-100 to-blue-50">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-300/20 to-transparent"></div>
        <div className="relative py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-fade-in">
                Călătorește în Moldova<br />cu încredere și confort
              </h1>
              <p className="text-xl text-gray-600 mb-12 animate-fade-in-delay">
                Găsește cele mai bune oferte pentru călătoria ta
              </p>
              
              <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto transform hover:scale-[1.01] transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                      Plecare
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-blue-600" />
                      <PlacesAutocomplete
                        value={searchParams.from}
                        onChange={(value) =>
                          searchParams.setSearch({ ...searchParams, from: value })
                        }
                        placeholder="De unde pleci?"
                        className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                      Destinație
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-blue-600" />
                      <PlacesAutocomplete
                        value={searchParams.to}
                        onChange={(value) =>
                          searchParams.setSearch({ ...searchParams, to: value })
                        }
                        placeholder="Unde mergi?"
                        className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                      Data
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-blue-600" />
                      <input
                        type="date"
                        className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchParams.date}
                        onChange={(e) =>
                          searchParams.setSearch({ ...searchParams, date: e.target.value })
                        }
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                </div>
                <Link
                  to="/trips"
                  className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 inline-block text-center text-lg font-semibold transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Caută Călătoria
                </Link>
              </div>

              {/* Stats Section */}
              <div className="mt-24 py-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-white">
                  <div className="text-center transform hover:scale-105 transition-all duration-300">
                    <div className="bg-white/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <UsersIcon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-4xl font-bold mb-2">50K+</div>
                    <div className="text-blue-100">Călători mulțumiți</div>
                  </div>
                  <div className="text-center transform hover:scale-105 transition-all duration-300">
                    <div className="bg-white/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-4xl font-bold mb-2">100+</div>
                    <div className="text-blue-100">Rute zilnice</div>
                  </div>
                  <div className="text-center transform hover:scale-105 transition-all duration-300">
                    <div className="bg-white/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Star className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-4xl font-bold mb-2">4.8/5</div>
                    <div className="text-blue-100">Rating mediu</div>
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="mt-24">
                <h2 className="text-3xl font-bold text-gray-900 mb-12">De ce să alegi GoMoldova?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="bg-blue-50 p-4 rounded-full w-16 h-16 mx-auto mb-6 transform hover:rotate-6 transition-all duration-300">
                      <Shield className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Călătorie Sigură</h3>
                    <p className="text-gray-600">
                      Șoferi verificați și recenzii pentru siguranța ta. Sistem de rating transparent.
                    </p>
                  </div>
                  <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="bg-blue-50 p-4 rounded-full w-16 h-16 mx-auto mb-6 transform hover:rotate-6 transition-all duration-300">
                      <Star className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Confort Premium</h3>
                    <p className="text-gray-600">
                      Transport modern și confortabil. Vehicule verificate și întreținute regulat.
                    </p>
                  </div>
                  <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="bg-blue-50 p-4 rounded-full w-16 h-16 mx-auto mb-6 transform hover:rotate-6 transition-all duration-300">
                      <Heart className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">Prețuri Accesibile</h3>
                    <p className="text-gray-600">
                      Cele mai bune oferte pentru călătoria ta. Prețuri transparente, fără costuri ascunse.
                    </p>
                  </div>
                </div>
              </div>

              {/* Popular Routes Section */}
              <div className="mt-24">
                <h2 className="text-3xl font-bold text-gray-900 mb-12">Rute Populare</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?q=80&w=1000" 
                        alt="Chișinău" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="text-lg font-semibold">Chișinău → Bălți</div>
                        <div className="text-sm opacity-90">de la 100 MDL</div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-blue-600" />
                          2 ore
                        </div>
                        <div className="flex items-center">
                          <Car className="h-4 w-4 mr-2 text-blue-600" />
                          20+ călătorii zilnic
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?q=80&w=1000" 
                        alt="Chișinău" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="text-lg font-semibold">Chișinău → Orhei</div>
                        <div className="text-sm opacity-90">de la 80 MDL</div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-blue-600" />
                          1.5 ore
                        </div>
                        <div className="flex items-center">
                          <Car className="h-4 w-4 mr-2 text-blue-600" />
                          15+ călătorii zilnic
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?q=80&w=1000" 
                        alt="Chișinău" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="text-lg font-semibold">Chișinău → Cahul</div>
                        <div className="text-sm opacity-90">de la 150 MDL</div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-blue-600" />
                          3 ore
                        </div>
                        <div className="flex items-center">
                          <Car className="h-4 w-4 mr-2 text-blue-600" />
                          10+ călătorii zilnic
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* How It Works Section */}
              <div className="mt-24 py-16 relative">
                <div className="absolute inset-0 bg-blue-50 opacity-50" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%234B88EB\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
                <div className="relative max-w-4xl mx-auto">
                  <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Cum Funcționează</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-blue-200 -z-10"></div>
                    <div className="flex flex-col items-center transform hover:scale-105 transition-all duration-300">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-full mb-6 shadow-lg">
                        <Search className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-4">1. Caută</h3>
                      <p className="text-gray-600 text-center">
                        Introdu detaliile călătoriei și găsește rutele disponibile
                      </p>
                    </div>
                    <div className="flex flex-col items-center transform hover:scale-105 transition-all duration-300">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-full mb-6 shadow-lg">
                        <Check className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-4">2. Rezervă</h3>
                      <p className="text-gray-600 text-center">
                        Alege călătoria potrivită și rezervă locul tău în câteva click-uri
                      </p>
                    </div>
                    <div className="flex flex-col items-center transform hover:scale-105 transition-all duration-300">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-full mb-6 shadow-lg">
                        <Car className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-4">3. Călătorește</h3>
                      <p className="text-gray-600 text-center">
                        Bucură-te de o călătorie confortabilă și sigură
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonials Section */}
              <div className="mt-24">
                <h2 className="text-3xl font-bold text-gray-900 mb-12">Ce Spun Călătorii Noștri</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center mb-6">
                      <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Maria D.</div>
                        <div className="text-sm text-gray-500">Chișinău → Bălți</div>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      "Serviciu excelent! Șoferul a fost punctual și amabil, iar călătoria a fost foarte confortabilă."
                    </p>
                    <div className="flex items-center mt-4 text-yellow-400">
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center mb-6">
                      <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Ion P.</div>
                        <div className="text-sm text-gray-500">Chișinău → Orhei</div>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      "Prețuri accesibile și sistem de rezervare foarte simplu de folosit. Recomand cu încredere!"
                    </p>
                    <div className="flex items-center mt-4 text-yellow-400">
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center mb-6">
                      <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mr-4">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Ana M.</div>
                        <div className="text-sm text-gray-500">Chișinău → Cahul</div>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      "Călătoresc frecvent cu GoMoldova și sunt foarte mulțumită de servicii. Mașini curate și șoferi profesioniști."
                    </p>
                    <div className="flex items-center mt-4 text-yellow-400">
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                      <Star className="h-5 w-5 fill-current" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bus Company CTA Section */}
              <div className="mt-24 mb-16">
                <div className="bg-gradient-to-br from-blue-50 to-white p-12 rounded-2xl shadow-sm max-w-2xl mx-auto border border-blue-100 transform hover:scale-[1.02] transition-all duration-300">
                  <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 transform hover:rotate-6 transition-all duration-300">
                    <Bus className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Pentru Companiile de Transport</h2>
                  <p className="text-gray-600 mb-8 text-lg">
                    Devino partener GoMoldova și crește-ți afacerea. Beneficiază de o platformă modernă și un flux constant de călători.
                  </p>
                  <Link
                    to="/bus-company-registration"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-blue-800 inline-flex items-center space-x-3 text-lg font-medium transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <span>Înregistrează-te Acum</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 