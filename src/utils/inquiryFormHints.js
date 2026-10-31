/** Combines Web3Forms + Firestore failure messages for franchise/catering forms. */
export function buildInquiryErrorHint(emailResult, firebaseResult) {
  const parts = [];
  const em = (emailResult?.error || '').toLowerCase();
  if (em.includes('access key')) {
    parts.push(
      'Email: The Web3Forms access key is missing or invalid. Create a free key at https://web3forms.com (using shawarmaalleyfranchise@gmail.com), set VITE_WEB3FORMS_ACCESS_KEY in .env.local, then restart the dev server and rebuild for production.'
    );
  } else if (emailResult && !emailResult.success && emailResult.error) {
    parts.push(`Email: ${emailResult.error}`);
  }
  if (firebaseResult && !firebaseResult.success && firebaseResult.error) {
    parts.push(`Save: ${firebaseResult.error}`);
  }
  return parts.join(' ');
}
