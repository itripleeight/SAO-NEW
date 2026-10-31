import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LocationContext = createContext();

/** Lower accuracy + cache often succeed when high-accuracy / network-assisted fixes fail (e.g. Chrome 403 to Google network location). */
const GEO_OPTIONS = {
  enableHighAccuracy: false,
  timeout: 15000,
  maximumAge: 300000,
};

// squareLocationId is the store's ID in the Square Online ordering site, used as
// https://shawarmaalley.square.site/s/order?location=<id> to skip Square's store picker.
const DEFAULT_LOCATION = {
  name: 'Georgetown',
  address: '232A Guelph Street, Unit 8',
  city: 'Georgetown, ON L7G 4A8',
  phone: '+1 905-877-5559',
  email: 'shawarmaally@gmail.com',
  squareLocationId: 'LMF4W6WW67SV9',
};

const LOCATIONS = {
  georgetown: {
    name: 'Georgetown',
    address: '232A Guelph Street, Unit 8',
    city: 'Georgetown, ON L7G 4A8',
    phone: '+1 905-877-5559',
    email: 'shawarmaally@gmail.com',
    coordinates: { lat: 43.6426, lng: -79.9071 },
    squareLocationId: 'LMF4W6WW67SV9',
  },
  guelph: {
    name: 'Guelph',
    address: '43 Macdonell Street',
    city: 'Guelph, ON N1H 2Z4',
    phone: '+1 519-763-3198',
    email: 'shawarmaally@gmail.com',
    coordinates: { lat: 43.5448, lng: -80.2482 },
    squareLocationId: 'L9NN7E9ZHB3ED',
  },
  milton: {
    name: 'Milton',
    address: '295 Main St E',
    city: 'Milton, ON L9T 1P1',
    phone: '+1 905-875-2626',
    email: 'shawarmaally@gmail.com',
    coordinates: { lat: 43.5183, lng: -79.8774 },
    squareLocationId: 'LD0BXW3RQ7BYN',
  },
  brampton: {
    name: 'Brampton',
    address: '345 Queen St W Unit 6',
    city: 'Brampton, ON L6Y 3A9',
    phone: '+1 905-455-3066',
    email: 'shawarmaally@gmail.com',
    coordinates: { lat: 43.6858, lng: -79.76 },
    squareLocationId: 'LHVE0AFQ0EHMQ',
  },
  orangeville: {
    name: 'Orangeville',
    address: '75 First St #11',
    city: 'Orangeville, ON L9W 2E7',
    phone: '+1 519-316-1892',
    email: 'shawarmaally@gmail.com',
    coordinates: { lat: 43.9198, lng: -80.0943 },
    squareLocationId: 'LVT5J81X244R5',
  },
};

/**
 * HTTPS + CORS-friendly approximate position from IP. Only used after the visitor has allowed
 * location access but the device couldn't get a fix; never when they decline.
 */
const fetchApproxCoordsFromIp = async () => {
  const controller = new AbortController();
  const t = window.setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch('https://get.geojs.io/v1/ip/geo.json', {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error('ip geo http');
    const data = await res.json();
    const lat = parseFloat(data.latitude);
    const lng = parseFloat(data.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('ip geo parse');
    return { lat, lng };
  } finally {
    window.clearTimeout(t);
  }
};

export const useLocation = () => {
  return useContext(LocationContext);
};

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_LOCATION);
  const [isLocating, setIsLocating] = useState(true);
  const [locationMessage, setLocationMessage] = useState('');

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const pickNearest = useCallback((latitude, longitude) => {
    let nearestLocation = null;
    let shortestDistance = Infinity;
    for (const loc of Object.values(LOCATIONS)) {
      const distance = calculateDistance(
        latitude,
        longitude,
        loc.coordinates.lat,
        loc.coordinates.lng
      );
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestLocation = loc;
      }
    }
    return { nearestLocation, shortestDistance };
  }, []);

  const applyNearest = useCallback(
    (latitude, longitude) => {
      const { nearestLocation, shortestDistance } = pickNearest(latitude, longitude);
      if (nearestLocation) {
        setCurrentLocation(nearestLocation);
        setLocationMessage(
          `Nearest location: ${nearestLocation.name} (${shortestDistance.toFixed(1)} km away)`
        );
        return nearestLocation;
      }
      return null;
    },
    [pickNearest]
  );

  const detectNearestLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      setIsLocating(true);
      // Clear first so the header shows the message again on a repeat tap.
      setLocationMessage('');

      const done = (nearest) => {
        setIsLocating(false);
        if (nearest) resolve(nearest);
        else reject(new Error('Could not determine location'));
      };

      const tryIpThenFinish = () => {
        fetchApproxCoordsFromIp()
          .then(({ lat, lng }) => {
            const nearest = applyNearest(lat, lng);
            done(nearest);
          })
          .catch(() => {
            setLocationMessage(
              'Could not detect your location. Allow location access or tap the pin to try again.'
            );
            done(null);
          });
      };

      const showDefaultStore = (reason) => {
        setLocationMessage(`${reason} Showing our ${DEFAULT_LOCATION.name} store.`);
        done(null);
      };

      // No browser support means the visitor was never asked, so don't locate them another way.
      if (!navigator.geolocation) {
        showDefaultStore("Your browser doesn't share location.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const nearest = applyNearest(latitude, longitude);
          done(nearest);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            showDefaultStore('Location is off.');
            return;
          }
          // Allowed, but the device couldn't get a fix (timeout or no signal).
          tryIpThenFinish();
        },
        GEO_OPTIONS
      );
    });
  }, [applyNearest]);

  useEffect(() => {
    detectNearestLocation().catch(() => {});
  }, [detectNearestLocation]);

  const value = {
    currentLocation,
    setCurrentLocation,
    locations: LOCATIONS,
    detectNearestLocation,
    isLocating,
    locationMessage,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext;
