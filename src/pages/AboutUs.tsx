import React from 'react';
import { Car, Shield, Users, Award } from 'lucide-react';

export function AboutUs() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Despre MoldovaRide
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Conectăm șoferi și pasageri pentru călătorii sigure și convenabile în Moldova
          </p>
        </div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center">
                <Users className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">
                Comunitate de Încredere
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Peste 10,000 de utilizatori activi care împărtășesc experiențe pozitive
                de călătorie în toată Moldova.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <Shield className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">
                Siguranță Garantată
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Verificăm toți șoferii și menținem standarde înalte de siguranță
                pentru toate călătoriile.
              </p>
            </div>

            <div className="text-center">
              <div className="flex justify-center">
                <Award className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-gray-900">
                Experiență Premium
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Oferim o experiență de călătorie confortabilă și convenabilă la
                prețuri accesibile.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Povestea Noastră
          </h3>
          <div className="prose prose-lg mx-auto">
            <p className="text-gray-500">
              MoldovaRide a fost fondată în 2025 cu misiunea de a revoluționa
              transportul în Moldova. Am observat nevoia unui sistem de transport
              mai eficient și mai accesibil pentru toți cetățenii.
            </p>
            <p className="text-gray-500 mt-4">
              Platforma noastră conectează șoferi verificați cu pasageri,
              oferind o alternativă sigură și convenabilă la metodele
              tradiționale de transport. Ne mândrim cu crearea unei comunități
              unde încrederea și siguranța sunt prioritare.
            </p>
            <p className="text-gray-500 mt-4">
              Astăzi, MoldovaRide este liderul în domeniul ride-sharing în
              Moldova, facilitând mii de călătorii zilnic și contribuind la
              reducerea amprentei de carbon prin încurajarea călătoriilor
              partajate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}