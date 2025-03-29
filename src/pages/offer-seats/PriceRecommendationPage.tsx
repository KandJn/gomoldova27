import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';

export function PriceRecommendationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [price, setPrice] = useState<number>(100);
  const [recommendedPrice, setRecommendedPrice] = useState<number>(100);
  const [priceRange, setPriceRange] = useState<{min: number, max: number}>({min: 80, max: 120});
  
  const departureData = location.state?.departure;
  const arrivalData = location.state?.arrival;
  const routeData = location.state?.route;
  const stopoversData = location.state?.stopovers;
  const dateData = location.state?.date;
  const timeData = location.state?.time;
  const seatsData = location.state?.seats;
  const maxBackSeatsData = location.state?.maxBackSeats;

  useEffect(() => {
    if (routeData) {
      // Calculate recommended price based on distance and other factors
      const distance = routeData.distance.value / 1000; // km
      
      // Base price calculation (more realistic for Moldova)
      // Approximately 2.5 MDL per km for shorter trips, decreasing for longer trips
      let basePrice = 0;
      
      if (distance <= 50) {
        // Short trips: higher per-km rate
        basePrice = Math.round(distance * 2.5);
      } else if (distance <= 100) {
        // Medium trips: medium per-km rate
        basePrice = Math.round(125 + (distance - 50) * 2);
      } else {
        // Long trips: lower per-km rate
        basePrice = Math.round(225 + (distance - 100) * 1.5);
      }
      
      // Adjust for time of day (peak hours cost more)
      const hour = parseInt(timeData?.split(':')[0] || '12');
      const peakHourMultiplier = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19) ? 1.15 : 1;
      
      // Adjust for day of week (weekends might cost more)
      const date = new Date(dateData);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const weekendMultiplier = isWeekend ? 1.1 : 1;
      
      // Calculate final recommended price
      const calculatedPrice = Math.round(basePrice * peakHourMultiplier * weekendMultiplier);
      
      // Set recommended price and range
      setRecommendedPrice(calculatedPrice);
      setPriceRange({
        min: Math.round(calculatedPrice * 0.8),
        max: Math.round(calculatedPrice * 1.2)
      });
      setPrice(calculatedPrice);
    }
  }, [routeData, dateData, timeData]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseInt(e.target.value);
    if (!isNaN(newPrice) && newPrice >= 0) {
      setPrice(newPrice);
    }
  };

  const adjustPrice = (amount: number) => {
    const newPrice = Math.max(0, price + amount);
    setPrice(newPrice);
  };

  const getPriceComparisonText = () => {
    const diff = price - recommendedPrice;
    const percentage = Math.round((diff / recommendedPrice) * 100);
    
    if (Math.abs(percentage) < 5) {
      return (
        <span className="text-green-600 flex items-center">
          Preț recomandat
        </span>
      );
    } else if (diff > 0) {
      return (
        <span className="text-orange-600 flex items-center">
          <TrendingUp className="h-4 w-4 mr-1" />
          Cu {percentage}% mai mare decât prețul recomandat
        </span>
      );
    } else {
      return (
        <span className="text-blue-600 flex items-center">
          <TrendingDown className="h-4 w-4 mr-1" />
          Cu {Math.abs(percentage)}% mai mic decât prețul recomandat
        </span>
      );
    }
  };

  const handleContinue = () => {
    navigate('/offer-seats/return-trip', {
      state: {
        departure: departureData,
        arrival: arrivalData,
        route: routeData,
        stopovers: stopoversData,
        date: dateData,
        time: timeData,
        seats: seatsData,
        maxBackSeats: maxBackSeatsData,
        price: price
      }
    });
  };

  // Generate popular prices based on the route and recommended price
  const getPopularPrices = () => {
    const popular = [
      recommendedPrice,
      Math.round(recommendedPrice * 0.9),
      Math.round(recommendedPrice * 1.1)
    ];
    
    // Add some common rounded prices
    if (recommendedPrice > 100) {
      const roundedDown = Math.floor(recommendedPrice / 10) * 10;
      const roundedUp = Math.ceil(recommendedPrice / 10) * 10;
      popular.push(roundedDown, roundedUp);
    }
    
    // Add a premium option
    popular.push(Math.round(recommendedPrice * 1.2));
    
    // Sort and remove duplicates
    return [...new Set(popular)].sort((a, b) => a - b);
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
            Stabiliți prețul per loc
          </h1>
          <p className="mt-2 text-gray-600">
            Prețul recomandat este bazat pe distanță, cerere și ora călătoriei
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-center mb-6">
            <CreditCard className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Preț per pasager
            </h2>
          </div>

          <div className="flex items-center justify-center mb-8">
            <button
              onClick={() => adjustPrice(-10)}
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-medium"
            >
              -
            </button>
            <div className="mx-4 w-32">
              <input
                type="number"
                value={price}
                onChange={handlePriceChange}
                min="0"
                className="w-full text-center text-3xl font-bold border-0 focus:ring-0"
              />
              <div className="text-center text-gray-500">MDL</div>
            </div>
            <button
              onClick={() => adjustPrice(10)}
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-medium"
            >
              +
            </button>
          </div>

          <div className="text-center text-sm mb-6">
            {getPriceComparisonText()}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Prețuri populare pe această rută:</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {getPopularPrices().map((p) => (
                <button
                  key={p}
                  onClick={() => setPrice(p)}
                  className={`px-4 py-2 rounded-full ${
                    price === p
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {p} MDL
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="font-medium text-gray-900 mb-4">Informații despre preț</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              Prețul recomandat este calculat în baza distanței de {Math.round(routeData?.distance?.value / 1000 || 0)} km
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              Călătoriile în orele de vârf (7-9, 16-19) pot avea prețuri mai mari
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              Prețurile în weekend pot fi cu 10% mai mari
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              Un preț competitiv vă ajută să găsiți mai ușor pasageri
            </li>
          </ul>
        </div>

        <button
          onClick={handleContinue}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Check className="h-5 w-5 mr-2" />
          Continuă
        </button>
      </div>
    </div>
  );
}