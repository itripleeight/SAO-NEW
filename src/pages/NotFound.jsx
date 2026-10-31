import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 px-4">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-6xl font-serif font-bold text-primary-500 mb-4">404</h1>
          <h2 className="text-3xl font-medium text-neutral-800 mb-6">Page Not Found</h2>
          <p className="text-neutral-600 mb-8 max-w-md mx-auto">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link 
            to="/" 
            className="px-8 py-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors duration-300 font-medium inline-block"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;