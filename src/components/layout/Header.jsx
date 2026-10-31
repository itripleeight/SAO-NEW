import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaMapMarkerAlt, FaLocationArrow } from 'react-icons/fa';
import { useLocation as useLocationContext } from '../../context/LocationContext';
import Logo from '../ui/Logo';

const Header = ({ isScrolled }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { currentLocation, detectNearestLocation, isLocating, locationMessage } = useLocationContext();
  const [isHomePage, setIsHomePage] = useState(pathname === '/');
  const [showLocationMessage, setShowLocationMessage] = useState(false);

  const activeLink = 'text-primary-600 font-bold';

  useEffect(() => {
    setIsHomePage(pathname === '/');
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen, pathname]);

  useEffect(() => {
    if (locationMessage) {
      setShowLocationMessage(true);
      const timer = setTimeout(() => {
        setShowLocationMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [locationMessage]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleOrderClick = (e) => {
    e.preventDefault();
    window.location.href = 'https://shawarmaalley.square.site/s/order';
  };

  const handleMenuClick = (e) => {
    e.preventDefault();
    window.location.href = 'https://shawarmaalley.square.site/';
  };

  const handleLocationDetect = async () => {
    // Declining location rejects; the context already shows a message for that.
    await detectNearestLocation().catch(() => {});
  };

  const headerClasses = `fixed w-full z-30 transition-all duration-300 ${
    isScrolled || !isHomePage 
      ? 'bg-white shadow-md py-2' 
      : 'bg-transparent py-4'
  }`;

  const linkClasses = `link-underline font-medium transition-colors duration-300 ${
    isScrolled || !isHomePage ? 'text-neutral-800 hover:text-primary-600' : 'text-white hover:text-primary-300'
  }`;

  return (
    <header className={headerClasses}>
      <div className="container mx-auto max-w-full px-0">
        <div className="flex items-center justify-between gap-4 md:gap-8 pl-2 sm:pl-3 md:pl-4 pr-3 sm:pr-4 md:pr-8">
          <div className="flex min-w-0 items-center">
            <Link
              to="/"
              className="z-50 flex shrink-0 items-center leading-none"
            >
              <Logo isLight={!(isScrolled || !isHomePage)} />
            </Link>
            {currentLocation && (
              <div
                className={`ml-3 md:ml-4 flex min-w-0 items-center border-l pl-3 md:pl-4 ${
                  isScrolled || !isHomePage
                    ? 'border-neutral-200 text-neutral-800'
                    : 'border-white/40 text-white'
                }`}
              >
                <button 
                  onClick={handleLocationDetect}
                  className="flex min-w-0 items-center hover:opacity-75 transition-opacity text-left"
                  disabled={isLocating}
                >
                  {isLocating ? (
                    <FaLocationArrow className="mr-2 shrink-0 animate-spin" />
                  ) : (
                    <FaMapMarkerAlt className="mr-2 shrink-0" />
                  )}
                  <span className="font-medium truncate max-w-[140px] sm:max-w-[180px]">{currentLocation.name}</span>
                </button>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden min-w-0 shrink md:flex items-center justify-end gap-x-4 lg:gap-x-8">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                isActive ? `${linkClasses} ${activeLink}` : linkClasses
              }
            >
              Home
            </NavLink>
            <a
              href="https://shawarmaalley.square.site/"
              onClick={handleMenuClick}
              className={linkClasses}
            >
              Menu
            </a>
            <NavLink
              to="/build-your-shawarma"
              className={({ isActive }) =>
                // Only once there is room: below ~1100px it pushes the nav into the location name.
                `hidden whitespace-nowrap min-[1100px]:inline ${isActive ? `${linkClasses} ${activeLink}` : linkClasses}`
              }
            >
              Build a Wrap
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => 
                isActive ? `${linkClasses} ${activeLink}` : linkClasses
              }
            >
              About
            </NavLink>
            <NavLink 
              to="/franchise" 
              className={({ isActive }) => 
                isActive ? `${linkClasses} ${activeLink}` : linkClasses
              }
            >
              Franchise
            </NavLink>
            <NavLink 
              to="/catering" 
              className={({ isActive }) => 
                isActive ? `${linkClasses} ${activeLink}` : linkClasses
              }
            >
              Catering
            </NavLink>
            <NavLink 
              to="/feedback" 
              className={({ isActive }) => 
                isActive ? `${linkClasses} ${activeLink}` : linkClasses
              }
            >
              Feedback
            </NavLink>
            <a 
              href="https://shawarmaalley.square.site/s/order"
              onClick={handleOrderClick}
              className={`shrink-0 whitespace-nowrap px-6 py-2 rounded-full ${
                isScrolled || !isHomePage 
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'bg-white text-neutral-800 hover:bg-neutral-100'
              } transition-colors duration-300 button-hover-effect`}
            >
              Order Online
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={toggleMenu} 
              className={`z-50 ${isMenuOpen ? 'text-neutral-800' : isScrolled || !isHomePage ? 'text-neutral-800' : 'text-white'}`}
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                className="fixed inset-0 bg-white z-40 flex flex-col items-center justify-center"
                initial={{ opacity: 0, x: '-100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '-100%' }}
                transition={{ duration: 0.3 }}
              >
                {currentLocation && (
                  <button 
                    onClick={handleLocationDetect}
                    className="flex items-center mb-8 text-neutral-800"
                    disabled={isLocating}
                  >
                    {isLocating ? (
                      <FaLocationArrow className="mr-2 animate-spin" />
                    ) : (
                      <FaMapMarkerAlt className="mr-2" />
                    )}
                    <span className="font-medium">{currentLocation.name}</span>
                  </button>
                )}
                <nav className="flex flex-col items-center space-y-8 text-xl">
                  <NavLink 
                    to="/" 
                    onClick={closeMenu}
                    className={({ isActive }) => 
                      isActive ? 'text-primary-600 font-bold' : 'text-neutral-800 hover:text-primary-600'
                    }
                  >
                    Home
                  </NavLink>
                  <a
                    href="https://shawarmaalley.square.site/"
                    onClick={(e) => {
                      closeMenu();
                      handleMenuClick(e);
                    }}
                    className="text-neutral-800 hover:text-primary-600"
                  >
                    Menu
                  </a>
                  <NavLink
                    to="/build-your-shawarma"
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      isActive ? 'text-primary-600 font-bold' : 'text-neutral-800 hover:text-primary-600'
                    }
                  >
                    Build a Wrap
                  </NavLink>
                  <NavLink
                    to="/about"
                    onClick={closeMenu}
                    className={({ isActive }) => 
                      isActive ? 'text-primary-600 font-bold' : 'text-neutral-800 hover:text-primary-600'
                    }
                  >
                    About
                  </NavLink>
                  <NavLink 
                    to="/franchise" 
                    onClick={closeMenu}
                    className={({ isActive }) => 
                      isActive ? 'text-primary-600 font-bold' : 'text-neutral-800 hover:text-primary-600'
                    }
                  >
                    Franchise
                  </NavLink>
                  <NavLink 
                    to="/catering" 
                    onClick={closeMenu}
                    className={({ isActive }) => 
                      isActive ? 'text-primary-600 font-bold' : 'text-neutral-800 hover:text-primary-600'
                    }
                  >
                    Catering
                  </NavLink>
                  <NavLink 
                    to="/feedback" 
                    onClick={closeMenu}
                    className={({ isActive }) => 
                      isActive ? 'text-primary-600 font-bold' : 'text-neutral-800 hover:text-primary-600'
                    }
                  >
                    Feedback
                  </NavLink>
                  <a 
                    href="https://shawarmaalley.square.site/s/order"
                    onClick={(e) => {
                      closeMenu();
                      handleOrderClick(e);
                    }}
                    className="px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors duration-300"
                  >
                    Order Online
                  </a>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Location Message */}
        <AnimatePresence>
          {showLocationMessage && locationMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 mt-2 mx-4"
            >
              <div className="bg-primary-500 text-white px-4 py-2 rounded-lg shadow-md text-center">
                {locationMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;