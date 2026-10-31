import React from 'react';
import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LoadScript } from '@react-google-maps/api';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ScrollToTop from '../components/ui/ScrollToTop';

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() || '';

const MainLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const layout = (
    <div className="flex flex-col min-h-screen">
      <div 
        className="fixed top-0 left-0 w-full h-screen z-0 bg-black"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.pexels.com/photos/6267/menu-restaurant-vintage-table.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          opacity: isScrolled ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
          pointerEvents: 'none'
        }}
      />
      <Header isScrolled={isScrolled} />
      <main className="flex-grow relative z-10">
        <Outlet />
      </main>
      <ScrollToTop />
      <Footer googleMapsApiKey={googleMapsApiKey} />
    </div>
  );

  if (!googleMapsApiKey) {
    return layout;
  }

  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey}>
      {layout}
    </LoadScript>
  );
};

export default MainLayout;