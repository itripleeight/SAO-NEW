// Web3Forms email integration (replaces EmailJS).
// Free tier: staff notification emails to the inbox tied to your access key,
// plus custom subject / from_name / reply-to and honeypot spam protection.
// All three forms (franchise, catering, feedback) deliver to the same inbox
// (shawarmaalleyfranchise@gmail.com), so a single access key covers everything.
//
// Not available on the Web3Forms free tier (were used by the old EmailJS setup):
//   - Guest auto-reply / confirmation email to the customer (PRO autoresponder)
//   - CC / BCC copies (the old "Bcc yourself for testing" behavior)
// Upgrade to Web3Forms PRO and configure the autoresponder in their dashboard
// if you want guest confirmations back.

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

/** Staff inbox shown for reference; actual delivery is set by the access key's owner email. */
const STAFF_INBOX = 'shawarmaalleyfranchise@gmail.com';

/**
 * Web3Forms access keys (public, safe for client-side use — Web3Forms confirms this).
 * One key per form so submissions stay organized per-form in the Web3Forms dashboard.
 * All keys belong to shawarmaalleyfranchise@gmail.com and deliver to that inbox.
 * Override per-environment with VITE_WEB3FORMS_ACCESS_KEY_<KIND> in .env.local.
 */
const WEB3FORMS_ACCESS_KEY_DEFAULTS = {
  franchise: '2c9bf12b-e15f-479f-9790-679089e85b13',
  catering: '44622c00-9c8a-4924-9eea-d5ae670d7aa4',
  feedback: '3679bcaf-b2f2-411e-a307-6697fc29c93e'
};

function getAccessKey(kind) {
  const envOverride = {
    franchise: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY_FRANCHISE,
    catering: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY_CATERING,
    feedback: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY_FEEDBACK
  }[kind];
  return envOverride?.trim() || WEB3FORMS_ACCESS_KEY_DEFAULTS[kind] || '';
}

/**
 * POST a field map to Web3Forms. Returns { success, response } or { success: false, error }
 * to match the shape the form pages already expect.
 */
async function submitToWeb3Forms(kind, fields) {
  const accessKey = getAccessKey(kind);
  if (!accessKey) {
    return {
      success: false,
      error:
        'Web3Forms access key is not configured. Add the key to .env.local (get a free key at https://web3forms.com), then restart the dev server.'
    };
  }

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        access_key: accessKey,
        // Honeypot: real users leave this empty; bots tend to fill it.
        botcheck: '',
        ...fields
      })
    });

    const data = await response.json();
    if (data.success) {
      console.log('Web3Forms submission sent:', data);
      return { success: true, response: data };
    }

    console.error('Web3Forms rejected submission:', data);
    return { success: false, error: data.message || 'Web3Forms submission failed' };
  } catch (error) {
    console.error('Web3Forms request failed:', error);
    return { success: false, error: error.message || 'Network error contacting Web3Forms' };
  }
}

/**
 * Franchise staff notification (to STAFF_INBOX via the access key).
 * Field keys become the labels shown in the notification email body.
 */
export const sendFranchiseInquiry = async (formData) => {
  return submitToWeb3Forms('franchise', {
    subject: 'Franchise Inquiry - Shawarma Alley',
    from_name: 'Shawarma Alley Website',
    replyto: formData.email,
    'Form Type': 'Franchise Inquiry',
    Name: `${formData.firstName} ${formData.lastName}`.trim(),
    Email: formData.email,
    Phone: String(formData.phone || ''),
    City: String(formData.city || ''),
    Province: String(formData.province || ''),
    'Investment Range': String(formData.investmentRange || ''),
    Experience: String(formData.experience || ''),
    Timeline: String(formData.timeline || ''),
    Message: String(formData.message || '').trim() || 'No additional message provided'
  });
};

/**
 * Catering staff notification (to STAFF_INBOX via the access key).
 */
export const sendCateringInquiry = async (formData) => {
  return submitToWeb3Forms('catering', {
    subject: 'Catering Inquiry - Shawarma Alley',
    from_name: 'Shawarma Alley Website',
    replyto: formData.email,
    'Form Type': 'Catering Inquiry',
    Name: `${formData.firstName} ${formData.lastName}`.trim(),
    Email: formData.email,
    Phone: String(formData.phone || ''),
    City: String(formData.city || ''),
    Province: String(formData.province || ''),
    'Guest Range': String(formData.guestRange || ''),
    'Event Date': String(formData.eventDate || ''),
    'Event Type': String(formData.eventType || ''),
    'Service Style': String(formData.serviceStyle || ''),
    'Preferred Location': String(formData.preferredLocation || '').trim() || 'No preference',
    Message: String(formData.message || '').trim() || 'No additional details provided'
  });
};

/**
 * Feedback staff notification (to STAFF_INBOX via the access key).
 */
export const sendFeedbackInquiry = async (formData) => {
  return submitToWeb3Forms('feedback', {
    subject: 'Customer Feedback - Shawarma Alley',
    from_name: 'Shawarma Alley Website',
    replyto: formData.email,
    'Form Type': 'Customer Feedback',
    Name: `${formData.firstName} ${formData.lastName}`.trim(),
    Email: formData.email,
    Phone: String(formData.phone || ''),
    'Feedback Type': String(formData.feedbackType || ''),
    Location: String(formData.venue || '').trim() || 'Not specified',
    'Visit or Order Date': String(formData.visitDate || '').trim() || 'Not provided',
    'Order Number': String(formData.orderNumber || '').trim() || 'Not provided',
    Message: String(formData.message || '').trim() || 'No message provided'
  });
};
