import nodemailer from 'nodemailer';
import { prisma } from './db';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter | null = null;
  private siteSettings: any = null;

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Initialize the email service with current site settings
   */
  private async initializeTransporter(): Promise<void> {
    try {
      // Fetch the latest site settings
      this.siteSettings = await prisma.siteSettings.findFirst();

      if (!this.siteSettings || !this.siteSettings.smtpEnabled) {
        console.warn('SMTP is not enabled or configured');
        return;
      }

      // Create the nodemailer transporter
      this.transporter = nodemailer.createTransport({
        host: this.siteSettings.smtpHost,
        port: this.siteSettings.smtpPort || 587,
        secure: this.siteSettings.smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: this.siteSettings.smtpUsername,
          pass: this.siteSettings.smtpPassword,
        },
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates
        },
      });

      // Verify the connection
      await this.transporter.verify();
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.transporter = null;
    }
  }

  /**
   * Send an email
   */
  public async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Initialize transporter if not already done
      if (!this.transporter) {
        await this.initializeTransporter();
      }

      if (!this.transporter || !this.siteSettings) {
        throw new Error('Email service not properly configured');
      }

      // Prepare email options
      const mailOptions = {
        from: {
          name: this.siteSettings.smtpFromName || 'Website',
          address: this.siteSettings.smtpFromEmail || this.siteSettings.smtpUsername,
        },
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
        replyTo: options.replyTo || this.siteSettings.smtpReplyTo,
        attachments: options.attachments,
      };

      // Add email signature and footer if enabled
      if (options.html && this.siteSettings.emailBrandingEnabled) {
        mailOptions.html = this.addEmailBranding(options.html);
      }

      // Send the email
      const result = await this.transporter.sendMail(mailOptions);
      
      // Log the email if logging is enabled
      if (this.siteSettings.emailLoggingEnabled) {
        console.log('Email sent successfully:', {
          messageId: result.messageId,
          to: options.to,
          subject: options.subject,
          timestamp: new Date().toISOString(),
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Add email branding (signature and footer)
   */
  private addEmailBranding(html: string): string {
    let brandedHtml = html;

    // Add signature if configured
    if (this.siteSettings.emailSignature) {
      brandedHtml += `
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          ${this.siteSettings.emailSignature}
        </div>
      `;
    }

    // Add footer if configured
    if (this.siteSettings.emailFooterText) {
      brandedHtml += `
        <div style="margin-top: 20px; padding: 20px; background-color: #f9fafb; border-radius: 8px; font-size: 12px; color: #6b7280; text-align: center;">
          ${this.siteSettings.emailFooterText}
        </div>
      `;
    }

    return brandedHtml;
  }

  /**
   * Test email configuration
   */
  public async testEmailConfiguration(): Promise<{ success: boolean; error?: string; details?: any }> {
    try {
      await this.initializeTransporter();
      
      if (!this.transporter) {
        return { success: false, error: 'Failed to create email transporter' };
      }

      // First, try to verify the SMTP connection
      try {
        await this.transporter.verify();
      } catch (verifyError: any) {
        return {
          success: false,
          error: 'SMTP connection failed',
          details: {
            message: verifyError.message,
            code: verifyError.code,
            host: this.siteSettings.smtpHost,
            port: this.siteSettings.smtpPort,
            suggestion: this.getErrorSuggestion(verifyError)
          }
        };
      }

      // Send a test email to the admin
      const testResult = await this.sendEmail({
        to: this.siteSettings.adminNotificationEmail || this.siteSettings.smtpFromEmail,
        subject: 'Email Configuration Test',
        html: `
          <h2>Email Configuration Test</h2>
          <p>This is a test email to verify that your SMTP configuration is working correctly.</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>SMTP Host: ${this.siteSettings.smtpHost}</li>
            <li>SMTP Port: ${this.siteSettings.smtpPort}</li>
            <li>From Email: ${this.siteSettings.smtpFromEmail}</li>
            <li>Timestamp: ${new Date().toISOString()}</li>
          </ul>
          <p>If you received this email, your email configuration is working correctly!</p>
        `,
      });

      return { success: testResult };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Unknown error occurred',
        details: {
          code: error.code,
          response: error.response,
          suggestion: this.getErrorSuggestion(error)
        }
      };
    }
  }

  /**
   * Get error suggestion based on error type
   */
  private getErrorSuggestion(error: any): string {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code;
    const errorResponse = error.response?.toLowerCase() || '';

    // Domain verification errors
    if (errorResponse.includes('domain not verified') || errorResponse.includes('sender domain not verified')) {
      return 'Domain verification required: Please verify your sender domain with your email provider. For Gmail, use your actual Gmail address as the "From Email". For SendGrid/Mailgun, verify your domain in their dashboard.';
    }

    // Authentication errors
    if (errorCode === 'EAUTH' || errorMessage.includes('authentication') || errorResponse.includes('authentication failed')) {
      return 'Authentication failed: Check your username and password. For Gmail, use an App Password instead of your regular password. Enable 2FA and generate an App Password in your Google Account settings.';
    }

    // Connection errors
    if (errorCode === 'ECONNECTION' || errorMessage.includes('connection')) {
      return 'Connection failed: Check your SMTP host and port. Common settings: Gmail (smtp.gmail.com:587), Outlook (smtp-mail.outlook.com:587), Yahoo (smtp.mail.yahoo.com:587).';
    }

    // SSL/TLS errors
    if (errorMessage.includes('ssl') || errorMessage.includes('tls') || errorMessage.includes('certificate')) {
      return 'SSL/TLS error: Try toggling the "Use TLS/SSL Encryption" setting. For port 587, enable TLS. For port 465, use SSL. For port 25, disable encryption.';
    }

    // Rate limiting
    if (errorResponse.includes('rate limit') || errorResponse.includes('too many')) {
      return 'Rate limit exceeded: You\'re sending emails too frequently. Wait a few minutes and try again, or check your email provider\'s rate limits.';
    }

    // Generic suggestion
    return 'Check your SMTP settings: Verify host, port, username, password, and encryption settings. Consult your email provider\'s documentation for correct SMTP configuration.';
  }

  /**
   * Send form submission notification with custom template
   */
  public async sendFormSubmissionNotificationWithTemplate(
    recipient: string,
    formData: any,
    form: any,
    submissionDetails: any
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      // Get the template from form configuration
      const subject = form.adminEmailSubject || `New ${form.title} Submission`;
      let template = form.adminEmailTemplate || 'You have received a new form submission.\n\n{{FORM_DATA}}\n\nSubmitted at: {{SUBMITTED_AT}}';

      // Prepare form data for template
      const formDataText = Object.entries(formData)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      const formDataHtml = Object.entries(formData)
        .map(([key, value]) => `<tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 500;">${key}</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${value}</td></tr>`)
        .join('');

      // Replace template variables
      const variables = {
        FORM_DATA: formDataText,
        FORM_NAME: form.name || form.title,
        SUBMITTED_AT: submissionDetails.submittedAt || new Date().toISOString(),
        SUBMITTER_EMAIL: formData.email || formData.emailAddress || '',
      };

      // Replace variables in template
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        template = template.replace(new RegExp(placeholder, 'g'), value);
      });

      // Convert template to HTML if it's plain text
      let html = template;
      if (!template.includes('<')) {
        html = template.replace(/\n/g, '<br>');
        
        // If it contains form data, make it a nice table
        if (template.includes('{{FORM_DATA}}') || template.includes(formDataText)) {
          html = html.replace(formDataText, `
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Field</th>
                  <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Value</th>
                </tr>
              </thead>
              <tbody>
                ${formDataHtml}
              </tbody>
            </table>
          `);
        }
      }

      await this.sendEmail({
        to: recipient,
        subject,
        html,
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending form notification with template:', error);
      return { success: false };
    }
  }

  /**
   * Send submitter confirmation email with custom template
   */
  public async sendSubmitterConfirmationWithTemplate(
    recipient: string,
    formData: any,
    form: any
  ): Promise<{ success: boolean; messageId?: string }> {
    try {
      // Get the template from form configuration
      const subject = form.submitterEmailSubject || 'Thank you for your submission';
      let template = form.submitterEmailTemplate || 'Dear {{SUBMITTER_NAME}},\n\nThank you for contacting us! We have received your message and will get back to you soon.\n\nBest regards,\nThe Team';

      // Prepare variables for template
      const submitterName = formData.first_name || formData.firstName || formData.name || formData.fullName || 'there';
      const submitterEmail = formData.email || formData.emailAddress || recipient;
      
      const formDataText = Object.entries(formData)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      // Replace template variables
      const variables = {
        SUBMITTER_NAME: submitterName,
        SUBMITTER_EMAIL: submitterEmail,
        FORM_NAME: form.name || form.title,
        SUBMITTED_AT: new Date().toISOString(),
        FORM_DATA: formDataText,
      };

      // Replace variables in template
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        template = template.replace(new RegExp(placeholder, 'g'), value);
      });

      // Convert template to HTML if it's plain text
      let html = template;
      if (!template.includes('<')) {
        html = template.replace(/\n/g, '<br>');
      }

      await this.sendEmail({
        to: recipient,
        subject,
        html,
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending submitter confirmation with template:', error);
      return { success: false };
    }
  }

  /**
   * Send form submission notification (legacy method)
   */
  public async sendFormSubmissionNotification(formData: any, formName: string): Promise<boolean> {
    if (!this.siteSettings?.adminNotificationEmail) {
      console.warn('No admin notification email configured');
      return false;
    }

    const fieldsHtml = Object.entries(formData)
      .map(([key, value]) => `<tr><td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 500;">${key}</td><td style="padding: 8px; border: 1px solid #e5e7eb;">${value}</td></tr>`)
      .join('');

    const html = `
      <h2>New Form Submission: ${formName}</h2>
      <p>You have received a new form submission from your website.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Field</th>
            <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Value</th>
          </tr>
        </thead>
        <tbody>
          ${fieldsHtml}
        </tbody>
      </table>
      
      <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
        Submitted on: ${new Date().toLocaleString()}
      </p>
    `;

    return await this.sendEmail({
      to: this.siteSettings.adminNotificationEmail,
      subject: `New ${formName} Submission`,
      html,
    });
  }

  /**
   * Send welcome email
   */
  public async sendWelcomeEmail(userEmail: string, userName?: string): Promise<boolean> {
    const html = `
      <h2>Welcome${userName ? ` ${userName}` : ''}!</h2>
      <p>Thank you for your interest in our services. We're excited to have you on board!</p>
      <p>If you have any questions or need assistance, please don't hesitate to reach out to our team.</p>
      <p>Best regards,<br>The Team</p>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject: 'Welcome!',
      html,
    });
  }

  /**
   * Send password reset email
   */
  public async sendPasswordResetEmail(userEmail: string, resetToken: string, resetUrl: string): Promise<boolean> {
    const html = `
      <h2>Password Reset Request</h2>
      <p>You have requested to reset your password. Click the button below to proceed:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}?token=${resetToken}" 
           style="background-color: #5243E9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Reset Password
        </a>
      </div>
      
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #6b7280;">${resetUrl}?token=${resetToken}</p>
      
      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
      </p>
    `;

    return await this.sendEmail({
      to: userEmail,
      subject: 'Password Reset Request',
      html,
    });
  }

  /**
   * Send custom email with template
   */
  public async sendTemplatedEmail(
    to: string | string[], 
    template: EmailTemplate, 
    variables: Record<string, string> = {}
  ): Promise<boolean> {
    // Replace variables in template
    let { subject, html, text } = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      html = html.replace(new RegExp(placeholder, 'g'), value);
      if (text) {
        text = text.replace(new RegExp(placeholder, 'g'), value);
      }
    });

    return await this.sendEmail({
      to,
      subject,
      html,
      text,
    });
  }

  /**
   * Get current email settings (without sensitive data)
   */
  public async getEmailSettings(): Promise<any> {
    const settings = await prisma.siteSettings.findFirst();
    if (!settings) return null;

    return {
      smtpEnabled: settings.smtpEnabled,
      smtpHost: settings.smtpHost,
      smtpPort: settings.smtpPort,
      smtpSecure: settings.smtpSecure,
      smtpFromEmail: settings.smtpFromEmail,
      smtpFromName: settings.smtpFromName,
      smtpReplyTo: settings.smtpReplyTo,
      emailBrandingEnabled: settings.emailBrandingEnabled,
      adminNotificationEmail: settings.adminNotificationEmail,
      emailLoggingEnabled: settings.emailLoggingEnabled,
      emailRateLimitPerHour: settings.emailRateLimitPerHour,
    };
  }
}

// Export singleton instance
export const emailService = EmailService.getInstance(); 