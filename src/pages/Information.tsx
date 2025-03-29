import React from 'react';
import { HelpCircle, Shield, AlertTriangle, FileText } from 'lucide-react';

export function Information() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Informații Utile
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Tot ce trebuie să știi despre utilizarea platformei MoldovaRide
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <HelpCircle className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Cum Funcționează</h3>
            </div>
            <div className="space-y-4">
              <p className="text-gray-500">
                1. Creează-ți un cont gratuit pe platformă
              </p>
              <p className="text-gray-500">
                2. Caută călătoria dorită sau oferă un loc în mașina ta
              </p>
              <p className="text-gray-500">
                3. Rezervă sau creează o călătorie în câțiva pași simpli
              </p>
              <p className="text-gray-500">
                4. Călătorește în siguranță și confort
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Siguranță</h3>
            </div>
            <div className="space-y-4">
              <p className="text-gray-500">
                • Verificăm identitatea tuturor utilizatorilor
              </p>
              <p className="text-gray-500">
                • Sistem de evaluare și feedback pentru șoferi și pasageri
              </p>
              <p className="text-gray-500">
                • Monitorizare 24/7 a călătoriilor
              </p>
              <p className="text-gray-500">
                • Asigurare pentru toate călătoriile
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Reguli și Recomandări</h3>
            </div>
            <ul className="space-y-4 text-gray-500">
              <li>• Respectă ora și locul de întâlnire</li>
              <li>• Anunță din timp orice modificare</li>
              <li>• Păstrează curățenia în mașină</li>
              <li>• Oferă feedback după călătorie</li>
              <li>• Respectă regulile de distanțare socială când este cazul</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Documente Necesare</h3>
            </div>
            <div className="space-y-4">
              <p className="text-gray-500">
                <strong>Pentru Șoferi:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-500">
                <li>Permis de conducere valid</li>
                <li>Carte de identitate</li>
                <li>Asigurare auto</li>
                <li>Revizie tehnică la zi</li>
              </ul>
              <p className="text-gray-500 mt-4">
                <strong>Pentru Pasageri:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-500">
                <li>Carte de identitate</li>
                <li>Email valid pentru confirmări</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}