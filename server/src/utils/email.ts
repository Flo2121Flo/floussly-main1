import { SES } from 'aws-sdk';
import { logger } from './logger';
import { compile } from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';

// Initialize SES client
const ses = new SES({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'eu-west-1'
});

// Email templates
const templates = {
  welcome: readFileSync(join(__dirname, '../templates/welcome.html'), 'utf-8'),
  mfa: readFileSync(join(__dirname, '../templates/mfa.html'), 'utf-8'),
  passwordReset: readFileSync(join(__dirname, '../templates/password-reset.html'), 'utf-8'),
  transactionAlert: readFileSync(join(__dirname, '../templates/transaction-alert.html'), 'utf-8'),
  securityAlert: readFileSync(join(__dirname, '../templates/security-alert.html'), 'utf-8')
};

// Compile templates
const compiledTemplates = {
  welcome: compile(templates.welcome),
  mfa: compile(templates.mfa),
  passwordReset: compile(templates.passwordReset),
  transactionAlert: compile(templates.transactionAlert),
  securityAlert: compile(templates.securityAlert)
};

interface EmailOptions {
  to: string;
  subject: string;
  template: keyof typeof compiledTemplates;
  data: any;
  from?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const { to, subject, template, data, from = process.env.EMAIL_FROM } = options;

    // Validate email address
    if (!isValidEmail(to)) {
      throw new Error('Invalid email address');
    }

    // Compile template with data
    const html = compiledTemplates[template](data);

    // Prepare email parameters
    const params = {
      Source: from!,
      Destination: {
        ToAddresses: [to]
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: html,
            Charset: 'UTF-8'
          }
        }
      }
    };

    // Send email
    await ses.sendEmail(params).promise();

    // Log success
    logger.info('Email sent successfully', {
      to,
      subject,
      template,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Log error
    logger.error('Error sending email', {
      error: error.message,
      to: options.to,
      subject: options.subject,
      template: options.template,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

// Email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Transaction notification
export const sendTransactionNotification = async (
  to: string,
  transaction: any
): Promise<void> => {
  await sendEmail({
    to,
    subject: 'Transaction Alert',
    template: 'transactionAlert',
    data: {
      transactionId: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      date: new Date(transaction.createdAt).toLocaleString(),
      balance: transaction.balance
    }
  });
};

// Security alert
export const sendSecurityAlert = async (
  to: string,
  alert: any
): Promise<void> => {
  await sendEmail({
    to,
    subject: 'Security Alert',
    template: 'securityAlert',
    data: {
      alertType: alert.type,
      timestamp: new Date().toLocaleString(),
      deviceInfo: alert.deviceInfo,
      location: alert.location,
      action: alert.action
    }
  });
};

// MFA code
export const sendMFACode = async (
  to: string,
  code: string
): Promise<void> => {
  await sendEmail({
    to,
    subject: 'Your MFA Code',
    template: 'mfa',
    data: {
      code,
      expiry: '5 minutes'
    }
  });
};

// Password reset
export const sendPasswordReset = async (
  to: string,
  resetToken: string
): Promise<void> => {
  await sendEmail({
    to,
    subject: 'Password Reset Request',
    template: 'passwordReset',
    data: {
      resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
      expiry: '1 hour'
    }
  });
};

// Welcome email
export const sendWelcomeEmail = async (
  to: string,
  name: string
): Promise<void> => {
  await sendEmail({
    to,
    subject: 'Welcome to Floussly',
    template: 'welcome',
    data: {
      name,
      loginLink: `${process.env.FRONTEND_URL}/login`
    }
  });
};

export default {
  sendEmail,
  sendTransactionNotification,
  sendSecurityAlert,
  sendMFACode,
  sendPasswordReset,
  sendWelcomeEmail
}; 