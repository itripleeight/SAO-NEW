import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaArrowRight } from 'react-icons/fa';

const HERO_COVER_URL = encodeURI(`${import.meta.env.BASE_URL}Fb Cover 014 copy.jpg.jpeg`);
const CTA_BACKGROUND_URL = encodeURI(`${import.meta.env.BASE_URL}readytotry.jpg`);

/** Match Our Story, CTA band, and footer vertical footprint */
const BLOCK_MIN_H = 'min-h-[48rem] md:min-h-[52rem]';
const BLOCK_PY = 'py-12 md:py-16';

const Home = () => {
  const heroRef = useRef(null);
  const [aboutRef, aboutInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const handleOrderClick = (e) => {
    e.preventDefault();
    window.location.href = 'https://shawarmaalley.square.site/s/order';
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      
      const scrollPosition = window.scrollY;
      const opacity = 1 - Math.min(scrollPosition / 500, 1);
      
      heroRef.current.style.opacity = opacity;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative">
      {/* Hero Section */}
      <div 
        ref={heroRef}
        className="relative h-screen bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${HERO_COVER_URL})`
        }}
      >
        <div className="text-center px-4 max-w-4xl">
          <motion.h1 
            className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Magical World of <br />Shawarma & Pizza
          </motion.h1>
          <motion.p 
            className="text-xl text-neutral-200 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Experience the rich flavors and traditions of shawarma prepared with passion
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center"
          >
            <a 
              href="https://shawarmaalley.square.site/s/order"
              onClick={handleOrderClick}
              className="px-8 py-3 bg-white text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors duration-300 font-medium button-hover-effect"
            >
              Order Online
            </a>
          </motion.div>
        </div>
      </div>

      {/* About Section */}
      <section
        ref={aboutRef}
        className={`${BLOCK_MIN_H} ${BLOCK_PY} bg-white flex items-center`}
      >
        <div className="container mx-auto px-4 md:px-8 w-full">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={aboutInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-serif mb-6 text-neutral-900">Our Story</h2>
              <div className="space-y-6 text-neutral-700 leading-relaxed">
                <p>
                  Shawarma Alley started with a dream. A dream to build a business to support our family and what better way to do it then through food. We believe food can bring people together and it breaks many barriers that society has created today.
                </p>
                <p>
                  Our vision started with our CEO and founder Zishan Ashraf. Zishan was born and raised in the UAE where he developed his love for shawarma and the Mediterranean cuisine. Zishan has over 9 years of experience in the food industry, where he learned all the tips and tricks to run a successful restaurant.
                </p>
                <p>
                  Our co-founder Hifza Humayun was born in Pakistan but raised in Canada and she grew up loving Pizza. Hifza also has over 8 years of experience in the food industry.
                </p>
                <p>
                  After Zishan & Hifza got married in 2014, they started working towards their dream of opening a restaurant. When it came time to choose what type of food they would be serving, they came up with the genius idea of combining the two cuisines and created the magical place "Shawarma Alley".
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src={`${import.meta.env.BASE_URL}ecf4a782-bf63-46dc-a5fe-f136da029727.jpg`}
                alt="Shawarma Alley"
                className="rounded-lg shadow-xl w-full h-auto object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-primary-500 text-white py-4 px-6 rounded-lg shadow-lg">
                <p className="font-serif text-2xl">Since 2018</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className={`relative ${BLOCK_MIN_H} ${BLOCK_PY} bg-cover bg-center flex items-center justify-center`}
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${CTA_BACKGROUND_URL})`
        }}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2 
              className="text-4xl md:text-5xl font-serif text-white mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Ready to Experience Shawarma?
            </motion.h2>
            <motion.p 
              className="text-xl text-neutral-200 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Join us for a culinary journey through the flavors of the Middle East.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <a 
                href="https://shawarmaalley.square.site/s/order"
                onClick={handleOrderClick}
                className="inline-block px-12 py-4 bg-primary-500 text-white text-lg rounded-full hover:bg-primary-600 transition-colors duration-300 font-medium button-hover-effect"
              >
                Order Online
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;