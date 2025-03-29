import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, isValid, parse, differenceInYears } from 'date-fns';
import { ro } from 'date-fns/locale';

export function RegisterBirthYear() {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if previous steps are completed
    const email = sessionStorage.getItem('registration_email');
    const name = sessionStorage.getItem('registration_name');
    if (!email || !name) {
      navigate('/register/email');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate individual components
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      if (!dayNum || !monthNum || !yearNum) {
        throw new Error('Te rugăm să completezi data nașterii');
      }

      // Create date string in ISO format for validation
      const dateStr = `${yearNum}-${monthNum.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
      const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
      
      if (!isValid(parsedDate)) {
        throw new Error('Data nașterii nu este validă');
      }

      const age = differenceInYears(new Date(), parsedDate);
      
      if (age < 18) {
        throw new Error('Trebuie să ai cel puțin 18 ani pentru a utiliza platforma');
      }

      if (age > 100) {
        throw new Error('Data nașterii nu este validă');
      }

      // Store birth date in session storage in ISO format
      sessionStorage.setItem('registration_birthdate', dateStr);
      navigate('/register/gender');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate options for days, months, and years
  const generateDays = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(i.toString().padStart(2, '0'));
    }
    return days;
  };

  const months = [
    { value: '01', label: 'Ianuarie' },
    { value: '02', label: 'Februarie' },
    { value: '03', label: 'Martie' },
    { value: '04', label: 'Aprilie' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Iunie' },
    { value: '07', label: 'Iulie' },
    { value: '08', label: 'August' },
    { value: '09', label: 'Septembrie' },
    { value: '10', label: 'Octombrie' },
    { value: '11', label: 'Noiembrie' },
    { value: '12', label: 'Decembrie' },
  ];

  const generateYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 100;
    const maxYear = currentYear - 18;
    for (let i = maxYear; i >= minYear; i--) {
      years.push(i.toString());
    }
    return years;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Care este data ta de naștere?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Pasul 3 din 5 • Data nașterii
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data nașterii
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="day" className="sr-only">Zi</label>
                  <select
                    id="day"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Zi</option>
                    {generateDays().map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="month" className="sr-only">Lună</label>
                  <select
                    id="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Lună</option>
                    {months.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="year" className="sr-only">An</label>
                  <select
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">An</option>
                    {generateYears().map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Trebuie să ai cel puțin 18 ani pentru a utiliza platforma
              </p>
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
                disabled={isLoading}
                className={`flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
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