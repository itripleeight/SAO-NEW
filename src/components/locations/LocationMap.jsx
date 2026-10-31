import React, { useState } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

const LocationMap = ({ selectedLocation, locations }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const mapStyles = {
    height: "400px",
    width: "100%"
  };

  const defaultCenter = {
    lat: 43.6426,
    lng: -79.9071
  };

  const center = selectedLocation ? {
    lat: selectedLocation.coordinates.lat,
    lng: selectedLocation.coordinates.lng
  } : defaultCenter;

  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }
    ]
  };

  const getMarkerIcon = () => {
    if (!isLoaded || !window.google || !window.google.maps) return null;
    return {
      url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
      scaledSize: new window.google.maps.Size(40, 40)
    };
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <GoogleMap
      mapContainerStyle={mapStyles}
      zoom={13}
      center={center}
      options={mapOptions}
      onLoad={handleLoad}
    >
      {isLoaded && locations.map((location) => (
        <Marker
          key={location.id}
          position={{
            lat: location.coordinates.lat,
            lng: location.coordinates.lng
          }}
          title={location.name}
          icon={getMarkerIcon()}
          animation={selectedLocation?.id === location.id && window.google?.maps ?
            window.google.maps.Animation.BOUNCE : null}
        />
      ))}
    </GoogleMap>
  );
};

export default LocationMap;