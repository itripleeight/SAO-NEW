# Shawarma Alley Website

## EmailJS Setup for Franchise Forms

To make the franchise inquiry form send emails to aamir-ashraf@hotmail.com, you need to set up EmailJS:

### 1. Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Set up Email Service
1. In EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions
5. Note down your **Service ID**

### 3. Create Email Template
1. Go to "Email Templates" in EmailJS dashboard
2. Click "Create New Template"
3. **IMPORTANT**: Set the "To Email" field to: **shawarmaalleyfranchise@gmail.com** (your email)
4. Replace the template content with this notification template:

```
Subject: New Franchise Inquiry - Shawarma Alley

Hi {{to_name}},

You have received a new franchise inquiry!

APPLICANT DETAILS:
Name: {{user_name}}
Email: {{user_email}}
Phone: {{phone}}
Location: {{city}}, {{province}}

BUSINESS INFORMATION:
Investment Range: {{investment_range}}
Restaurant Experience: {{experience}}
Timeline to Open: {{timeline}}

ADDITIONAL MESSAGE:
{{message}}

---
Reply directly to this email to contact the applicant at {{user_email}}

Shawarma Alley Franchise System
```

5. **CRITICAL**: In the template settings:
   - Set "To Email": shawarmaalleyfranchise@gmail.com
   - Set "From Name": Shawarma Alley Website
   - Set "Reply To": {{user_email}} (so you can reply directly to the applicant)

### 4. Template Settings
Make sure your EmailJS template is configured as:
- **To Email**: shawarmaalleyfranchise@gmail.com (YOU receive the notification)
- **From Name**: Shawarma Alley Website  
- **Reply To**: {{user_email}} (so you can reply to the person who submitted)

This way:
1. Someone fills out the franchise form
2. YOU get notified at shawarmaalleyfranchise@gmail.com with all their details
3. You can reply directly to reach the applicant

### 5. Remove EmailJS Branding
In your template settings:
- Uncheck "Show EmailJS branding" to remove "Email sent via EmailJS.com"
- Or upgrade to paid plan ($15/month) to automatically remove branding

### 6. Get Public Key
Contact Information:
Name: {{name}}
Email: {{from_email}}
Phone: {{phone}}
Location: {{city}}, {{province}}

Business Information:
Investment Range: {{investment_range}}
Restaurant Experience: {{experience}}
Timeline to Open: {{timeline}}

Additional Message:
{{message}}

Please contact this potential franchisee as soon as possible.

Best regards,
Shawarma Alley Franchise System
```

4. Set the "To Email" to: aamir-ashraf@hotmail.com
4. Set the "To Email" to: shawarmaalleyfranchise@gmail.com
5. **IMPORTANT**: In the template settings, make sure to:
   - Uncheck "Show EmailJS branding" to remove "Email sent via EmailJS.com"
   - Or upgrade to a paid plan to remove branding automatically
6. Note down your **Template ID**

### 4. Get Public Key
1. Go to "Account" in EmailJS dashboard
2. Find your **Public Key**

### 5. Update Configuration
Update the following values in `src/services/emailService.js`:

```javascript
const EMAILJS_SERVICE_ID = 'your_service_id_here';
const EMAILJS_TEMPLATE_ID = 'your_template_id_here';  
const EMAILJS_PUBLIC_KEY = 'your_public_key_here';
```

### 6. Test the Form
1. Go to the franchise page on your website
2. Fill out and submit the form
3. Check aamir-ashraf@hotmail.com for the inquiry email

## Current Status
- ✅ Form UI is complete
- ✅ EmailJS integration code is ready
- ✅ EmailJS account setup complete
- ✅ Configuration values updated
- ✅ Form is fully functional

The franchise forms will now automatically send emails to shawarmaalleyfranchise@gmail.com when submitted.