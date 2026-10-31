import React from 'react';
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Franchise from './pages/Franchise';
import Catering from './pages/Catering';
import Feedback from './pages/Feedback';
import OrderOnline from './pages/OrderOnline';
import BuildYourShawarma from './pages/BuildYourShawarma';
import NotFound from './pages/NotFound';

// Context
import { LocationProvider } from './context/LocationContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-primary-500 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-white mb-4">Shawarma Alley</h1>
          <div className="flex space-x-2 justify-center">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-150"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-300"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LocationProvider>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="franchise" element={<Franchise />} />
          <Route path="catering" element={<Catering />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="order-online" element={<OrderOnline />} />
          <Route path="build-your-shawarma" element={<BuildYourShawarma />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </LocationProvider>
  );
}

export default App;