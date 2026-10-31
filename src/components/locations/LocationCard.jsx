import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaClock } from 'react-icons/fa';

const LocationCard = ({ location, isSelected, onSelect, onLocationSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
        isSelected ? 'ring-2 ring-primary-500' : ''
      }`}
      onMouseEnter={() => onSelect(location)}
      onClick={() => onLocationSelect(location.id)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={location.image} 
          alt={location.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h2 className="text-2xl font-serif">{location.name}</h2>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <FaMapMarkerAlt className="mt-1 text-primary-500 flex-shrink-0" />
            <div>
              <p className="text-neutral-800">{location.address}</p>
              <p className="text-neutral-600">{location.city}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <FaPhone className="text-primary-500 flex-shrink-0" />
            <a 
              href={`tel:${location.phone}`} 
              className="text-neutral-700 hover:text-primary-500 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {location.phone}
            </a>
          </div>
          
          <div className="flex items-start space-x-3">
            <FaClock className="mt-1 text-primary-500 flex-shrink-0" />
            <div className="text-neutral-700 whitespace-pre-line">
              {location.hours}
            </div>
          </div>
        </div>

        <button
          className="w-full mt-6 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 group"
          onClick={(e) => {
            e.stopPropagation();
            onLocationSelect(location.id);
          }}
        >
          <span>Select Location</span>
          <svg 
            className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export default LocationCard;