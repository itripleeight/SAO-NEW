import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const SpecialOffer = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const handleOrderClick = (e) => {
    e.preventDefault();
    window.location.href = 'https://shawarmaalley.square.site/s/order';
  };

  return (
    <section 
      ref={ref}
      className="py-16 bg-primary-500"
    >
      <div className="container mx-auto px-4 md:px-8">
        <motion.div 
          className="bg-white rounded-lg shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="inline-block bg-primary-100 text-primary-800 font-bold px-4 py-2 rounded-full text-sm mb-6">
                Limited Time Offer
              </div>
              <h3 className="text-2xl md:text-3xl font-serif mb-4 text-neutral-900">
                Family Feast Bundle
              </h3>
              <p className="text-neutral-700 mb-6">
                Feed the whole family with our special bundle: 4 shawarma wraps, 2 sides, 4 drinks, and baklava dessert for 4. Perfect for a family dinner!
              </p>
              <div className="mb-6">
                <p className="text-3xl font-bold text-primary-600">$39.99</p>
                <p className="text-neutral-500 line-through">$54.99</p>
              </div>
              <a 
                href="https://shawarmaalley.square.site/s/order"
                onClick={handleOrderClick}
                className="inline-block px-6 py-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors duration-300 font-medium button-hover-effect self-start"
              >
                Order Now
              </a>
            </div>
            <div className="relative h-64 md:h-auto">
              <img 
                src="https://images.pexels.com/photos/7438422/pexels-photo-7438422.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Family meal" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SpecialOffer;