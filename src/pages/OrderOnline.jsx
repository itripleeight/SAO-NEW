import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaCheck } from 'react-icons/fa';
import MenuItemCard from '../components/menu/MenuItemCard';

const OrderOnline = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  
  const [headerRef, headerInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  useEffect(() => {
    // Simulate API loading
    setLoading(true);
    setTimeout(() => {
      setMenuItems(allMenuItems);
      setLoading(false);
    }, 800);
  }, []);

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'shawarma', name: 'Shawarma' },
    { id: 'grill', name: 'Grill' },
    { id: 'vegetarian', name: 'Vegetarian' },
    { id: 'sides', name: 'Sides' },
    { id: 'appetizer', name: 'Appetizers' },
    { id: 'dessert', name: 'Desserts' },
    { id: 'drinks', name: 'Drinks' }
  ];

  const allMenuItems = [
    // Shawarma
    {
      id: 1,
      name: 'Classic Chicken Shawarma',
      description: 'Tender marinated chicken with garlic sauce, pickles, and fries wrapped in fresh pita bread.',
      price: 9.99,
      image: 'https://images.pexels.com/photos/12842133/pexels-photo-12842133.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'shawarma'
    },
    {
      id: 2,
      name: 'Beef Shawarma Plate',
      description: 'Seasoned beef shawarma served with rice, hummus, salad, and warm pita bread.',
      price: 12.99,
      image: 'https://images.pexels.com/photos/7353379/pexels-photo-7353379.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'shawarma'
    },
    {
      id: 3,
      name: 'Lamb Shawarma Wrap',
      description: 'Juicy marinated lamb with tahini sauce, tomatoes, and onions wrapped in pita bread.',
      price: 10.99,
      image: 'https://images.pexels.com/photos/7353391/pexels-photo-7353391.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'shawarma'
    },
    {
      id: 4,
      name: 'Chicken Shawarma Bowl',
      description: 'Grilled chicken shawarma on a bed of rice with salad, hummus, and pickled vegetables.',
      price: 11.99,
      image: 'https://images.pexels.com/photos/5779365/pexels-photo-5779365.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'shawarma'
    },
    
    // Vegetarian
    {
      id: 5,
      name: 'Falafel Wrap',
      description: 'Crispy falafel with tahini sauce, fresh vegetables, and pickles in pita bread.',
      price: 8.99,
      image: 'https://images.pexels.com/photos/7353210/pexels-photo-7353210.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'vegetarian'
    },
    {
      id: 6,
      name: 'Veggie Platter',
      description: 'Grilled seasonal vegetables, hummus, tabbouleh, and warm pita bread.',
      price: 10.99,
      image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'vegetarian'
    },
    {
      id: 7,
      name: 'Eggplant Sandwich',
      description: 'Roasted eggplant with tahini, tomatoes, and herbs in fresh bread.',
      price: 9.49,
      image: 'https://images.pexels.com/photos/5779391/pexels-photo-5779391.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'vegetarian'
    },
    
    // Appetizers
    {
      id: 8,
      name: 'Mezza Platter',
      description: 'Selection of hummus, baba ghanoush, tabbouleh, falafel, and pita bread.',
      price: 14.99,
      image: 'https://images.pexels.com/photos/7432640/pexels-photo-7432640.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'appetizer'
    },
    {
      id: 9,
      name: 'Hummus',
      description: 'Creamy chickpea dip with olive oil, lemon juice, and tahini served with warm pita bread.',
      price: 5.99,
      image: 'https://images.pexels.com/photos/1618911/pexels-photo-1618911.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'appetizer'
    },
    {
      id: 10,
      name: 'Stuffed Grape Leaves',
      description: 'Rice, pine nuts, and herbs wrapped in tender grape leaves.',
      price: 6.99,
      image: 'https://images.pexels.com/photos/8580793/pexels-photo-8580793.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'appetizer'
    },
    
    // Grill
    {
      id: 11,
      name: 'Chicken Kebab',
      description: 'Marinated chicken skewers grilled to perfection, served with rice and vegetables.',
      price: 12.99,
      image: 'https://images.pexels.com/photos/6210747/pexels-photo-6210747.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'grill'
    },
    {
      id: 12,
      name: 'Lamb Kofta Kebab',
      description: 'Grilled minced lamb skewers with spices, served with rice and grilled vegetables.',
      price: 13.99,
      image: 'https://images.pexels.com/photos/6252746/pexels-photo-6252746.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'grill'
    },
    {
      id: 13,
      name: 'Mixed Grill Platter',
      description: 'Combination of chicken, beef, and lamb with grilled vegetables and rice.',
      price: 18.99,
      image: 'https://images.pexels.com/photos/3659862/pexels-photo-3659862.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'grill'
    },
    
    // Sides
    {
      id: 14,
      name: 'Tabbouleh Salad',
      description: 'Fresh parsley, bulgur wheat, tomatoes, and lemon juice.',
      price: 4.99,
      image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'sides'
    },
    {
      id: 15,
      name: 'Saffron Rice',
      description: 'Fragrant basmati rice cooked with saffron and spices.',
      price: 3.99,
      image: 'https://images.pexels.com/photos/7438466/pexels-photo-7438466.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'sides'
    },
    {
      id: 16,
      name: 'Spiced Fries',
      description: 'Crispy fries tossed in our special Middle Eastern spice blend.',
      price: 4.49,
      image: 'https://images.pexels.com/photos/1893556/pexels-photo-1893556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'sides'
    },
    
    // Desserts
    {
      id: 17,
      name: 'Baklava',
      description: 'Sweet layered pastry with chopped nuts and honey syrup.',
      price: 4.99,
      image: 'https://images.pexels.com/photos/2638026/pexels-photo-2638026.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'dessert'
    },
    {
      id: 18,
      name: 'Kunafa',
      description: 'Sweet cheese pastry soaked in sweet syrup.',
      price: 5.99,
      image: 'https://images.pexels.com/photos/9152183/pexels-photo-9152183.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'dessert'
    },
    {
      id: 19,
      name: 'Rice Pudding',
      description: 'Creamy rice pudding with cinnamon and pistachios.',
      price: 4.49,
      image: 'https://images.pexels.com/photos/16594756/pexels-photo-16594756/free-photo-of-orez-cu-lapte-de-cocos-si-mango.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'dessert'
    },
    
    // Drinks
    {
      id: 20,
      name: 'Mint Lemonade',
      description: 'Refreshing homemade lemonade with fresh mint leaves.',
      price: 3.49,
      image: 'https://images.pexels.com/photos/989960/pexels-photo-989960.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'drinks'
    },
    {
      id: 21,
      name: 'Jallab',
      description: 'Sweet syrup made from dates, grapes, and rose water, with pine nuts.',
      price: 3.99,
      image: 'https://images.pexels.com/photos/2089717/pexels-photo-2089717.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'drinks'
    },
    {
      id: 22,
      name: 'Turkish Coffee',
      description: 'Strong coffee prepared in a traditional copper pot.',
      price: 2.99,
      image: 'https://images.pexels.com/photos/3020919/pexels-photo-3020919.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      category: 'drinks'
    }
  ];

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="py-24 bg-neutral-50">
      <div className="container mx-auto px-4 md:px-8">
        {showBanner && (
          <motion.div 
            className="bg-primary-500 text-white p-4 rounded-lg mb-8 flex justify-between items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center">
              <FaCheck className="mr-2" />
              <p>Free delivery on orders over $30! Use code: FREESHIP</p>
            </div>
            <button 
              onClick={() => setShowBanner(false)}
              className="text-white hover:text-neutral-200 transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}

        <div ref={headerRef}>
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-4">
              Order Online
            </h1>
            <p className="text-neutral-700 max-w-2xl mx-auto">
              Enjoy our Middle Eastern cuisine from the comfort of your home. Order now for pickup or delivery.
            </p>
          </motion.div>

          <motion.div 
            className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full transition-colors duration-300 ${
                  activeCategory === category.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={headerInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.3 + (index * 0.05) }}
              >
                {category.name}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce delay-150"></div>
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce delay-300"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * (index % 6) }}
              >
                <MenuItemCard item={item} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderOnline;