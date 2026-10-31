import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const TestimonialCard = ({ testimonial }) => {
  const { name, comment, rating, image } = testimonial;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-primary-500" />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-primary-500" />);
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-primary-500" />);
    }
    
    return stars;
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden flex-shrink-0">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex justify-center md:justify-start mb-2">
            {renderStars(rating)}
          </div>
          <p className="text-neutral-700 mb-4 italic">"{comment}"</p>
          <p className="font-medium text-neutral-900">{name}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;