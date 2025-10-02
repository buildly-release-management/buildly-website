/**
 * Google Apps Script for Buildly Newsletter Unsubscribe Management
 * 
 * This script should be deployed as a web app in Google Apps Script
 * and connected to your Google Sheet: 1FaV09BMGFrcV7XkQijVIPkLYykafur_7p5IhC5kI510
 * 
 * Instructions:
 * 1. Go to https://script.google.com
 * 2. Create a new project
 * 3. Paste this code into Code.gs
 * 4. Deploy as web app with "Execute as: Me" and "Who has access: Anyone"
 * 5. Copy the web app URL and update CONFIG.GOOGLE_SCRIPT_URL in unsubscribe.js
 */

// Configuration
const SPREADSHEET_ID = '1FaV09BMGFrcV7XkQijVIPkLYykafur_7p5IhC5kI510';
const SHEET_NAME = 'Sheet1'; // Change this if your sheet has a different name

// Column indices (0-based)
const COLUMNS = {
  EMAIL: 0,        // Column A
  UNSUBSCRIBED: 1, // Column B
  TIMESTAMP: 2,    // Column C (optional - for tracking when they unsubscribed)
  SOURCE: 3        // Column D (optional - for tracking source of unsubscribe)
};

/**
 * Main function to handle HTTP POST requests
 */
function doPost(e) {
  try {
    // Parse the request
    const requestData = JSON.parse(e.postData.contents);
    const { action, email } = requestData;
    
    // Validate input
    if (!email || !isValidEmail(email)) {
      return createCorsResponse(false, 'Invalid email address');
    }
    
    // Handle different actions
    switch (action) {
      case 'check_email':
        return handleCheckEmail(email);
      case 'unsubscribe':
        return handleUnsubscribe(email, requestData);
      default:
        return createCorsResponse(false, 'Invalid action');
    }
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return createCorsResponse(false, 'Internal server error: ' + error.message);
  }
}

/**
 * Handle OPTIONS requests for CORS
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    });
}

/**
 * Handle GET requests (optional - for testing)
 */
function doGet(e) {
  return ContentService
    .createTextOutput('Buildly Newsletter Unsubscribe API is running')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Check if an email exists in the spreadsheet
 */
function handleCheckEmail(email) {
  try {
    const sheet = getSheet();
    const emailColumn = sheet.getRange(1, COLUMNS.EMAIL + 1, sheet.getLastRow(), 1);
    const emailValues = emailColumn.getValues();
    
    // Check if email exists (case insensitive)
    const normalizedEmail = email.toLowerCase().trim();
    const emailExists = emailValues.some(row => 
      row[0] && row[0].toString().toLowerCase().trim() === normalizedEmail
    );
    
    return createCorsResponse(true, 'Email check completed', { exists: emailExists });
    
  } catch (error) {
    console.error('Error checking email:', error);
    return createCorsResponse(false, 'Error checking email: ' + error.message);
  }
}

/**
 * Handle unsubscribe request
 */
function handleUnsubscribe(email, requestData) {
  try {
    const sheet = getSheet();
    const normalizedEmail = email.toLowerCase().trim();
    
    // Find the email row
    const emailRow = findEmailRow(sheet, normalizedEmail);
    
    if (emailRow === -1) {
      return createCorsResponse(false, 'Email address not found in newsletter list');
    }
    
    // Update the unsubscribed status
    const rowIndex = emailRow + 1; // Convert to 1-based index for Sheets
    
    // Set unsubscribed to TRUE
    sheet.getRange(rowIndex, COLUMNS.UNSUBSCRIBED + 1).setValue(true);
    
    // Optionally add timestamp
    if (COLUMNS.TIMESTAMP !== undefined) {
      sheet.getRange(rowIndex, COLUMNS.TIMESTAMP + 1).setValue(new Date());
    }
    
    // Optionally add source information
    if (COLUMNS.SOURCE !== undefined) {
      const source = `${requestData.source || 'unknown'} | ${requestData.userAgent || 'unknown'}`;
      sheet.getRange(rowIndex, COLUMNS.SOURCE + 1).setValue(source);
    }
    
    // Log the unsubscribe (optional)
    console.log(`Email unsubscribed: ${normalizedEmail} at ${new Date()}`);
    
    return createCorsResponse(true, 'Successfully unsubscribed', {
      email: normalizedEmail,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing unsubscribe:', error);
    return createCorsResponse(false, 'Error processing unsubscribe: ' + error.message);
  }
}

/**
 * Find the row number (0-based) for a given email
 */
function findEmailRow(sheet, email) {
  const emailColumn = sheet.getRange(1, COLUMNS.EMAIL + 1, sheet.getLastRow(), 1);
  const emailValues = emailColumn.getValues();
  
  for (let i = 0; i < emailValues.length; i++) {
    if (emailValues[i][0] && 
        emailValues[i][0].toString().toLowerCase().trim() === email) {
      return i;
    }
  }
  
  return -1; // Not found
}

/**
 * Get the spreadsheet object
 */
function getSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet "${SHEET_NAME}" not found in spreadsheet`);
    }
    
    return sheet;
    
  } catch (error) {
    console.error('Error accessing sheet:', error);
    throw new Error('Unable to access spreadsheet: ' + error.message);
  }
}

/**
 * Create a standardized JSON response
 */
function createResponse(success, message, data = null) {
  const response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  if (data) {
    response.data = data;
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Create a CORS-enabled JSON response
 */
function createCorsResponse(success, message, data = null) {
  const response = {
    success: success,
    message: message,
    timestamp: new Date().toISOString()
  };
  
  if (data) {
    response.data = data;
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Optional: Function to add a new subscriber (for future use)
 */
function addSubscriber(email, source = 'unknown') {
  try {
    const sheet = getSheet();
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if email already exists
    if (findEmailRow(sheet, normalizedEmail) !== -1) {
      return createResponse(false, 'Email already exists');
    }
    
    // Add new row
    const newRow = [
      normalizedEmail,  // Email
      false,           // Unsubscribed (default to false)
      new Date(),      // Timestamp
      source           // Source
    ];
    
    sheet.appendRow(newRow);
    
    return createResponse(true, 'Subscriber added successfully');
    
  } catch (error) {
    console.error('Error adding subscriber:', error);
    return createResponse(false, 'Error adding subscriber: ' + error.message);
  }
}

/**
 * Optional: Function to get unsubscribe statistics
 */
function getUnsubscribeStats() {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    
    let totalEmails = 0;
    let unsubscribed = 0;
    let subscribed = 0;
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      if (data[i][COLUMNS.EMAIL]) {
        totalEmails++;
        if (data[i][COLUMNS.UNSUBSCRIBED]) {
          unsubscribed++;
        } else {
          subscribed++;
        }
      }
    }
    
    return {
      totalEmails,
      subscribed,
      unsubscribed,
      unsubscribeRate: totalEmails > 0 ? (unsubscribed / totalEmails * 100).toFixed(2) + '%' : '0%'
    };
    
  } catch (error) {
    console.error('Error getting stats:', error);
    throw error;
  }
}