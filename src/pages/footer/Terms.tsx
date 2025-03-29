import React from 'react';
import { FileText, Shield, AlertTriangle } from 'lucide-react';

export function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Termeni și condiții</h1>
          <p className="text-xl text-gray-600">
            Ultima actualizare: 15 Martie 2025
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mt-0">Rezumat</h2>
                <p className="text-gray-600">
                  Acest document stabilește termenii și condițiile de utilizare a platformei GoMoldova, drepturile și obligațiile utilizatorilor, precum și politicile noastre privind confidențialitatea și siguranța. Vă rugăm să citiți cu atenție acești termeni înainte de a utiliza serviciile noastre.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">1. Introducere</h2>
          <p>
            Bine ați venit pe GoMoldova! Acești Termeni și Condiții ("Termeni") guvernează utilizarea de către dvs. a aplicației web GoMoldova, inclusiv orice conținut, funcționalitate și servicii oferite pe sau prin platforma noastră.
          </p>
          <p>
            Prin accesarea sau utilizarea platformei noastre, sunteți de acord să respectați acești Termeni. Dacă nu sunteți de acord cu oricare dintre acești Termeni, vă rugăm să nu utilizați platforma noastră.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">2. Definiții</h2>
          <ul>
            <li><strong>"Platforma"</strong> se referă la aplicația web GoMoldova.</li>
            <li><strong>"Utilizator"</strong> se referă la orice persoană care accesează sau utilizează Platforma.</li>
            <li><strong>"Șofer"</strong> se referă la un Utilizator care oferă servicii de transport prin intermediul Platformei.</li>
            <li><strong>"Pasager"</strong> se referă la un Utilizator care solicită servicii de transport prin intermediul Platformei.</li>
            <li><strong>"Călătorie"</strong> se referă la serviciul de transport oferit de un Șofer unui Pasager prin intermediul Platformei.</li>
            <li><strong>"Conținut"</strong> se referă la orice informație, text, grafică, fotografii sau alte materiale încărcate, descărcate sau care apar pe Platformă.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">3. Înregistrare și cont</h2>
          <p>
            Pentru a utiliza anumite funcții ale Platformei, trebuie să vă înregistrați și să creați un cont. Când vă înregistrați, sunteți de acord să furnizați informații exacte, actuale și complete despre dvs. și să le actualizați pentru a le menține exacte, actuale și complete.
          </p>
          <p>
            Sunteți responsabil pentru păstrarea confidențialității parolei dvs. și pentru toate activitățile care au loc sub contul dvs. Sunteți de acord să ne notificați imediat cu privire la orice utilizare neautorizată a contului dvs. sau orice altă încălcare a securității.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">4. Utilizarea platformei</h2>
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">4.1 Reguli generale</h3>
          <p>
            Sunteți de acord să utilizați Platforma doar în scopuri legale și în conformitate cu acești Termeni. Sunteți de acord să nu utilizați Platforma:
          </p>
          <ul>
            <li>Într-un mod care încalcă orice lege sau reglementare aplicabilă.</li>
            <li>Pentru a exploata, a dăuna sau a încerca să exploateze sau să dăunați minorilor în orice mod.</li>
            <li>Pentru a transmite sau a procura trimiterea de materiale publicitare sau promoționale, inclusiv "spam", "email în lanț" sau "scheme piramidale".</li>
            <li>Pentru a vă prezenta sau a vă reprezenta în mod fals identitatea sau afilierea cu orice persoană sau organizație.</li>
            <li>Pentru a vă angaja în orice altă conduită care restricționează sau inhibă utilizarea sau bucuria Platformei de către oricine, sau care, după cum determinăm, poate dăuna GoMoldova sau utilizatorilor Platformei sau îi poate expune la răspundere.</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">4.2 Reguli specifice pentru Șoferi</h3>
          <p>
            Dacă vă înregistrați ca Șofer, sunteți de acord:
          </p>
          <ul>
            <li>Să dețineți un permis de conducere valid și să respectați toate legile și reglementările de trafic aplicabile.</li>
            <li>Să mențineți vehiculul dvs. în stare bună de funcționare și să respectați toate cerințele legale privind asigurarea și inspecția tehnică.</li>
            <li>Să nu consumați alcool sau droguri înainte sau în timpul unei Călătorii.</li>
            <li>Să respectați traseul și orarul convenite cu Pasagerul, cu excepția cazului în care ambele părți sunt de acord cu o modificare.</li>
            <li>Să tratați Pasagerii cu respect și să nu vă angajați în comportamente discriminatorii sau hărțuire.</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">4.3 Reguli specifice pentru Pasageri</h3>
          <p>
            Dacă utilizați Platforma ca Pasager, sunteți de acord:
          </p>
          <ul>
            <li>Să furnizați informații exacte despre identitatea dvs. și destinația dorită.</li>
            <li>Să respectați ora și locul de întâlnire convenite cu Șoferul.</li>
            <li>Să nu aduceți obiecte ilegale sau periculoase în vehiculul Șoferului.</li>
            <li>Să nu deteriorați vehiculul Șoferului și să mențineți un comportament adecvat în timpul Călătoriei.</li>
            <li>Să efectuați plata conform sumei convenite cu Șoferul.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">5. Plăți și tarife</h2>
          <p>
            Platforma GoMoldova facilitează doar conectarea Șoferilor cu Pasagerii. Plățile pentru Călătorii se efectuează direct între Pasager și Șofer, conform sumei afișate pe Platformă.
          </p>
          <p>
            În prezent, GoMoldova nu percepe comisioane pentru utilizarea Platformei. Ne rezervăm dreptul de a introduce tarife sau comisioane în viitor, cu notificare prealabilă către Utilizatori.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">6. Anulări și dispute</h2>
          <p>
            Șoferii și Pasagerii pot anula o Călătorie prin intermediul Platformei. Vă încurajăm să anulați cu cel puțin 24 de ore înainte de ora de plecare programată, pentru a minimiza inconvenientele pentru cealaltă parte.
          </p>
          <p>
            În cazul disputelor între Șoferi și Pasageri, GoMoldova va acționa doar ca mediator și nu va fi responsabilă pentru rezolvarea acestora. Vă încurajăm să rezolvați disputele în mod amiabil.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">7. Proprietate intelectuală</h2>
          <p>
            Platforma și tot conținutul, caracteristicile și funcționalitățile sale (inclusiv, dar fără a se limita la toate informațiile, software-ul, textele, afișajele, imaginile, videoclipurile și audio, precum și designul, selecția și aranjamentul acestora) sunt deținute de GoMoldova, licențiatorii săi sau alți furnizori ai acestui material și sunt protejate de legile Republicii Moldova și internaționale privind drepturile de autor, mărcile comerciale, brevetele, secretele comerciale și alte legi privind proprietatea intelectuală sau drepturile de proprietate.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">8. Confidențialitate</h2>
          <p>
            Utilizarea dvs. a Platformei este, de asemenea, supusă Politicii noastre de confidențialitate, care este încorporată prin referință în acești Termeni. Vă rugăm să consultați Politica noastră de confidențialitate pentru informații despre modul în care colectăm, utilizăm și dezvăluim informațiile despre dvs.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">9. Limitarea răspunderii</h2>
          <p>
            În niciun caz GoMoldova, afiliații săi sau licențiatorii, furnizorii de servicii, angajații, agenții, ofițerii sau directorii săi nu vor fi răspunzători pentru daune de orice fel, sub orice teorie juridică, care decurg din sau în legătură cu utilizarea sau incapacitatea dvs. de a utiliza Platforma, orice site-uri web legate de aceasta, orice conținut de pe Platformă sau astfel de alte site-uri web, inclusiv orice daune directe, indirecte, speciale, incidentale, consecutive sau punitive, inclusiv, dar fără a se limita la, vătămări personale, durere și suferință, tulburări emoționale, pierderea veniturilor, pierderea profiturilor, pierderea afacerilor sau economiilor anticipate, pierderea utilizării, pierderea fondului comercial, pierderea datelor, și indiferent dacă sunt cauzate de delict (inclusiv neglijență), încălcarea contractului sau altfel, chiar dacă era previzibil.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">10. Despăgubire</h2>
          <p>
            Sunteți de acord să apărați, să despăgubiți și să exonerați de răspundere GoMoldova, afiliații săi, licențiatorii și furnizorii de servicii, precum și ofițerii, directorii, angajații, contractorii, agenții, licențiatorii, furnizorii, succesorii și cesionarii săi de și împotriva oricăror revendicări, răspunderi, daune, judecăți, premii, pierderi, costuri, cheltuieli sau taxe (inclusiv onorariile rezonabile ale avocaților) care decurg din sau sunt legate de încălcarea de către dvs. a acestor Termeni sau utilizarea de către dvs. a Platformei.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">11. Modificări ale termenilor</h2>
          <p>
            Ne rezervăm dreptul, la discreția noastră, de a modifica sau înlocui acești Termeni în orice moment. Dacă o revizuire este materială, vom încerca să oferim o notificare cu cel puțin 30 de zile înainte ca orice noi termeni să intre în vigoare. Ceea ce constituie o schimbare materială va fi determinat la discreția noastră.
          </p>
          <p>
            Prin continuarea accesului sau utilizării Platformei noastre după ce aceste revizuiri devin efective, sunteți de acord să fiți obligat de termenii revizuiți. Dacă nu sunteți de acord cu noii termeni, vă rugăm să încetați utilizarea Platformei.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">12. Legea aplicabilă</h2>
          <p>
            Acești Termeni și orice dispute sau revendicări (inclusiv dispute sau revendicări necontractuale) care decurg din sau în legătură cu aceștia sau cu obiectul sau formarea lor vor fi guvernate și interpretate în conformitate cu legile Republicii Moldova.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">13. Contact</h2>
          <p>
            Întrebările despre Termeni ar trebui să ne fie trimise la legal@gomoldova.md.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg mt-12">
            <div className="flex items-start">
              <Shield className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mt-0">Acceptarea termenilor</h2>
                <p className="text-gray-600 mb-0">
                  Prin utilizarea platformei GoMoldova, confirmați că ați citit, înțeles și sunteți de acord să respectați acești Termeni și Condiții. Dacă nu sunteți de acord cu acești termeni, vă rugăm să nu utilizați platforma noastră.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}