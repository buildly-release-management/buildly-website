# Buildly Newsletter Unsubscribe System

This system allows users to unsubscribe from the Buildly newsletter using a Google Sheet as the backend data store.

## Files Created

1. **`unsubscribe.html`** - The main unsubscribe page
2. **`js/unsubscribe.js`** - Frontend JavaScript handling
3. **`google-apps-script/Code.gs`** - Google Apps Script for backend processing

## Setup Instructions

### 1. Prepare Your Google Sheet

Your Google Sheet should have the following columns:
- **Column A**: Email addresses
- **Column B**: Unsubscribed status (TRUE/FALSE)
- **Column C**: Timestamp (optional)
- **Column D**: Source/User Agent (optional)

Example structure:
```
| Email              | Unsubscribed | Timestamp           | Source                    |
|--------------------|--------------|--------------------|--------------------------| 
| team@open.build    | FALSE        | 2025-10-02 10:30   | newsletter signup        |
| user@example.com   | TRUE         | 2025-10-02 11:45   | website-unsubscribe-page |
```

### 2. Deploy Google Apps Script

1. Go to [Google Apps Script](https://script.google.com)
2. Create a new project
3. Replace the default code with the contents of `google-apps-script/Code.gs`
4. Update the `SPREADSHEET_ID` in the script to your sheet ID: `1FaV09BMGFrcV7XkQijVIPkLYykafur_7p5IhC5kI510`
5. Update the `SHEET_NAME` if your sheet tab has a different name (default is "Sheet1")
6. Deploy as web app:
   - Click **Deploy** → **New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**
7. Copy the web app URL (it will look like: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`)

### 3. Update Frontend Configuration

1. Open `js/unsubscribe.js`
2. Replace `YOUR_SCRIPT_ID` in the `GOOGLE_SCRIPT_URL` with your actual script URL from step 2

```javascript
const CONFIG = {
    GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID/exec',
    // ... rest of config
};
```

### 4. Test the System

1. Add a test email to your Google Sheet with `Unsubscribed = FALSE`
2. Visit `https://www.buildly.io/unsubscribe.html?email=test@example.com`
3. Test the unsubscribe process
4. Check that the Google Sheet is updated with `Unsubscribed = TRUE`

## Usage

### Direct Link
Users can visit: `https://www.buildly.io/unsubscribe.html`

### Pre-filled Email
Include email in URL parameter: `https://www.buildly.io/unsubscribe.html?email=user@example.com`

### Newsletter Links
Add unsubscribe links to your newsletters:
```html
<a href="https://www.buildly.io/unsubscribe.html?email={{subscriber_email}}">
  Unsubscribe from this newsletter
</a>
```

## Features

- ✅ Validates email addresses exist in your Google Sheet
- ✅ Updates unsubscribe status with timestamp
- ✅ Tracks source of unsubscribe requests  
- ✅ Pre-fills email from URL parameter
- ✅ User-friendly success/error messages
- ✅ Mobile-responsive design
- ✅ Follows Buildly brand guidelines
- ✅ Google Analytics tracking integration
- ✅ CORS-enabled for GitHub Pages hosting

## Security & Privacy

- Email validation prevents invalid submissions
- Google Apps Script handles backend processing securely
- No API keys exposed in frontend code
- Minimal logging with masked email addresses
- GDPR-compliant unsubscribe process

## Troubleshooting

### Common Issues

1. **"Email not found" error**
   - Check that the email exists in your Google Sheet
   - Verify column structure matches the script configuration
   - Ensure email format matches exactly (case-insensitive)

2. **Script deployment errors**
   - Verify Google Apps Script permissions
   - Check that the spreadsheet ID is correct
   - Ensure the script is deployed with "Anyone" access

3. **CORS errors**
   - Confirm the Google Apps Script is deployed as a web app
   - Check that the script URL is correct in the frontend config

### Testing

You can test the Google Apps Script directly:
1. In the Apps Script editor, run the `doGet()` function to test basic connectivity
2. Use the script URL in your browser to verify it returns "Buildly Newsletter Unsubscribe API is running"

## Analytics & Monitoring

The system tracks unsubscribe events in Google Analytics if available. You can monitor:
- Unsubscribe conversion rates
- Error rates
- Source of unsubscribe requests

## Future Enhancements

- Integration with MailerSend suppression lists
- Subscription preference management
- Re-subscription capability
- Bulk unsubscribe handling
- Email validation via external services