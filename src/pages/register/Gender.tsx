import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import toast from 'react-hot-toast';

export function RegisterGender() {
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if previous steps are completed
    const email = sessionStorage.getItem('registration_email');
    const name = sessionStorage.getItem('registration_name');
    const birthdate = sessionStorage.getItem('registration_birthdate');
    if (!email || !name || !birthdate) {
      navigate('/register/email');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!gender) {
        throw new Error('Te rugăm să selectezi genul');
      }

      // Store gender in session storage
      sessionStorage.setItem('registration_gender', gender);
      navigate('/register/password');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Care este genul tău?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Pasul 4 din 5 • Gen
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  gender === 'male'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <span className="text-2xl mb-2 block">👨</span>
                <p className="font-medium">Bărbat</p>
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`p-4 border rounded-lg text-center transition-colors ${
                  gender === 'female'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <span className="text-2xl mb-2 block">👩</span>
                <p className="font-medium">Femeie</p>
              </button>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Înapoi
              </button>
              <button
                type="submit"
                disabled={isLoading || !gender}
                className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading || !gender ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mx-auto" />
                ) : (
                  'Continuă'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}