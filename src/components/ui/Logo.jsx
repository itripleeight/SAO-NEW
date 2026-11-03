import React from 'react';

const Logo = ({ isLight = false, className = '' }) => {
  return (
    <img
      src={`${import.meta.env.BASE_URL}shawarma-alley-logo.png`}
      alt="Shawarma Alley"
      className={`h-12 md:h-16 w-auto ${isLight ? 'filter-none' : ''} ${className}`.trim()}
    />
  );
};

export default Logo;
