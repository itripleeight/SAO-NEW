import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaYoutube, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import { GoogleMap, Marker } from '@react-google-maps/api';
import Logo from '../ui/Logo';

/** OSM embed when no Google key — full region (Southern ON). */
const OSM_EMBED_DEFAULT =
  'https://www.openstreetmap.org/export/embed.html?bbox=-80.45%2C43.42%2C-79.65%2C44.08&layer=mapnik';

const MAP_ZOOM_DEFAULT = 10;

const Footer = ({ googleMapsApiKey = '' }) => {
  const year = new Date().getFullYear();
  const mapsEnabled = Boolean(googleMapsApiKey?.trim());
  const [mapReady, setMapReady] = useState(false);

  const locations = [
    {
      name: "Georgetown",
      address: "232A Guelph Street, Unit 8",
      city: "Georgetown, ON L7G 4A8",
      phone: "+1 905-877-5559",
      coordinates: { lat: 43.64731, lng: -79.92766 },
      googleMapsUrl: "https://maps.app.goo.gl/ZCvGQxr1nqX5w1JfA",
    },
    {
      name: "Guelph",
      address: "43 Macdonell Street",
      city: "Guelph, ON N1H 2Z4",
      phone: "+1 519-763-3198",
      coordinates: { lat: 43.54454, lng: -80.24860 },
      googleMapsUrl: "https://maps.app.goo.gl/1CMJwdvx8yBTVkPU8",
    },
    {
      name: "Milton",
      address: "295 Main St E",
      city: "Milton, ON L9T 1P1",
      phone: "+1 905-875-2626",
      coordinates: { lat: 43.51832, lng: -79.87743 },
      googleMapsUrl: "https://maps.app.goo.gl/aSLjqTGFMYHsvWem6",
    },
    {
      name: "Brampton",
      address: "345 Queen St W Unit 6",
      city: "Brampton, ON L6Y 3A9",
      phone: "+1 905-455-3066",
      coordinates: { lat: 43.68583, lng: -79.76001 },
      googleMapsUrl: "https://maps.app.goo.gl/PPCJ9Qh1cytfQjs76",
    },
    {
      name: "Orangeville",
      address: "75 First St #11",
      city: "Orangeville, ON L9W 2E7",
      phone: "+1 519-316-1892",
      coordinates: { lat: 43.9198, lng: -80.0943 },
      googleMapsUrl: "https://maps.app.goo.gl/Yy9nvKLb9kezfJDb7",
    }
  ];

  const mapStyles = {
    width: '100%',
    height: '100%',
    minHeight: '100%',
  };

  const defaultCenter = {
    lat: 43.64731,
    lng: -79.92766
  };

  const handleMapLoad = () => {
    setMapReady(true);
  };

  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
      {
        featureType: "all",
        elementType: "labels.text.fill",
        stylers: [{ color: "#ffffff" }]
      },
      {
        featureType: "all",
        elementType: "labels.text.stroke",
        stylers: [{ visibility: "on" }, { color: "#424242" }, { weight: 2 }]
      },
      {
        featureType: "all",
        elementType: "labels.icon",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "administrative",
        elementType: "geometry.fill",
        stylers: [{ color: "#424242" }]
      },
      {
        featureType: "administrative",
        elementType: "geometry.stroke",
        stylers: [{ color: "#424242" }, { weight: 1.2 }]
      },
      {
        featureType: "landscape",
        elementType: "geometry",
        stylers: [{ color: "#424242" }]
      },
      {
        featureType: "poi",
        elementType: "geometry",
        stylers: [{ color: "#424242" }]
      },
      {
        featureType: "road.highway",
        elementType: "geometry.fill",
        stylers: [{ color: "#525252" }]
      },
      {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#525252" }]
      },
      {
        featureType: "road.arterial",
        elementType: "geometry",
        stylers: [{ color: "#525252" }]
      },
      {
        featureType: "road.local",
        elementType: "geometry",
        stylers: [{ color: "#525252" }]
      },
      {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#424242" }]
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#313131" }]
      }
    ]
  };

  const getMarkerIcon = () => {
    if (!mapReady || !window.google?.maps?.Size) return undefined;
    return {
      url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      scaledSize: new window.google.maps.Size(32, 32),
    };
  };

  const getGoogleMapsUrl = (location) => {
    if (location.googleMapsUrl?.trim()) return location.googleMapsUrl.trim();
    const address = `${location.address}, ${location.city}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  return (
    <footer className="isolate grid w-full grid-cols-1 grid-rows-1 overflow-hidden bg-neutral-950 text-white min-h-[48rem] md:min-h-[52rem]">
      {/* Same grid cell as content so the map always gets the full footer height (avoids 0-height map bugs). */}
      <div className="z-0 col-start-1 row-start-1 min-h-[48rem] md:min-h-[52rem] h-full w-full self-stretch opacity-80 brightness-[0.38] saturate-[0.48] contrast-[0.88]">
        {mapsEnabled ? (
          <GoogleMap
            mapContainerStyle={mapStyles}
            zoom={MAP_ZOOM_DEFAULT}
            center={defaultCenter}
            options={mapOptions}
            onLoad={handleMapLoad}
          >
            {mapReady &&
              locations.map((location) => (
                <Marker
                  key={location.name}
                  position={location.coordinates}
                  title={location.name}
                  icon={getMarkerIcon()}
                />
              ))}
          </GoogleMap>
        ) : (
          <iframe
            title="Store locations region map"
            src={OSM_EMBED_DEFAULT}
            className="pointer-events-none block h-full min-h-[48rem] md:min-h-[52rem] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </div>

      <div
        className="pointer-events-none col-start-1 row-start-1 z-[5] bg-gradient-to-b from-neutral-950/70 via-neutral-950/55 to-neutral-950/40"
        aria-hidden
      />

      <div className="relative z-10 col-start-1 row-start-1 flex h-full min-h-[48rem] md:min-h-[52rem] self-stretch flex-col bg-gradient-to-t from-neutral-950 via-neutral-950/96 to-neutral-900/88">
        <div className="container mx-auto flex w-full flex-1 flex-col justify-center px-4 py-12 md:px-8 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Column 1 - Logo and Description */}
            <div className="lg:col-span-4">
              <div className="mb-6">
                <Link to="/" className="inline-flex items-center">
                  <Logo isLight={true} />
                </Link>
              </div>
              <p className="text-neutral-400 mb-8 text-lg leading-relaxed">
                Experience the rich flavors and tradition of Middle Eastern cuisine with our modern twist on shawarma prepared with love.
              </p>
              <div className="mb-8 flex flex-col sm:flex-row flex-wrap gap-4">
                <Link
                  to="/franchise"
                  className="inline-block px-6 py-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors duration-300 font-medium text-center"
                >
                  Franchise Opportunities
                </Link>
              </div>
              <div className="flex space-x-6">
                <a 
                  href="https://www.facebook.com/ShawarmaAlly/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-neutral-400 hover:text-primary-500 transition-colors duration-300"
                >
                  <FaFacebook size={28} />
                </a>
                <a 
                  href="https://www.instagram.com/shawarmaally/?hl=en" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-neutral-400 hover:text-primary-500 transition-colors duration-300"
                >
                  <FaInstagram size={28} />
                </a>
                <a 
                  href="https://www.youtube.com/@ShawarmaAlly" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-neutral-400 hover:text-primary-500 transition-colors duration-300"
                  aria-label="Shawarma Alley on YouTube"
                >
                  <FaYoutube size={28} />
                </a>
              </div>
            </div>

            {/* Locations */}
            <div className="lg:col-span-8">
              <h2 className="text-2xl font-serif text-white mb-6">Visit Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {locations.map((location) => (
                  <div
                    key={location.name}
                    className="group relative rounded-lg border border-neutral-700/50 bg-neutral-800/50 p-5 backdrop-blur-sm transition-colors duration-200 cursor-pointer hover:border-primary-500/25 hover:bg-neutral-800/75 hover:shadow-lg"
                  >
                    {/* Stretched link: clicking anywhere on the card opens Google Maps.
                        Sits above the static card content but below the phone link (z-10). */}
                    <a
                      href={getGoogleMapsUrl(location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 z-0 rounded-lg"
                      aria-label={`Open ${location.name} location in Google Maps`}
                    />
                    <h3 className="font-serif text-xl mb-4 text-white group-hover:text-primary-500 transition-colors duration-300">{location.name}</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <FaMapMarkerAlt className="mt-1.5 mr-3 text-primary-500 flex-shrink-0" />
                        <div>
                          <p className="text-neutral-200 group-hover:text-primary-500 transition-colors duration-300">{location.address}</p>
                          <p className="text-neutral-400 group-hover:text-primary-500 transition-colors duration-300">{location.city}</p>
                        </div>
                      </li>
                      <li className="relative z-10 flex items-center w-fit">
                        <FaPhone className="mr-3 text-primary-500 flex-shrink-0" />
                        <a
                          href={`tel:${location.phone}`}
                          className="text-neutral-200 hover:text-primary-500 transition-colors duration-300"
                        >
                          {location.phone}
                        </a>
                      </li>
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-neutral-800 text-center">
            <p className="text-neutral-500">© {year} Shawarma Alley. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;