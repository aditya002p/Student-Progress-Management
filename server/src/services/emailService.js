const nodemailer = require('nodemailer');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const EmailLog = require('../models/EmailLog');
const Student = require('../models/Student');

/**
 * Email Service
 * Handles all email sending functionality, particularly for inactivity reminders
 */

// Create email transporter based on environment configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email templates directory
const TEMPLATES_DIR = path.join(__dirname, '../templates/emails');

// Cache for email templates
const templateCache = {};

/**
 * Load an email template from file or cache
 * @param {string} templateName - Name of the template
 * @returns {Promise<string>} Template content
 */
const loadTemplate = async (templateName) => {
  // Check if template is already cached
  if (templateCache[templateName]) {
    return templateCache[templateName];
  }
  
  try {
    // Read template file
    const readFile = promisify(fs.readFile);
    const templatePath = path.join(TEMPLATES_DIR, `${templateName}.html`);
    const template = await readFile(templatePath, 'utf8');
    
    // Cache the template
    templateCache[templateName] = template;
    
    return template;
  } catch (error) {
    logger.error(`Error loading email template '${templateName}':`, error);
    // Return a basic template as fallback
    return '<html><body><h1>{{subject}}</h1><p>{{content}}</p></body></html>';
  }
};

/**
 * Fill template with data
 * @param {string} template - Email template
 * @param {Object} data - Data to fill the template with
 * @returns {string} Filled template
 */
const fillTemplate = (template, data) => {
  let filledTemplate = template;
  
  // Replace all placeholders with actual data
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    filledTemplate = filledTemplate.replace(regex, value);
  });
  
  return filledTemplate;
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @param {Object} options.metadata - Additional metadata to store with the email log
 * @returns {Promise<Object>} Send result
 */
const sendEmail = async (options) => {
  try {
    // Prepare email data
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@studentprogress.com',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };
    
    // Send the email
    const result = await transporter.sendMail(mailOptions);
    
    logger.info(`Email sent to ${options.to}: ${options.subject}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    logger.error(`Error sending email to ${options.to}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Send an inactivity reminder email to a student
 * @param {Object} student - Student document
 * @param {number} daysSinceLastSubmission - Days since last submission
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Send result
 */
exports.sendInactivityReminder = async (student, daysSinceLastSubmission, options = {}) => {
  try {
    // Check if reminders are enabled for this student
    if (!student.emailReminders.enabled) {
      logger.info(`Skipping reminder for ${student.name}: reminders disabled`);
      return { success: false, skipped: true, reason: 'reminders-disabled' };
    }
    
    // Load template
    const templateName = options.template || 'inactivity_reminder';
    const template = await loadTemplate(templateName);
    
    // Prepare data for template
    const templateData = {
      name: student.name,
      handle: student.codeforcesHandle,
      days: daysSinceLastSubmission,
      currentRating: student.currentRating,
      maxRating: student.maxRating,
      reminderCount: student.emailReminders.count + 1,
      unsubscribeLink: `${process.env.CLIENT_URL || 'http://localhost:3000'}/unsubscribe?id=${student._id}`,
      currentDate: new Date().toLocaleDateString(),
      subject: options.subject || 'Reminder: Get back to problem solving!'
    };
    
    // Fill template with data
    const html = fillTemplate(template, templateData);
    
    // Create plain text version
    const text = `Hi ${student.name},\n\nWe noticed you haven't solved any Codeforces problems in the last ${daysSinceLastSubmission} days. Regular practice is important for improving your programming skills.\n\nYour current rating: ${student.currentRating}\nYour max rating: ${student.maxRating}\n\nKeep coding!\n\nTo unsubscribe from these reminders, visit: ${templateData.unsubscribeLink}`;
    
    // Send the email
    const result = await sendEmail({
      to: student.email,
      subject: templateData.subject,
      text,
      html,
      metadata: {
        studentId: student._id,
        reminderType: 'inactivity',
        daysSinceLastSubmission
      }
    });
    
    // If email was sent successfully, log it and update student
    if (result.success) {
      // Create email log
      await EmailLog.create({
        student: student._id,
        recipientEmail: student.email,
        emailType: 'inactivityReminder',
        subject: templateData.subject,
        content: html,
        template: templateName,
        status: 'sent',
        inactivityData: {
          daysSinceLastSubmission,
          reminderCount: student.emailReminders.count + 1,
          lastSubmissionDate: student.lastDataUpdate
        }
      });
      
      // Update student reminder count and last sent date
      student.emailReminders.count += 1;
      student.emailReminders.lastSent = new Date();
      await student.save();
      
      logger.info(`Inactivity reminder sent to ${student.name} (${student.email})`);
    }
    
    return result;
  } catch (error) {
    logger.error(`Error sending inactivity reminder to ${student.name}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Send a welcome email to a new student
 * @param {Object} student - Student document
 * @returns {Promise<Object>} Send result
 */
exports.sendWelcomeEmail = async (student) => {
  try {
    // Load template
    const template = await loadTemplate('welcome');
    
    // Prepare data for template
    const templateData = {
      name: student.name,
      handle: student.codeforcesHandle,
      dashboardLink: `${process.env.CLIENT_URL || 'http://localhost:3000'}/students/${student._id}`,
      currentDate: new Date().toLocaleDateString(),
      subject: 'Welcome to Student Progress Management System'
    };
    
    // Fill template with data
    const html = fillTemplate(template, templateData);
    
    // Create plain text version
    const text = `Welcome ${student.name}!\n\nYour account has been created in the Student Progress Management System. We'll be tracking your Codeforces progress and helping you improve.\n\nYour Codeforces handle: ${student.codeforcesHandle}\n\nView your dashboard: ${templateData.dashboardLink}`;
    
    // Send the email
    const result = await sendEmail({
      to: student.email,
      subject: templateData.subject,
      text,
      html,
      metadata: {
        studentId: student._id,
        emailType: 'welcome'
      }
    });
    
    // If email was sent successfully, log it
    if (result.success) {
      await EmailLog.create({
        student: student._id,
        recipientEmail: student.email,
        emailType: 'welcome',
        subject: templateData.subject,
        content: html,
        template: 'welcome',
        status: 'sent'
      });
      
      logger.info(`Welcome email sent to ${student.name} (${student.email})`);
    }
    
    return result;
  } catch (error) {
    logger.error(`Error sending welcome email to ${student.name}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if transporter is working
 * @returns {Promise<boolean>} True if working
 */
exports.verifyConnection = async () => {
  try {
    await transporter.verify();
    logger.info('Email service connection verified');
    return true;
  } catch (error) {
    logger.error('Email service connection failed:', error);
    return false;
  }
};

/**
 * Get email sending statistics
 * @returns {Promise<Object>} Statistics
 */
exports.getEmailStats = async () => {
  try {
    const totalCount = await EmailLog.countDocuments();
    const reminderCount = await EmailLog.countDocuments({ emailType: 'inactivityReminder' });
    const welcomeCount = await EmailLog.countDocuments({ emailType: 'welcome' });
    const failedCount = await EmailLog.countDocuments({ status: 'failed' });
    
    // Get counts by day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyStats = await EmailLog.aggregate([
      {
        $match: {
          sentAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$sentAt' }
          },
          count: { $sum: 1 },
          reminderCount: {
            $sum: {
              $cond: [{ $eq: ['$emailType', 'inactivityReminder'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    return {
      totalCount,
      reminderCount,
      welcomeCount,
      failedCount,
      dailyStats
    };
  } catch (error) {
    logger.error('Error getting email statistics:', error);
    throw error;
  }
};

/**
 * Create default email templates if they don't exist
 * @returns {Promise<void>}
 */
exports.ensureTemplatesExist = async () => {
  try {
    // Create templates directory if it doesn't exist
    if (!fs.existsSync(TEMPLATES_DIR)) {
      fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
    }
    
    // Define default templates
    const defaultTemplates = {
      'inactivity_reminder': `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{subject}}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4a69bd; color: white; padding: 10px 20px; text-align: center; }
    .content { padding: 20px; background-color: #f8f9fa; }
    .footer { font-size: 12px; color: #666; text-align: center; margin-top: 20px; }
    .button { display: inline-block; background-color: #4a69bd; color: white; padding: 10px 20px; 
              text-decoration: none; border-radius: 4px; }
    .stats { margin: 20px 0; padding: 15px; background-color: #e9ecef; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Coding Practice Reminder</h1>
    </div>
    <div class="content">
      <p>Hello {{name}},</p>
      
      <p>We noticed you haven't solved any Codeforces problems in the last <strong>{{days}} days</strong>. 
      Regular practice is important for improving your programming skills and maintaining your rating.</p>
      
      <div class="stats">
        <p><strong>Your Codeforces Stats:</strong></p>
        <ul>
          <li>Handle: {{handle}}</li>
          <li>Current Rating: {{currentRating}}</li>
          <li>Max Rating: {{maxRating}}</li>
        </ul>
      </div>
      
      <p>Why not take some time today to solve a problem? Consistent practice leads to consistent improvement!</p>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="https://codeforces.com/problemset" class="button">Solve Problems Now</a>
      </p>
      
      <p>Keep coding!</p>
      <p>Student Progress Management Team</p>
    </div>
    <div class="footer">
      <p>This is reminder #{{reminderCount}} about your inactivity.</p>
      <p>If you wish to stop receiving these reminders, <a href="{{unsubscribeLink}}">click here to unsubscribe</a>.</p>
      <p>Sent on: {{currentDate}}</p>
    </div>
  </div>
</body>
</html>
      `,
      'welcome': `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{subject}}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4a69bd; color: white; padding: 10px 20px; text-align: center; }
    .content { padding: 20px; background-color: #f8f9fa; }
    .footer { font-size: 12px; color: #666; text-align: center; margin-top: 20px; }
    .button { display: inline-block; background-color: #4a69bd; color: white; padding: 10px 20px; 
              text-decoration: none; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Student Progress!</h1>
    </div>
    <div class="content">
      <p>Hello {{name}},</p>
      
      <p>Welcome to the Student Progress Management System! We're excited to help you track and improve
      your competitive programming skills.</p>
      
      <p>Your account has been set up with the following details:</p>
      <ul>
        <li><strong>Codeforces Handle:</strong> {{handle}}</li>
      </ul>
      
      <p>We'll be tracking your progress on Codeforces, including:</p>
      <ul>
        <li>Rating changes from contests</li>
        <li>Problems solved by difficulty</li>
        <li>Submission activity and consistency</li>
      </ul>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{dashboardLink}}" class="button">View Your Dashboard</a>
      </p>
      
      <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
      <p>Happy coding!</p>
      <p>Student Progress Management Team</p>
    </div>
    <div class="footer">
      <p>Sent on: {{currentDate}}</p>
    </div>
  </div>
</body>
</html>
      `
    };
    
    // Create each template if it doesn't exist
    for (const [name, content] of Object.entries(defaultTemplates)) {
      const templatePath = path.join(TEMPLATES_DIR, `${name}.html`);
      
      if (!fs.existsSync(templatePath)) {
        fs.writeFileSync(templatePath, content.trim());
        logger.info(`Created default email template: ${name}`);
      }
    }
    
    logger.info('Email templates verified');
  } catch (error) {
    logger.error('Error ensuring email templates exist:', error);
  }
};

// Initialize email service
exports.init = async () => {
  try {
    // Verify connection
    const isConnected = await exports.verifyConnection();
    
    // Ensure templates exist
    await exports.ensureTemplatesExist();
    
    return isConnected;
  } catch (error) {
    logger.error('Error initializing email service:', error);
    return false;
  }
};
