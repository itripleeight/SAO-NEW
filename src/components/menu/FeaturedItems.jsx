import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import MenuItemCard from './MenuItemCard';

const FeaturedItems = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [activeCategory, setActiveCategory] = useState('all');

  const featuredItems = [
    {
      id: 1,
      name: 'Chicken Shawarma Wrap',
      description: 'Marinated chicken, garlic sauce, pickles, tomatoes, onions, and french fries wrapped in pita bread.',
      image: 'https://images.pexels.com/photos/2955819/pexels-photo-2955819.jpeg',
      category: 'shawarma'
    },
    {
      id: 2,
      name: 'Beef Shawarma Wrap',
      description: 'Marinated beef, tahini sauce, onions, tomatoes, parsley, and pickles wrapped in pita bread.',
      image: 'https://images.pexels.com/photos/6542775/pexels-photo-6542775.jpeg',
      category: 'shawarma'
    },
    {
      id: 3,
      name: 'Chicken Shawarma Plate',
      description: 'Marinated chicken served with rice, hummus, salad, pickles, and pita bread.',
      image: 'https://images.pexels.com/photos/7353379/pexels-photo-7353379.jpeg',
      category: 'shawarma'
    },
    {
      id: 4,
      name: 'Beef Shawarma Plate',
      description: 'Marinated beef served with rice, hummus, salad, pickles, and pita bread.',
      image: 'https://images.pexels.com/photos/6546029/pexels-photo-6546029.jpeg',
      category: 'shawarma'
    },
    {
      id: 5,
      name: 'Chicken Kabob Plate',
      description: 'Two skewers of marinated chicken served with rice, hummus, salad, and pita bread.',
      image: 'https://images.pexels.com/photos/6210952/pexels-photo-6210952.jpeg',
      category: 'grill'
    },
    {
      id: 6,
      name: 'Beef Kabob Plate',
      description: 'Two skewers of marinated beef served with rice, hummus, salad, and pita bread.',
      image: 'https://images.pexels.com/photos/6941010/pexels-photo-6941010.jpeg',
      category: 'grill'
    },
    {
      id: 7,
      name: 'Kofta Kabob Plate',
      description: 'Two skewers of seasoned ground beef served with rice, hummus, salad, and pita bread.',
      image: 'https://images.pexels.com/photos/6941017/pexels-photo-6941017.jpeg',
      category: 'grill'
    },
    {
      id: 8,
      name: 'Mixed Grill Plate',
      description: 'One skewer each of chicken, beef, and kofta served with rice, hummus, salad, and pita bread.',
      image: 'https://images.pexels.com/photos/6941082/pexels-photo-6941082.jpeg',
      category: 'grill'
    },
    {
      id: 9,
      name: 'Falafel Wrap',
      description: 'Crispy falafel, hummus, lettuce, tomatoes, pickles, and tahini sauce wrapped in pita bread.',
      image: 'https://images.pexels.com/photos/5945784/pexels-photo-5945784.jpeg',
      category: 'vegetarian'
    },
    {
      id: 10,
      name: 'Falafel Plate',
      description: '6 pieces of falafel served with hummus, salad, pickles, tahini sauce, and pita bread.',
      image: 'https://images.pexels.com/photos/5945730/pexels-photo-5945730.jpeg',
      category: 'vegetarian'
    },
    {
      id: 11,
      name: 'Hummus',
      description: 'Creamy chickpea dip topped with olive oil and paprika, served with pita bread.',
      image: 'https://images.pexels.com/photos/5945527/pexels-photo-5945527.jpeg',
      category: 'appetizer'
    },
    {
      id: 12,
      name: 'Baba Ganoush',
      description: 'Roasted eggplant dip topped with olive oil and paprika, served with pita bread.',
      image: 'https://images.pexels.com/photos/5945945/pexels-photo-5945945.jpeg',
      category: 'appetizer'
    },
    {
      id: 13,
      name: 'Fattoush Salad',
      description: 'Mixed greens, tomatoes, cucumbers, onions, pita chips with house dressing.',
      image: 'https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg',
      category: 'appetizer'
    },
    {
      id: 14,
      name: 'Baklava',
      description: 'Layers of phyllo dough filled with nuts and honey syrup.',
      image: 'https://images.pexels.com/photos/5419203/pexels-photo-5419203.jpeg',
      category: 'dessert'
    },
    {
      id: 15,
      name: 'Kunafa',
      description: 'Shredded phyllo dough with sweet cheese filling, topped with pistachios.',
      image: 'https://images.pexels.com/photos/5419089/pexels-photo-5419089.jpeg',
      category: 'dessert'
    }
  ];

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'shawarma', name: 'Shawarma' },
    { id: 'grill', name: 'Grill' },
    { id: 'vegetarian', name: 'Vegetarian' },
    { id: 'appetizer', name: 'Appetizers' },
    { id: 'dessert', name: 'Desserts' }
  ];

  const filteredItems = activeCategory === 'all' 
    ? featuredItems 
    : featuredItems.filter(item => item.category === activeCategory);

  return (
    <div ref={ref}>
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-full transition-colors duration-300 ${
              activeCategory === category.id
                ? 'bg-primary-500 text-white'
                : 'bg-white text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <MenuItemCard item={item} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedItems;