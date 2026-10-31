import { db, auth } from '../firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

/** Must exceed anonymous sign-in + listener latency on slow networks. */
const AUTH_TIMEOUT_MS = 15000;
/** Firestore writes can stall behind TLS, extensions, or cold rules evaluation. */
const FIRESTORE_WRITE_TIMEOUT_MS = 45000;

/**
 * Minimum time forms should wait before showing a client-side "still submitting" timeout.
 * Must exceed: Web3Forms attempt + auth (up to AUTH_TIMEOUT_MS) + Firestore write race (FIRESTORE_WRITE_TIMEOUT_MS).
 */
export const INQUIRY_FORM_GUARD_TIMEOUT_MS =
  AUTH_TIMEOUT_MS + FIRESTORE_WRITE_TIMEOUT_MS + 20000;

// Function to ensure user is authenticated
const ensureAuthenticated = () => {
  return new Promise((resolve, reject) => {
    if (auth.currentUser) {
      console.log('✅ User already authenticated:', auth.currentUser.uid);
      resolve(auth.currentUser);
      return;
    }

    let settled = false;
    let unsubscribe = () => {};

    const finish = (fn, arg) => {
      if (settled) return;
      settled = true;
      clearTimeout(authTimeoutId);
      fn(arg);
    };

    const authTimeoutId = setTimeout(() => {
      unsubscribe();
      finish(reject, new Error('Authentication timeout'));
    }, AUTH_TIMEOUT_MS);

    unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('✅ User authenticated:', user.uid);
        unsubscribe();
        finish(resolve, user);
      }
    });

    console.log('🔐 Signing in anonymously...');
    signInAnonymously(auth)
      .then((userCredential) => {
        console.log('✅ Anonymous sign-in successful:', userCredential.user.uid);
      })
      .catch((error) => {
        console.error('❌ Anonymous sign-in failed:', error);
        unsubscribe();
        finish(reject, error);
      });
  });
};

/** User-facing copy for common Firestore web client failures (ad blockers, OAuth, offline). */
function getFirestoreSubmissionUserMessage(error) {
  const code = error?.code || '';
  const raw = `${error?.message || ''} ${String(error)}`;
  const lower = raw.toLowerCase();

  if (code === 'permission-denied') {
    return 'Could not save: Firestore blocked this write (permission denied). Ask the site admin to allow creates on this collection for signed-in users.';
  }
  if (
    lower.includes('blocked by client') ||
    lower.includes('err_blocked') ||
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network request failed') ||
    lower.includes('client is offline') ||
    lower.includes('load failed') ||
    code === 'unavailable'
  ) {
    return 'Could not reach Firestore. A browser extension (ad blocker, privacy shield, or similar) often blocks firestore.googleapis.com. Try disabling it for this site, allowlisting Google/Firebase, or use another browser or incognito with extensions off.';
  }
  if (lower.includes('timeout')) {
    return 'Request timed out. Check your connection, disable extensions that block Google APIs, and confirm Firestore rules allow creates for signed-in users on this collection. Then try again.';
  }
  return error?.message || 'Unknown error';
}

// Helper function to add timeout to promises
const withTimeout = (promise, timeoutMs) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout - please check your browser extensions or network settings')), timeoutMs)
    )
  ]);
};

export const submitFranchiseInquiry = async (formData) => {
  try {
    console.log('🚀 Starting franchise form submission...');
    console.log('📝 Form data received:', formData);
    
    await ensureAuthenticated();
    console.log('✅ Authentication confirmed');
    
    // Prepare the data with all required fields
    const inquiryData = {
      // Personal Information
      firstName: String(formData.firstName || ''),
      lastName: String(formData.lastName || ''),
      email: String(formData.email || ''),
      phone: String(formData.phone || ''),
      
      // Location Information  
      city: String(formData.city || ''),
      province: String(formData.province || ''),
      
      // Business Information
      investmentRange: String(formData.investmentRange || ''),
      experience: String(formData.experience || ''),
      timeline: String(formData.timeline || ''),
      message: String(formData.message || ''),
      
      // System fields
      submittedAt: Timestamp.now(),
      status: 'new',
      userId: auth.currentUser.uid,
      
      // Full name for easier searching
      fullName: `${formData.firstName || ''} ${formData.lastName || ''}`.trim()
    };

    console.log('📋 Prepared data for Firestore:', inquiryData);
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'city', 'province', 'investmentRange', 'experience', 'timeline'];
    const missingFields = requiredFields.filter(field => !inquiryData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    console.log('✅ All required fields validated');
    
    // Get collection reference
    const collectionRef = collection(db, 'franchiseInquiries');
    console.log('📁 Collection reference created for: franchiseInquiries');
    
    // Add the document with timeout (15 seconds)
    console.log('💾 Attempting to add document...');
    const docRef = await withTimeout(addDoc(collectionRef, inquiryData), FIRESTORE_WRITE_TIMEOUT_MS);
    
    console.log('🎉 SUCCESS! Document written with ID:', docRef.id);
    return { success: true, id: docRef.id };

  } catch (error) {
    console.error('❌ ERROR submitting franchise form:', error);
    console.error('Error details:', {
      name: error.name,
      code: error.code,
      message: error.message
    });
    
    return { success: false, error: getFirestoreSubmissionUserMessage(error) };
  }
};

export const submitCateringInquiry = async (formData) => {
  try {
    console.log('🚀 Starting catering form submission...');

    await ensureAuthenticated();

    const inquiryData = {
      firstName: String(formData.firstName || ''),
      lastName: String(formData.lastName || ''),
      email: String(formData.email || ''),
      phone: String(formData.phone || ''),
      city: String(formData.city || ''),
      province: String(formData.province || ''),
      eventDate: String(formData.eventDate || ''),
      guestRange: String(formData.guestRange || ''),
      eventType: String(formData.eventType || ''),
      serviceStyle: String(formData.serviceStyle || ''),
      preferredLocation: String(formData.preferredLocation || ''),
      message: String(formData.message || ''),
      submittedAt: Timestamp.now(),
      status: 'new',
      userId: auth.currentUser.uid,
      fullName: `${formData.firstName || ''} ${formData.lastName || ''}`.trim()
    };

    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'city',
      'province',
      'eventDate',
      'guestRange',
      'eventType',
      'serviceStyle'
    ];
    const missingFields = requiredFields.filter(field => !inquiryData[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const collectionRef = collection(db, 'cateringInquiries');
    const docRef = await withTimeout(addDoc(collectionRef, inquiryData), FIRESTORE_WRITE_TIMEOUT_MS);

    console.log('🎉 Catering inquiry saved:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('❌ ERROR submitting catering form:', error);
    if (error?.code) {
      console.error('Firestore error code:', error.code);
    }
    return { success: false, error: getFirestoreSubmissionUserMessage(error) };
  }
};

export const submitFeedbackInquiry = async (formData) => {
  try {
    console.log('🚀 Starting feedback form submission...');

    await ensureAuthenticated();

    const inquiryData = {
      firstName: String(formData.firstName || ''),
      lastName: String(formData.lastName || ''),
      email: String(formData.email || ''),
      phone: String(formData.phone || ''),
      venue: String(formData.venue || ''),
      feedbackType: String(formData.feedbackType || ''),
      visitDate: String(formData.visitDate || ''),
      orderNumber: String(formData.orderNumber || ''),
      message: String(formData.message || ''),
      submittedAt: Timestamp.now(),
      status: 'new',
      userId: auth.currentUser.uid,
      fullName: `${formData.firstName || ''} ${formData.lastName || ''}`.trim()
    };

    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'feedbackType', 'visitDate', 'message'];
    const missingFields = requiredFields.filter((field) => !inquiryData[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const collectionRef = collection(db, 'feedbackInquiries');
    const docRef = await withTimeout(addDoc(collectionRef, inquiryData), FIRESTORE_WRITE_TIMEOUT_MS);

    console.log('🎉 Feedback inquiry saved:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('❌ ERROR submitting feedback form:', error);
    if (error?.code) {
      console.error('Firestore error code:', error.code);
    }
    return { success: false, error: getFirestoreSubmissionUserMessage(error) };
  }
};