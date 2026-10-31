import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaStore, FaHandshake, FaChartLine, FaUsers, FaCheck, FaPhone } from 'react-icons/fa';
import { sendFranchiseInquiry } from '../services/emailService';
import {
  submitFranchiseInquiry as submitToFirestore,
  INQUIRY_FORM_GUARD_TIMEOUT_MS
} from '../services/firebaseService';
import { buildInquiryErrorHint } from '../utils/inquiryFormHints';

const Franchise = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    province: '',
    investmentRange: '',
    experience: '',
    timeline: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitErrorHint, setSubmitErrorHint] = useState('');
  const isSubmittingRef = useRef(false);

  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const [benefitsRef, benefitsInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    isSubmittingRef.current = true;
    setSubmitStatus(null);
    setSubmitErrorHint('');

    // Validate form data before sending
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'city', 'province', 'investmentRange', 'experience', 'timeline'];
    const emptyFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
    
    if (emptyFields.length > 0) {
      setSubmitStatus('error');
      setSubmitErrorHint('Please fill in all required fields.');
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      return;
    }

    // Add overall timeout to prevent infinite loading
    const submissionTimeout = setTimeout(() => {
      if (isSubmittingRef.current) {
        console.error('⏱️ Submission timeout - resetting form');
        setIsSubmitting(false);
        isSubmittingRef.current = false;
        setSubmitStatus('error');
        setSubmitErrorHint('Request timed out. Check your connection and try again.');
      }
    }, INQUIRY_FORM_GUARD_TIMEOUT_MS);

    let emailResult = null;
    let firebaseResult = null;

    try {
      // Try Web3Forms first
      console.log('📧 Attempting to send email via Web3Forms...');
      emailResult = await sendFranchiseInquiry(formData);
      
      if (emailResult.success) {
        clearTimeout(submissionTimeout);
        console.log('✅ Email sent successfully via Web3Forms');
        setSubmitStatus('success');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          city: '',
          province: '',
          investmentRange: '',
          experience: '',
          timeline: '',
          message: ''
        });
      } else {
        // If Web3Forms fails, try Firebase as fallback
        console.warn('⚠️ Web3Forms failed, trying Firebase Firestore as fallback...');
        firebaseResult = await submitToFirestore(formData);
        
        clearTimeout(submissionTimeout);
        if (firebaseResult.success) {
          console.log('✅ Form saved successfully to Firestore');
          setSubmitStatus('success');
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            city: '',
            province: '',
            investmentRange: '',
            experience: '',
            timeline: '',
            message: ''
          });
        } else {
          console.error('❌ Both Web3Forms and Firebase failed');
          setSubmitStatus('error');
          setSubmitErrorHint(buildInquiryErrorHint(emailResult, firebaseResult));
        }
      }
    } catch (error) {
      clearTimeout(submissionTimeout);
      console.error('❌ Form submission failed:', error);
      // Try Firebase as last resort
      try {
        console.log('🔄 Attempting Firebase fallback...');
        firebaseResult = await submitToFirestore(formData);
        if (firebaseResult.success) {
          setSubmitStatus('success');
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            city: '',
            province: '',
            investmentRange: '',
            experience: '',
            timeline: '',
            message: ''
          });
        } else {
          setSubmitStatus('error');
          setSubmitErrorHint(buildInquiryErrorHint(emailResult, firebaseResult));
        }
      } catch (fallbackError) {
        console.error('❌ All submission methods failed:', fallbackError);
        setSubmitStatus('error');
        setSubmitErrorHint(
          buildInquiryErrorHint(emailResult, firebaseResult) ||
            'Something went wrong. You can still email shawarmaalleyfranchise@gmail.com or call +1 905-877-5559.'
        );
      }
    } finally {
      clearTimeout(submissionTimeout);
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const scrollToFranchiseForm = () => {
    document.getElementById('franchise-inquiry-form')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const benefits = [
    {
      icon: <FaStore size={32} className="text-primary-500" />,
      title: 'Proven Business Model',
      description: 'Join a successful franchise with established systems and processes that work.'
    },
    {
      icon: <FaHandshake size={32} className="text-primary-500" />,
      title: 'Ongoing Support',
      description: 'Comprehensive training, marketing support, and operational guidance throughout your journey.'
    },
    {
      icon: <FaChartLine size={32} className="text-primary-500" />,
      title: 'Growth Potential',
      description: 'Tap into the growing Middle Eastern food market with our popular menu.'
    },
    {
      icon: <FaUsers size={32} className="text-primary-500" />,
      title: 'Brand Recognition',
      description: 'Benefit from our established brand reputation and loyal customer base.'
    }
  ];

  const requirements = [
    'Adequate liquid capital for investment',
    'Competitive total investment package available',
    'Restaurant or food service experience preferred',
    'Commitment to brand standards and values',
    'Ability to operate in designated territory',
    'Strong business and leadership skills'
  ];

  return (
    <div className="bg-neutral-50">
      {/* Hero Section */}
      <div 
        className="relative h-96 md:h-[500px] bg-cover bg-center flex items-center justify-center"
        style={{ 
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.pexels.com/photos/5779371/pexels-photo-5779371.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)'
        }}
      >
        <div ref={heroRef} className="text-center px-4 max-w-4xl">
          <motion.h1 
            className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            Own a Shawarma Alley Franchise
          </motion.h1>
          <motion.p 
            className="text-xl text-neutral-200 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Join our growing family and bring Middle Eastern flavors to your community
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.35 }}
          >
            <button
              type="button"
              onClick={scrollToFranchiseForm}
              className="inline-block px-10 py-3.5 bg-primary-500 text-white text-lg rounded-full hover:bg-primary-600 transition-colors duration-300 font-medium shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
            >
              Apply
            </button>
          </motion.div>
        </div>
      </div>

      {/* Benefits Section */}
      <section ref={benefitsRef} className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif mb-4 text-neutral-900">Why Choose Shawarma Alley?</h2>
            <p className="text-neutral-700 max-w-2xl mx-auto">
              Partner with a brand that's committed to quality and your success
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="text-center p-6 rounded-lg transition-all duration-300 hover:bg-neutral-50 hover:shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.2 } }}
              >
                <div className="flex justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="font-serif text-xl font-medium text-neutral-900 mb-2">{benefit.title}</h3>
                <p className="text-neutral-700">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 md:py-24 bg-neutral-100">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif mb-6 text-neutral-900">Franchise Requirements</h2>
              <p className="text-neutral-700 mb-8">
                We're looking for passionate entrepreneurs who share our commitment to quality and customer service.
              </p>
              <ul className="space-y-4">
                {requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <FaCheck className="text-primary-500 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-neutral-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/2253643/pexels-photo-2253643.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                alt="Restaurant interior" 
                className="rounded-lg shadow-xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section
        id="franchise-inquiry-form"
        className="scroll-mt-24 md:scroll-mt-28 py-16 md:py-24 bg-white"
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif mb-4 text-neutral-900">Start Your Franchise Journey</h2>
              <p className="text-neutral-700 max-w-2xl mx-auto">
                Ready to join the Shawarma Alley family? Fill out the form below and we'll get in touch with you soon.
              </p>
            </div>

            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-100 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-8 text-center"
              >
                <FaCheck className="inline mr-2" />
                Thank you for your interest! We'll contact you within 24 hours.
              </motion.div>
            )}

            {submitStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-8 text-left text-sm leading-relaxed"
              >
                <p className="font-medium text-center">We could not submit your inquiry automatically.</p>
                {submitErrorHint ? (
                  <p className="mt-3 text-red-900/90">{submitErrorHint}</p>
                ) : null}
                <p className="mt-3 text-center text-red-800/90">
                  You can still reach us at{' '}
                  <a className="underline font-medium" href="mailto:shawarmaalleyfranchise@gmail.com">shawarmaalleyfranchise@gmail.com</a>
                  {' '}or +1 905-877-5559.
                </p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="bg-neutral-50 rounded-lg p-8 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-neutral-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="province" className="block text-sm font-medium text-neutral-700 mb-2">
                    Province/State *
                  </label>
                  <input
                    type="text"
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="investmentRange" className="block text-sm font-medium text-neutral-700 mb-2">
                    Investment Range *
                  </label>
                  <select
                    id="investmentRange"
                    name="investmentRange"
                    value={formData.investmentRange}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select investment range</option>
                    <option value="$150,000 - $250,000">$150,000 - $250,000</option>
                    <option value="$250,000 - $350,000">$250,000 - $350,000</option>
                    <option value="$350,000 - $500,000">$350,000 - $500,000</option>
                    <option value="$500,000+">$500,000+</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-neutral-700 mb-2">
                    Restaurant Experience *
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select experience level</option>
                    <option value="No experience">No experience</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="timeline" className="block text-sm font-medium text-neutral-700 mb-2">
                  Timeline to Open *
                </label>
                <select
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select timeline</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6-12 months">6-12 months</option>
                  <option value="1-2 years">1-2 years</option>
                  <option value="2+ years">2+ years</option>
                </select>
              </div>

              <div className="mb-8">
                <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
                  Additional Information
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tell us more about your interest in franchising with Shawarma Alley..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Franchise Inquiry'
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Franchise;