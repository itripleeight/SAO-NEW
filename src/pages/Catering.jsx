import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaUtensils, FaUsers, FaTruck, FaLeaf, FaCheck } from 'react-icons/fa';
import { sendCateringInquiry } from '../services/emailService';
import {
  submitCateringInquiry as submitToFirestore,
  INQUIRY_FORM_GUARD_TIMEOUT_MS
} from '../services/firebaseService';
import { buildInquiryErrorHint } from '../utils/inquiryFormHints';

/** YYYY-MM-DD in local timezone (correct for `<input type="date" min />`). */
function getLocalDateIsoString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const Catering = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    province: '',
    eventDate: '',
    guestRange: '',
    eventType: '',
    serviceStyle: '',
    preferredLocation: '',
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

  const eventDateMin = getLocalDateIsoString();

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

    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'city', 'province', 'eventDate', 'guestRange', 'eventType', 'serviceStyle'];
    const emptyFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');

    if (emptyFields.length > 0) {
      setSubmitStatus('error');
      setSubmitErrorHint('Please fill in all required fields.');
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      return;
    }

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
      console.log('📧 Attempting to send catering inquiry via Web3Forms...');
      emailResult = await sendCateringInquiry(formData);

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
          eventDate: '',
          guestRange: '',
          eventType: '',
          serviceStyle: '',
          preferredLocation: '',
          message: ''
        });
      } else {
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
            eventDate: '',
            guestRange: '',
            eventType: '',
            serviceStyle: '',
            preferredLocation: '',
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
            eventDate: '',
            guestRange: '',
            eventType: '',
            serviceStyle: '',
            preferredLocation: '',
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
            'Something went wrong. Email shawarmaalleyfranchise@gmail.com or call your nearest location.'
        );
      }
    } finally {
      clearTimeout(submissionTimeout);
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const scrollToCateringForm = () => {
    document.getElementById('catering-inquiry-form')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const benefits = [
    {
      icon: <FaUtensils size={32} className="text-primary-500" />,
      title: 'Menus',
      description: 'Shawarma, sides, and salads prepared the same way we serve in our restaurants.'
    },
    {
      icon: <FaUsers size={32} className="text-primary-500" />,
      title: 'Built for groups',
      description: 'From office lunches to celebrations, we help you plan portions and formats that work.'
    },
    {
      icon: <FaTruck size={32} className="text-primary-500" />,
      title: 'Flexible service',
      description: 'Pickup, tray packs, and buffet-style options depending on your venue and timing.'
    },
    {
      icon: <FaLeaf size={32} className="text-primary-500" />,
      title: 'Dietary notes',
      description: 'Share allergies or preferences in your request and we will confirm what we can accommodate.'
    }
  ];

  return (
    <div className="bg-neutral-50">
      <div
        className="relative h-96 md:h-[500px] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.pexels.com/photos/18177333/pexels-photo-18177333.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)'
        }}
      >
        <div ref={heroRef} className="text-center px-4 max-w-4xl">
          <motion.h1
            className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            Catering by Shawarma Alley
          </motion.h1>
          <motion.p
            className="text-xl text-neutral-200 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Feed your guests Middle Eastern favorites with the same quality you love in-store
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.35 }}
          >
            <button
              type="button"
              onClick={scrollToCateringForm}
              className="inline-block px-10 py-3.5 bg-primary-500 text-white text-lg rounded-full hover:bg-primary-600 transition-colors duration-300 font-medium shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
            >
              Request a quote
            </button>
          </motion.div>
        </div>
      </div>

      <section ref={benefitsRef} className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif mb-4 text-neutral-900">Why cater with us?</h2>
            <p className="text-neutral-700 max-w-2xl mx-auto">
              Simple planning, generous portions, and flavors that travel well for offices, parties, and special occasions.
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

      <section
        id="catering-inquiry-form"
        className="scroll-mt-24 md:scroll-mt-28 py-16 md:py-24 bg-white"
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif mb-4 text-neutral-900">Request a catering quote</h2>
              <p className="text-neutral-700 max-w-2xl mx-auto">
                Share a few details below. We typically respond within one business day.
              </p>
            </div>

            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-100 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-8 text-center"
              >
                <FaCheck className="inline mr-2" />
                Thank you! We received your catering request and will be in touch soon.
              </motion.div>
            )}

            {submitStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-8 text-left text-sm leading-relaxed"
              >
                <p className="font-medium text-center">We could not submit your request automatically.</p>
                {submitErrorHint ? (
                  <p className="mt-3 text-red-900/90">{submitErrorHint}</p>
                ) : null}
                <p className="mt-3 text-center text-red-800/90">
                  Email{' '}
                  <a className="underline font-medium" href="mailto:shawarmaalleyfranchise@gmail.com">shawarmaalleyfranchise@gmail.com</a>
                  {' '}or call your nearest Shawarma Alley.
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
                  <label htmlFor="eventDate" className="block text-sm font-medium text-neutral-700 mb-2">
                    Event date *
                  </label>
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    min={eventDateMin}
                    required
                    className="w-full px-4 py-3 rounded-md border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent [color-scheme:light]"
                  />
                  <p className="mt-1.5 text-xs text-neutral-500">
                    Tap the field to open your browser’s calendar.
                  </p>
                </div>
                <div>
                  <label htmlFor="guestRange" className="block text-sm font-medium text-neutral-700 mb-2">
                    Approximate guest count *
                  </label>
                  <select
                    id="guestRange"
                    name="guestRange"
                    value={formData.guestRange}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select range</option>
                    <option value="Under 25">Under 25</option>
                    <option value="25-50">25-50</option>
                    <option value="50-100">50-100</option>
                    <option value="100-200">100-200</option>
                    <option value="200+">200+</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="eventType" className="block text-sm font-medium text-neutral-700 mb-2">
                    Event type *
                  </label>
                  <select
                    id="eventType"
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    <option value="Corporate / office">Corporate / office</option>
                    <option value="Wedding / celebration">Wedding / celebration</option>
                    <option value="Private party">Private party</option>
                    <option value="School / community">School / community</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="serviceStyle" className="block text-sm font-medium text-neutral-700 mb-2">
                    How would you like food served? *
                  </label>
                  <select
                    id="serviceStyle"
                    name="serviceStyle"
                    value={formData.serviceStyle}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select option</option>
                    <option value="Buffet / trays">Buffet / trays</option>
                    <option value="Family-style packs">Family-style packs</option>
                    <option value="Individual meals">Individual meals</option>
                    <option value="Pickup only">Pickup only</option>
                    <option value="Not sure yet">Not sure yet</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="preferredLocation" className="block text-sm font-medium text-neutral-700 mb-2">
                  Preferred location (optional)
                </label>
                <select
                  id="preferredLocation"
                  name="preferredLocation"
                  value={formData.preferredLocation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">No preference</option>
                  <option value="Georgetown">Georgetown</option>
                  <option value="Guelph">Guelph</option>
                  <option value="Milton">Milton</option>
                  <option value="Brampton">Brampton</option>
                  <option value="Orangeville">Orangeville</option>
                </select>
              </div>

              <div className="mb-8">
                <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
                  Menu notes, timing, or special requests
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Allergies, vegetarian counts, delivery address, setup time, etc."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit catering request'
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Catering;
