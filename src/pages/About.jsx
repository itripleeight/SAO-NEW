import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaCertificate, FaLeaf, FaHandshake, FaUsers } from 'react-icons/fa';

const About = () => {
  const [storyRef, storyInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const values = [
    {
      icon: <FaCertificate size={32} className="text-primary-500" />,
      title: 'Tradition',
      description: 'We stay true to traditional recipes while adding our own modern spin to create unforgettable flavors.'
    },
    {
      icon: <FaLeaf size={32} className="text-primary-500" />,
      title: 'Fresh Ingredients',
      description: 'We source the highest quality ingredients and prepare everything fresh daily for the best taste.'
    },
    {
      icon: <FaHandshake size={32} className="text-primary-500" />,
      title: 'Community',
      description: 'We value the relationships with our customers and the community we serve.'
    },
    {
      icon: <FaUsers size={32} className="text-primary-500" />,
      title: 'Inclusivity',
      description: 'We welcome everyone to experience our cuisine and culture in a warm, inviting atmosphere.'
    }
  ];

  return (
    <div className="bg-neutral-50">
      {/* Hero Section */}
      <div 
        className="relative h-80 md:h-96 bg-cover bg-center flex items-center justify-center"
        style={{ 
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.pexels.com/photos/5779372/pexels-photo-5779372.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)'
        }}
      >
        <div className="text-center px-4">
          <motion.h1 
            className="text-4xl md:text-5xl font-serif text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Our Story
          </motion.h1>
          <motion.p 
            className="text-xl text-neutral-200 max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            A journey of flavors and family
          </motion.p>
        </div>
      </div>

      {/* Story Section */}
      <section ref={storyRef} className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={storyInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="prose prose-lg">
              <p className="text-neutral-700 leading-relaxed mb-6">
                Shawarma Alley started with a dream. A dream to build a business to support our family and what better way to do it then through food. We believe food can bring people together and it breaks many barriers that society has created today.
              </p>
              <p className="text-neutral-700 leading-relaxed mb-6">
                Our vision started with our CEO and founder Zishan Ashraf. Zishan was born and raised in the UAE where he developed his love for shawarma and the Mediterranean cuisine. Zishan has over 9 years of experience in the food industry, where he learned all the tips and tricks to run a successful restaurant.
              </p>
              <p className="text-neutral-700 leading-relaxed mb-6">
                Our co-founder Hifza Humayun was born in Pakistan but raised in Canada and she grew up loving Pizza. Hifza also has over 8 years of experience in the food industry.
              </p>
              <p className="text-neutral-700 leading-relaxed mb-6">
              After Zishan & Hifza got married in 2014, they started working towards their dream of opening a restaurant. When it came time to choose what type of food they would be serving, they came up with the genius idea of combining the two cuisines and created the magical place "Shawarma Alley".
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif mb-4 text-neutral-900">Our Values</h2>
            <p className="text-neutral-700 max-w-2xl mx-auto">
              These core principles guide everything we do at Shawarma Alley
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="bg-neutral-50 p-6 rounded-lg shadow-md text-center transition-shadow duration-300 hover:shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={storyInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.2 } }}
              >
                <div className="flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="font-serif text-xl font-medium text-neutral-900 mb-2">{value.title}</h3>
                <p className="text-neutral-700">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;