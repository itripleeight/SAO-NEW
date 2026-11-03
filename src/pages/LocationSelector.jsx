import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaLocationArrow } from 'react-icons/fa';
import LocationMap from '../components/locations/LocationMap';
import LocationCard from '../components/locations/LocationCard';

const LocationSelector = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [sortedLocations, setSortedLocations] = useState([]);
  const [showSortingNotification, setShowSortingNotification] = useState(false);

  const locations = [
    {
      id: 'georgetown',
      name: 'Georgetown',
      address: '232A Guelph Street, Unit 8',
      city: 'Georgetown, ON L7G 4A8',
      phone: '+1 905-877-5559',
      email: 'shawarmaally@gmail.com',
      hours: 'Sun-Wed: 10:30AM - 11PM\nThu-Sat: 10:30AM - 1AM',
      coordinates: { lat: 43.6426, lng: -79.9071 },
      image: 'https://images.pexels.com/photos/2253643/pexels-photo-2253643.jpeg'
    },
    {
      id: 'guelph',
      name: 'Guelph',
      address: '43 Macdonell Street',
      city: 'Guelph, ON N1H 2Z4',
      phone: '+1 519-763-3198',
      email: 'shawarmaally@gmail.com',
      hours: 'Sun-Sat: 11AM - 3AM',
      coordinates: { lat: 43.5448, lng: -80.2482 },
      image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg'
    },
    {
      id: 'milton',
      name: 'Milton',
      address: '295 Main St E',
      city: 'Milton, ON L9T 1P1',
      phone: '+1 905-875-2626',
      email: 'shawarmaally@gmail.com',
      hours: 'Sun-Wed: 11AM - 11PM\nThu-Sat: 11AM - 1AM',
      coordinates: { lat: 43.5183, lng: -79.8774 },
      image: 'https://images.pexels.com/photos/2641886/pexels-photo-2641886.jpeg'
    },
    {
      id: 'brampton',
      name: 'Brampton',
      address: '345 Queen St W Unit 6',
      city: 'Brampton, ON L6Y 3A9',
      phone: '+1 905-455-3066',
      email: 'shawarmaally@gmail.com',
      hours: 'Sun-Sat: 11AM - 1AM',
      coordinates: { lat: 43.6858, lng: -79.7600 },
      image: 'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg'
    }
  ];

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  const sortLocationsByDistance = (userLat, userLng) => {
    return [...locations].sort((a, b) => {
      const distanceA = calculateDistance(
        userLat,
        userLng,
        a.coordinates.lat,
        a.coordinates.lng
      );
      const distanceB = calculateDistance(
        userLat,
        userLng,
        b.coordinates.lat,
        b.coordinates.lng
      );
      return distanceA - distanceB;
    });
  };

  const detectLocation = () => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const sorted = sortLocationsByDistance(latitude, longitude);
        setSelectedLocation(sorted[0]);
        setSortedLocations(sorted);
        setShowSortingNotification(true);
        setIsLocating(false);
        
        setTimeout(() => {
          setShowSortingNotification(false);
        }, 5000);
      },
      (error) => {
        setLocationError("Unable to find your location. Please try again.");
        setIsLocating(false);
      }
    );
  };

  const handleLocationSelect = (locationId) => {
    const selectedLocation = locations.find(loc => loc.id === locationId);
    if (selectedLocation) {
      localStorage.setItem('selectedLocation', locationId);
      navigate(`/${locationId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
      <div className="container mx-auto px-4 md:px-8 py-24">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <img 
              src={`${import.meta.env.BASE_URL}shawarma-alley-logo.png`}
              alt="Shawarma Alley" 
              className="h-24 md:h-32 mx-auto mb-8"
            />
            <h1 className="text-4xl md:text-5xl font-serif mb-4 text-neutral-900">
              Choose Your Location
            </h1>
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto">
              Find the Shawarma Alley location nearest to you
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-md mx-auto mb-12"
          >
            <button
              onClick={detectLocation}
              disabled={isLocating}
              className="w-full px-6 py-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaLocationArrow className={`${isLocating ? 'animate-spin' : ''}`} />
              <span className="font-medium">
                {isLocating ? 'Detecting location...' : 'Use current location'}
              </span>
            </button>

            {locationError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100"
              >
                <p className="flex items-center">
                  <span className="mr-2">⚠️</span>
                  {locationError}
                </p>
              </motion.div>
            )}

            {showSortingNotification && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-primary-50 text-primary-700 rounded-xl border border-primary-100"
              >
                <p className="flex items-center">
                  <span className="mr-2">📍</span>
                  Locations sorted by distance from you
                </p>
              </motion.div>
            )}
          </motion.div>

          <div className="mb-12">
            <LocationMap 
              selectedLocation={selectedLocation} 
              locations={locations} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {(sortedLocations.length > 0 ? sortedLocations : locations).map((location, index) => (
            <LocationCard
              key={location.id}
              location={location}
              isSelected={selectedLocation?.id === location.id}
              onSelect={setSelectedLocation}
              onLocationSelect={handleLocationSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;