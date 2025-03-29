import React from 'react';
import { ArrowRight, Check, MapPin, Calendar, Clock, Users, MessageCircle, CreditCard, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HowItWorks() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cum funcționează GoMoldova</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Platforma noastră conectează șoferi și pasageri pentru călătorii sigure și convenabile în Moldova
          </p>
        </div>

        {/* For Passengers */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Pentru pasageri</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-blue-50 p-8 rounded-lg relative">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold absolute -top-6 left-1/2 transform -translate-x-1/2">1</div>
              <h3 className="text-xl font-semibold mb-4 text-center pt-4">Caută o călătorie</h3>
              <p className="text-gray-600 mb-4">
                Introduceți locația de plecare, destinația și data pentru a găsi călătoriile disponibile care se potrivesc nevoilor dvs.
              </p>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-gray-700">Selectați punctele de plecare și sosire</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-gray-700">Alegeți data călătoriei</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-8 rounded-lg relative">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold absolute -top-6 left-1/2 transform -translate-x-1/2">2</div>
              <h3 className="text-xl font-semibold mb-4 text-center pt-4">Rezervă locul</h3>
              <p className="text-gray-600 mb-4">
                Alegeți călătoria care vi se potrivește cel mai bine și rezervați locul dvs. cu un singur clic. Șoferul va confirma rezervarea.
              </p>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                  <Users className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-gray-700">Verificați profilul șoferului și recenziile</span>
                </div>
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-gray-700">Vedeți prețul per loc</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-8 rounded-lg relative">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold absolute -top-6 left-1/2 transform -translate-x-1/2">3</div>
              <h3 className="text-xl font-semibold mb-4 text-center pt-4">Călătorește</h3>
              <p className="text-gray-600 mb-4">
                Întâlniți-vă cu șoferul la locul și ora stabilite. Bucurați-vă de călătorie și lăsați o recenzie după ce ajungeți la destinație.
              </p>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                  <MessageCircle className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-gray-700">Comunicați cu șoferul prin chat</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-gray-700">Evaluați experiența după călătorie</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* For Drivers */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Pentru șoferi</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-green-50 p-8 rounded-lg relative">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold absolute -top-6 left-1/2 transform -translate-x-1/2">1</div>
              <h3 className="text-xl font-semibold mb-4 text-center pt-4">Publică o călătorie</h3>
              <p className="text-gray-600 mb-4">
                Introduceți detaliile călătoriei dvs.: punctele de plecare și sosire, data, ora și numărul de locuri disponibile.
              </p>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                  <MapPin className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-gray-700">Specificați traseul exact</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-gray-700">Setați ora de plecare</span>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-8 rounded-lg relative">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold absolute -top-6 left-1/2 transform -translate-x-1/2">2</div>
              <h3 className="text-xl font-semibold mb-4 text-center pt-4">Gestionează rezervările</h3>
              <p className="text-gray-600 mb-4">
                Primiți cereri de rezervare de la pasageri și decideți pe cine acceptați. Comunicați cu pasagerii prin chat.
              </p>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                  <Users className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-gray-700">Verificați profilurile pasagerilor</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-gray-700">Acceptați sau respingeți cererile</span>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-8 rounded-lg relative">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold absolute -top-6 left-1/2 transform -translate-x-1/2">3</div>
              <h3 className="text-xl font-semibold mb-4 text-center pt-4">Călătorește și economisește</h3>
              <p className="text-gray-600 mb-4">
                Întâlniți-vă cu pasagerii, efectuați călătoria și împărțiți costurile. Reduceți cheltuielile și faceți călătoria mai plăcută.
              </p>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center mb-2">
                  <CreditCard className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-gray-700">Acoperiți costurile de combustibil</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-gray-700">Călătoriți în siguranță</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Beneficii</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Pentru pasageri</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Economisiți bani comparativ cu alte mijloace de transport</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Călătoriți direct până la destinație, fără opriri multiple</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Flexibilitate în alegerea orei și locului de plecare</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Cunoașteți oameni noi și faceți călătoria mai plăcută</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Contribuiți la reducerea emisiilor de carbon</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Pentru șoferi</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Reduceți costurile de combustibil și întreținere</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Faceți călătoriile mai interesante cu companie plăcută</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Contribuiți la decongestionarea traficului</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Ajutați alți oameni să călătorească mai ușor</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Reduceți amprenta de carbon prin împărțirea călătoriei</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Gata să începi?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Alătură-te comunității GoMoldova și descoperă un mod mai bun de a călători
          </p>
          <Link
            to="/trips"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Caută o călătorie
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}