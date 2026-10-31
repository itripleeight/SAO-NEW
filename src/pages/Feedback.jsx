import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaCommentDots, FaHeart, FaClock, FaUtensils, FaCheck } from 'react-icons/fa';
import { sendFeedbackInquiry } from '../services/emailService';
import {
  submitFeedbackInquiry as submitToFirestore,
  INQUIRY_FORM_GUARD_TIMEOUT_MS
} from '../services/firebaseService';
import { buildInquiryErrorHint } from '../utils/inquiryFormHints';

/** YYYY-MM-DD in local timezone for visit date max (today). */
function getLocalDateIsoString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const Feedback = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    venue: '',
    feedbackType: '',
    visitDate: '',
    orderNumber: '',
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

  const [pointsRef, pointsInView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const visitDateMax = getLocalDateIsoString();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    isSubmittingRef.current = true;
    setSubmitStatus(null);
    setSubmitErrorHint('');

    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'feedbackType',
      'visitDate',
      'message'
    ];
    const emptyFields = requiredFields.filter((field) => !formData[field] || formData[field].trim() === '');

    if (emptyFields.length > 0) {
      setSubmitStatus('error');
      setSubmitErrorHint('Please fill in all required fields.');
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      return;
    }

    const submissionTimeout = setTimeout(() => {
      if (isSubmittingRef.current) {
        console.error('Submission timeout - resetting form');
        setIsSubmitting(false);
        isSubmittingRef.current = false;
        setSubmitStatus('error');
        setSubmitErrorHint('Request timed out. Check your connection and try again.');
      }
    }, INQUIRY_FORM_GUARD_TIMEOUT_MS);

    let emailResult = null;
    let firebaseResult = null;

    const resetForm = () => ({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      venue: '',
      feedbackType: '',
      visitDate: '',
      orderNumber: '',
      message: ''
    });

    try {
      console.log('Attempting to send feedback via Web3Forms...');
      emailResult = await sendFeedbackInquiry(formData);

      if (emailResult.success) {
        clearTimeout(submissionTimeout);
        console.log('Email sent successfully via Web3Forms');
        setSubmitStatus('success');
        setFormData(resetForm());
      } else {
        console.warn('Web3Forms failed, trying Firebase Firestore as fallback...');
        firebaseResult = await submitToFirestore(formData);

        clearTimeout(submissionTimeout);
        if (firebaseResult.success) {
          console.log('Form saved successfully to Firestore');
          setSubmitStatus('success');
          setFormData(resetForm());
        } else {
          console.error('Both Web3Forms and Firebase failed');
          setSubmitStatus('error');
          setSubmitErrorHint(buildInquiryErrorHint(emailResult, firebaseResult));
        }
      }
    } catch (error) {
      clearTimeout(submissionTimeout);
      console.error('Form submission failed:', error);
      try {
        console.log('Attempting Firebase fallback...');
        firebaseResult = await submitToFirestore(formData);
        if (firebaseResult.success) {
          setSubmitStatus('success');
          setFormData(resetForm());
        } else {
          setSubmitStatus('error');
          setSubmitErrorHint(buildInquiryErrorHint(emailResult, firebaseResult));
        }
      } catch (fallbackError) {
        console.error('All submission methods failed:', fallbackError);
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

  const scrollToFeedbackForm = () => {
    document.getElementById('feedback-inquiry-form')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const highlights = [
    {
      icon: <FaCommentDots size={32} className="text-primary-500" />,
      title: 'We listen',
      description: 'Compliments, ideas, and concerns all help us improve what we serve and how we serve it.'
    },
    {
      icon: <FaHeart size={32} className="text-primary-500" />,
      title: 'Your experience matters',
      description: 'Tell us what stood out, from food quality to service speed, so we can keep getting better.'
    },
    {
      icon: <FaClock size={32} className="text-primary-500" />,
      title: 'Timely follow-up',
      description: 'We review submissions regularly and will reach out when your message needs a direct reply.'
    },
    {
      icon: <FaUtensils size={32} className="text-primary-500" />,
      title: 'Details help',
      description: 'Location, date, and what you ordered make it easier for us to understand the full picture.'
    }
  ];

  const tips = [
    'Mention which location you visited or ordered from',
    'Include approximate date and time if you remember',
    'Name menu items or order type when relevant',
    'Add contact info so we can respond if needed'
  ];

  return (
    <div className="bg-neutral-50">
      <div
        className="relative h-96 md:h-[500px] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.pexels.com/photos/5779413/pexels-photo-5779413.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)'
        }}
      >
        <div ref={heroRef} className="text-center px-4 max-w-4xl">
          <motion.h1
            className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            Share your feedback
          </motion.h1>
          <motion.p
            className="text-xl text-neutral-200 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Tell us what you loved, what we can improve, or anything else on your mind
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.35 }}
          >
            <button
              type="button"
              onClick={scrollToFeedbackForm}
              className="inline-block px-10 py-3.5 bg-primary-500 text-white text-lg rounded-full hover:bg-primary-600 transition-colors duration-300 font-medium shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
            >
              Feedback
            </button>
          </motion.div>
        </div>
      </div>

      <section ref={pointsRef} className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif mb-4 text-neutral-900">Why we ask</h2>
            <p className="text-neutral-700">
              Honest feedback from guests is how we tune recipes, training, and service across every Shawarma Alley.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {highlights.map((item, index) => (
              <motion.div
                key={index}
                className="text-center p-6 rounded-lg transition-all duration-300 hover:bg-neutral-50 hover:shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={pointsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.2 } }}
              >
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="font-serif text-xl font-medium text-neutral-900 mb-2">{item.title}</h3>
                <p className="text-neutral-700">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-2xl mx-auto text-center mb-8 md:mb-10">
            <h2 className="text-3xl md:text-4xl font-serif mb-4 text-neutral-900">
              Tips for a helpful note
            </h2>
          </div>
          <ul className="max-w-2xl mx-auto space-y-4">
            {tips.map((tip, index) => (
              <li key={index} className="flex gap-3 items-start">
                <FaCheck className="text-primary-500 mt-0.5 shrink-0" size={16} aria-hidden />
                <span className="text-neutral-700 leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="feedback-inquiry-form"
        className="scroll-mt-24 md:scroll-mt-28 py-16 md:py-24 bg-white"
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif mb-4 text-neutral-900">Send us a message</h2>
              <p className="text-neutral-700 max-w-2xl mx-auto">
                Complete the form below. If you prefer not to use the form, you can email us directly at the address at
                the bottom of this page.
              </p>
            </div>

            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-100 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-8 text-center"
              >
                <FaCheck className="inline mr-2" />
                Thank you! We received your feedback and appreciate you taking the time.
              </motion.div>
            )}

            {submitStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-8 text-left text-sm leading-relaxed"
              >
                <p className="font-medium text-center">We could not submit your message automatically.</p>
                {submitErrorHint ? <p className="mt-3 text-red-900/90">{submitErrorHint}</p> : null}
                <p className="mt-3 text-center text-red-800/90">
                  Email{' '}
                  <a className="underline font-medium" href="mailto:shawarmaalleyfranchise@gmail.com">
                    shawarmaalleyfranchise@gmail.com
                  </a>{' '}
                  or call your nearest Shawarma Alley.
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
                  <label htmlFor="feedbackType" className="block text-sm font-medium text-neutral-700 mb-2">
                    What is this about? *
                  </label>
                  <select
                    id="feedbackType"
                    name="feedbackType"
                    value={formData.feedbackType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select one</option>
                    <option value="Compliment">Compliment</option>
                    <option value="Suggestion">Suggestion</option>
                    <option value="Concern">Concern</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="venue" className="block text-sm font-medium text-neutral-700 mb-2">
                    Location (optional)
                  </label>
                  <select
                    id="venue"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Not specified</option>
                    <option value="Georgetown">Georgetown</option>
                    <option value="Guelph">Guelph</option>
                    <option value="Milton">Milton</option>
                    <option value="Brampton">Brampton</option>
                    <option value="Orangeville">Orangeville</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="visitDate" className="block text-sm font-medium text-neutral-700 mb-2">
                    Visit or order date *
                  </label>
                  <input
                    type="date"
                    id="visitDate"
                    name="visitDate"
                    value={formData.visitDate}
                    onChange={handleInputChange}
                    required
                    max={visitDateMax}
                    className="w-full px-4 py-3 rounded-md border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent [color-scheme:light]"
                  />
                </div>
                <div>
                  <label htmlFor="orderNumber" className="block text-sm font-medium text-neutral-700 mb-2">
                    Order number (optional)
                  </label>
                  <input
                    type="text"
                    id="orderNumber"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleInputChange}
                    autoComplete="off"
                    className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Receipt or order ID"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
                  Your feedback *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  required
                  className="w-full px-4 py-3 rounded-md border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Share as much detail as possible."
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
                  'Submit feedback'
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Feedback;
