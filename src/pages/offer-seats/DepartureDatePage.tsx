import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addDays, isBefore } from 'date-fns';
import { ro } from 'date-fns/locale';

export function DepartureDatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const departureData = location.state?.departure;
  const arrivalData = location.state?.arrival;
  const routeData = location.state?.route;
  const stopoversData = location.state?.stopovers;

  const today = new Date();

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    const previousMonth = subMonths(currentMonth, 1);
    if (isSameMonth(previousMonth, today) || isBefore(today, previousMonth)) {
      setCurrentMonth(previousMonth);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleContinue = () => {
    if (!selectedDate) {
      return;
    }

    navigate('/offer-seats/departure-date/time', {
      state: {
        departure: departureData,
        arrival: arrivalData,
        route: routeData,
        stopovers: stopoversData,
        date: format(selectedDate, 'yyyy-MM-dd')
      }
    });
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const dayNames = ['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'];
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-gray-100"
            disabled={isSameMonth(currentMonth, today)}
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy', { locale: ro })}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((day, i) => {
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
            const isCurrentDay = isToday(day);
            const isPastDay = isBefore(day, today) && !isToday(day);
            
            return (
              <button
                key={i}
                onClick={() => handleDateSelect(day)}
                disabled={isPastDay}
                className={`
                  h-10 w-10 rounded-full flex items-center justify-center text-sm
                  ${isPastDay ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                  ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                  ${isCurrentDay && !isSelected ? 'border border-blue-600 text-blue-600' : ''}
                `}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Înapoi
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Când plecați?
          </h1>
          <p className="mt-2 text-gray-600">
            Selectați data plecării
          </p>
        </div>

        {renderCalendar()}

        <div className="mt-8">
          <button
            onClick={handleContinue}
            disabled={!selectedDate}
            className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white ${
              selectedDate ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <Check className="h-5 w-5 mr-2" />
            Continuă
          </button>
        </div>
      </div>
    </div>
  );
}