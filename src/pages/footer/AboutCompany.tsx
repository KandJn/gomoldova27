import React from 'react';
import { Car, Users, Globe, Award, TrendingUp, Heart } from 'lucide-react';

export function AboutCompany() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Despre GoMoldova</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transformăm modul în care oamenii călătoresc în Moldova, făcând transportul mai accesibil, mai eficient și mai prietenos
          </p>
        </div>

        {/* Our Story */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Povestea noastră</h2>
              <div className="prose prose-lg text-gray-600">
                <p>
                  GoMoldova a fost fondată în 2025 cu misiunea de a revoluționa transportul în Moldova. Am observat nevoia unui sistem de transport mai eficient și mai accesibil pentru toți cetățenii.
                </p>
                <p>
                  Ideea a apărut când fondatorii noștri, un grup de tineri antreprenori moldoveni, au observat dificultățile cu care se confruntă oamenii în călătoriile între orașe. Transportul public era limitat, iar taxiurile erau costisitoare pentru mulți.
                </p>
                <p>
                  Am creat GoMoldova pentru a conecta șoferii care au locuri libere în mașini cu pasagerii care au nevoie de transport. Platforma noastră oferă o soluție win-win: șoferii își reduc costurile de călătorie, iar pasagerii obțin un mijloc de transport convenabil și accesibil.
                </p>
                <p>
                  Astăzi, GoMoldova este liderul în domeniul ride-sharing în Moldova, facilitând mii de călătorii zilnic și contribuind la reducerea amprentei de carbon prin încurajarea călătoriilor partajate.
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1581084324492-c8076f130f86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Moldova landscape" 
                className="rounded-lg shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-6 rounded-lg shadow-lg">
                <p className="text-2xl font-bold">2025</p>
                <p>Anul fondării</p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Mission & Vision */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-blue-50 p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Globe className="h-6 w-6 text-blue-600 mr-2" />
                Misiunea noastră
              </h2>
              <p className="text-gray-600">
                Misiunea GoMoldova este să conectăm oamenii și să facem călătoriile mai accesibile pentru toți. Ne străduim să creăm o comunitate de călători care împărtășesc nu doar un vehicul, ci și experiențe, povești și prietenii.
              </p>
              <p className="text-gray-600 mt-4">
                Vrem să transformăm fiecare călătorie într-o experiență plăcută și să reducem barierele de mobilitate în întreaga țară, contribuind în același timp la un viitor mai sustenabil.
              </p>
            </div>
            
            <div className="bg-green-50 p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
                Viziunea noastră
              </h2>
              <p className="text-gray-600">
                Ne imaginăm o Moldovă în care oamenii pot călători liber, eficient și sustenabil între toate localitățile, indiferent de dimensiunea sau locația acestora.
              </p>
              <p className="text-gray-600 mt-4">
                Viziunea noastră este să devenim platforma de referință pentru mobilitate partajată în Moldova și să extindem acest model în întreaga regiune, contribuind la crearea unui sistem de transport mai inteligent și mai prietenos cu mediul.
              </p>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Valorile noastre</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comunitate</h3>
              <p className="text-gray-600">
                Credem în puterea comunității și în conexiunile umane. Platforma noastră nu este doar despre transport, ci despre oameni care se ajută reciproc.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Calitate</h3>
              <p className="text-gray-600">
                Ne angajăm să oferim cea mai bună experiență posibilă. Calitatea serviciilor și satisfacția utilizatorilor sunt prioritățile noastre principale.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sustenabilitate</h3>
              <p className="text-gray-600">
                Suntem dedicați protejării mediului. Prin încurajarea călătoriilor partajate, contribuim la reducerea emisiilor de carbon și la un viitor mai verde.
              </p>
            </div>
          </div>
        </div>

        {/* Our Team */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Echipa noastră</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <img 
                src="https://randomuser.me/api/portraits/men/32.jpg" 
                alt="Alexandru Munteanu" 
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold">Alexandru Munteanu</h3>
              <p className="text-blue-600 mb-2">Co-fondator & CEO</p>
              <p className="text-gray-600 text-sm">
                Antreprenor cu experiență în tech și mobilitate urbană
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <img 
                src="https://randomuser.me/api/portraits/women/44.jpg" 
                alt="Maria Cojocaru" 
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold">Maria Cojocaru</h3>
              <p className="text-blue-600 mb-2">Co-fondator & COO</p>
              <p className="text-gray-600 text-sm">
                Expert în operațiuni și dezvoltare de afaceri
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <img 
                src="https://randomuser.me/api/portraits/men/67.jpg" 
                alt="Ion Rusu" 
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold">Ion Rusu</h3>
              <p className="text-blue-600 mb-2">CTO</p>
              <p className="text-gray-600 text-sm">
                Inginer software cu peste 10 ani de experiență
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <img 
                src="https://randomuser.me/api/portraits/women/17.jpg" 
                alt="Elena Popescu" 
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold">Elena Popescu</h3>
              <p className="text-blue-600 mb-2">CMO</p>
              <p className="text-gray-600 text-sm">
                Specialist în marketing digital și comunicare
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-20">
          <div className="bg-blue-600 rounded-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-8 text-center">GoMoldova în cifre</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold mb-2">10,000+</p>
                <p className="text-blue-100">Utilizatori activi</p>
              </div>
              
              <div className="text-center">
                <p className="text-4xl font-bold mb-2">5,000+</p>
                <p className="text-blue-100">Călătorii lunare</p>
              </div>
              
              <div className="text-center">
                <p className="text-4xl font-bold mb-2">30+</p>
                <p className="text-blue-100">Orașe conectate</p>
              </div>
              
              <div className="text-center">
                <p className="text-4xl font-bold mb-2">500+</p>
                <p className="text-blue-100">Tone CO2 economisite</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contactează-ne</h2>
          <p className="text-lg text-gray-600 mb-8">
            Ai întrebări sau sugestii? Echipa noastră este aici pentru tine.
          </p>
          <a
            href="mailto:contact@gomoldova.md"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Trimite un email
          </a>
        </div>
      </div>
    </div>
  );
}