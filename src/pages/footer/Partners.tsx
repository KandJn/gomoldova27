import React from 'react';
import { Users, Award, Briefcase, ArrowRight, Mail, Handshake, Globe, Shield } from 'lucide-react';

export function Partners() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Parteneri GoMoldova</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Colaborăm cu organizații și companii care împărtășesc viziunea noastră de a îmbunătăți mobilitatea în Moldova
          </p>
        </div>

        {/* Current Partners */}
        <div className="mb-20 animate-slide-up animation-delay-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Partenerii noștri</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-center h-32 hover-lift">
              <img 
                src="https://placehold.co/200x80/2563eb/ffffff?text=Moldova+Tourism" 
                alt="Moldova Tourism" 
                className="max-h-16"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-center h-32 hover-lift animation-delay-100">
              <img 
                src="https://placehold.co/200x80/2563eb/ffffff?text=EcoTravel" 
                alt="EcoTravel" 
                className="max-h-16"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-center h-32 hover-lift animation-delay-200">
              <img 
                src="https://placehold.co/200x80/2563eb/ffffff?text=MoldTech" 
                alt="MoldTech" 
                className="max-h-16"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-center h-32 hover-lift animation-delay-300">
              <img 
                src="https://placehold.co/200x80/2563eb/ffffff?text=GreenMobility" 
                alt="GreenMobility" 
                className="max-h-16"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-center h-32 hover-lift animation-delay-400">
              <img 
                src="https://placehold.co/200x80/2563eb/ffffff?text=City+Connect" 
                alt="City Connect" 
                className="max-h-16"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-center h-32 hover-lift animation-delay-500">
              <img 
                src="https://placehold.co/200x80/2563eb/ffffff?text=SafeRide" 
                alt="SafeRide" 
                className="max-h-16"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-center h-32 hover-lift animation-delay-600">
              <img 
                src="https://placehold.co/200x80/2563eb/ffffff?text=TechHub" 
                alt="TechHub" 
                className="max-h-16"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm flex items-center justify-center h-32 hover-lift animation-delay-700">
              <img 
                src="https://placehold.co/200x80/2563eb/ffffff?text=MoldovaIT" 
                alt="MoldovaIT" 
                className="max-h-16"
              />
            </div>
          </div>
        </div>

        {/* Partnership Benefits */}
        <div className="mb-20 animate-slide-up animation-delay-300">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Beneficiile parteneriatului</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 p-6 rounded-lg hover-scale">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Vizibilitate extinsă</h3>
              <p className="text-gray-600">
                Partenerii GoMoldova beneficiază de expunere către o comunitate în continuă creștere de utilizatori din întreaga țară, crescând vizibilitatea și recunoașterea brandului.
              </p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg hover-scale animation-delay-100">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Handshake className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Oportunități de colaborare</h3>
              <p className="text-gray-600">
                Creăm împreună campanii de marketing, promoții și inițiative speciale care aduc beneficii atât partenerilor noștri, cât și utilizatorilor platformei.
              </p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg hover-scale animation-delay-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Impact social și de mediu</h3>
              <p className="text-gray-600">
                Alăturându-vă GoMoldova, contribuiți la reducerea emisiilor de carbon și la îmbunătățirea mobilității în Moldova, demonstrând angajamentul față de sustenabilitate.
              </p>
            </div>
          </div>
        </div>

        {/* Partnership Types */}
        <div className="mb-20 animate-slide-up animation-delay-400">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Tipuri de parteneriate</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm hover-lift">
              <div className="flex items-center mb-4">
                <Briefcase className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">Parteneriate corporative</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Oferim soluții personalizate pentru companii care doresc să ofere angajaților lor opțiuni de transport mai eficiente și sustenabile.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Programe de navetă pentru angajați</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Reduceri pentru călătorii de afaceri</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Soluții de mobilitate pentru evenimente corporative</span>
                </li>
              </ul>
              <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center font-medium transition-all-300">
                Află mai multe
                <ArrowRight className="h-4 w-4 ml-1 transition-transform-300 group-hover:translate-x-1" />
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm hover-lift animation-delay-100">
              <div className="flex items-center mb-4">
                <Award className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">Parteneriate strategice</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Colaborăm cu organizații care împărtășesc viziunea noastră de a îmbunătăți mobilitatea și de a reduce amprenta de carbon în Moldova.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Integrări tehnologice</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Inițiative de sustenabilitate</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Proiecte de cercetare și dezvoltare</span>
                </li>
              </ul>
              <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center font-medium transition-all-300">
                Află mai multe
                <ArrowRight className="h-4 w-4 ml-1 transition-transform-300 group-hover:translate-x-1" />
              </a>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm hover-lift animation-delay-200">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-xl font-semibold text-gray-900">Parteneriate comunitare</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Lucrăm cu organizații locale, instituții educaționale și ONG-uri pentru a crea inițiative care aduc beneficii comunităților din Moldova.
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Programe educaționale</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Inițiative de incluziune socială</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Proiecte de dezvoltare comunitară</span>
                </li>
              </ul>
              <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center font-medium transition-all-300">
                Află mai multe
                <ArrowRight className="h-4 w-4 ml-1 transition-transform-300 group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-20 animate-slide-up animation-delay-500">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Povești de succes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm hover-lift">
              <div className="flex items-center mb-4">
                <img 
                  src="https://placehold.co/80x80/2563eb/ffffff?text=MT" 
                  alt="Moldova Tourism" 
                  className="w-16 h-16 rounded-lg mr-4"
                />
                <h3 className="text-xl font-semibold text-gray-900">Moldova Tourism</h3>
              </div>
              <p className="text-gray-600 mb-4">
                "Parteneriatul cu GoMoldova ne-a permis să oferim turiștilor o modalitate mai convenabilă și mai accesibilă de a explora țara noastră. Împreună, am creat rute turistice speciale și am facilitat accesul la atracții mai puțin cunoscute, contribuind la dezvoltarea turismului în regiunile rurale."
              </p>
              <p className="text-gray-900 font-medium">
                — Ana Popescu, Director de Marketing, Moldova Tourism
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm hover-lift animation-delay-100">
              <div className="flex items-center mb-4">
                <img 
                  src="https://placehold.co/80x80/2563eb/ffffff?text=ET" 
                  alt="EcoTravel" 
                  className="w-16 h-16 rounded-lg mr-4"
                />
                <h3 className="text-xl font-semibold text-gray-900">EcoTravel</h3>
              </div>
              <p className="text-gray-600 mb-4">
                "Colaborarea cu GoMoldova a fost un pas important în strategia noastră de promovare a turismului ecologic. Prin integrarea serviciilor noastre, am reușit să oferim experiențe de călătorie complete și sustenabile, reducând în același timp amprenta de carbon a turiștilor care vizitează Moldova."
              </p>
              <p className="text-gray-900 font-medium">
                — Mihai Lungu, CEO, EcoTravel
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-blue-600 rounded-lg p-8 text-white animate-slide-up animation-delay-600">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Devino partener GoMoldova</h2>
            <p className="text-blue-100 max-w-2xl mx-auto">
              Ești interesat să devii partener? Completează formularul de mai jos și echipa noastră te va contacta în cel mai scurt timp.
            </p>
          </div>
          
          <div className="max-w-xl mx-auto">
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-blue-100 mb-1">
                    Numele companiei
                  </label>
                  <input
                    type="text"
                    id="company"
                    className="w-full px-4 py-2 border border-blue-400 bg-blue-50 bg-opacity-10 rounded-md text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
                    placeholder="Compania dvs."
                  />
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-blue-100 mb-1">
                    Persoana de contact
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-2 border border-blue-400 bg-blue-50 bg-opacity-10 rounded-md text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
                    placeholder="Numele dvs."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border border-blue-400 bg-blue-50 bg-opacity-10 rounded-md text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
                    placeholder="email@companie.md"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-blue-100 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-2 border border-blue-400 bg-blue-50 bg-opacity-10 rounded-md text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
                    placeholder="+373 XX XXX XXX"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="partnership" className="block text-sm font-medium text-blue-100 mb-1">
                  Tipul de parteneriat dorit
                </label>
                <select
                  id="partnership"
                  className="w-full px-4 py-2 border border-blue-400 bg-blue-50 bg-opacity-10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <option value="" className="text-gray-900">Selectați tipul de parteneriat</option>
                  <option value="corporate" className="text-gray-900">Parteneriat corporativ</option>
                  <option value="strategic" className="text-gray-900">Parteneriat strategic</option>
                  <option value="community" className="text-gray-900">Parteneriat comunitar</option>
                  <option value="other" className="text-gray-900">Alt tip de parteneriat</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-blue-100 mb-1">
                  Mesaj
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-2 border border-blue-400 bg-blue-50 bg-opacity-10 rounded-md text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
                  placeholder="Descrieți pe scurt interesul dvs. pentru un parteneriat cu GoMoldova"
                ></textarea>
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all-300"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Trimite solicitarea
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}