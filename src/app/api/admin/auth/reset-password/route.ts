import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { emailService } from '@/lib/emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// POST - Request password reset
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.adminUser.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { success: true, message: 'If the email exists, a reset link has been sent' }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 400 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in database (you might want to add these fields to your schema)
    // For now, we'll use a JWT token approach
    const resetTokenData = {
      userId: user.id,
      email: user.email,
      resetToken,
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
    };

    const jwtToken = jwt.sign(resetTokenData, JWT_SECRET);

    // Get site settings for email configuration
    const siteSettings = await prisma.siteSettings.findFirst();
    
    // Create reset URL
    const baseUrl = siteSettings?.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/admin-panel/reset-password?token=${jwtToken}`;

    // Send password reset email
    const emailSent = await emailService.sendEmail({
      to: user.email,
      subject: 'Password Reset Request - Admin Panel',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin: 0 0 10px 0;">Password Reset Request</h2>
            <p style="color: #666; margin: 0;">Hello ${user.name || user.username},</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #333; margin: 0 0 15px 0;">
              We received a request to reset your password for the admin panel. If you didn't make this request, you can safely ignore this email.
            </p>
            
            <p style="color: #333; margin: 0 0 20px 0;">
              To reset your password, click the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #007bff; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="color: #007bff; font-size: 14px; word-break: break-all; margin: 10px 0;">
              <a href="${resetUrl}" style="color: #007bff;">${resetUrl}</a>
            </p>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>Important:</strong> This link will expire in 1 hour for security reasons.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">
              If you didn't request this password reset, please contact your administrator immediately.
            </p>
            <p style="margin: 10px 0 0 0;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    });

    if (emailSent) {
      console.log('Password reset email sent successfully to:', user.email);
      return NextResponse.json({
        success: true,
        message: 'Password reset link has been sent to your email'
      });
    } else {
      console.error('Failed to send password reset email to:', user.email);
      return NextResponse.json(
        { error: 'Failed to send password reset email. Please try again later.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error requesting password reset:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}

// PUT - Reset password with token
export async function PUT(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.adminUser.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.email !== decoded.email) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 400 }
      );
    }

    // Hash new password
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    // Send confirmation email
    try {
      await emailService.sendEmail({
        to: user.email,
        subject: 'Password Reset Successful - Admin Panel',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #155724; margin: 0 0 10px 0;">Password Reset Successful</h2>
              <p style="color: #155724; margin: 0;">Hello ${user.name || user.username},</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #333; margin: 0 0 15px 0;">
                Your password has been successfully reset. You can now log in to the admin panel with your new password.
              </p>
              
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="color: #495057; margin: 0; font-size: 14px;">
                  <strong>Security Notice:</strong> If you didn't reset your password, please contact your administrator immediately as your account may have been compromised.
                </p>
              </div>
              
              <p style="color: #333; margin: 20px 0 0 0;">
                You can now <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin-panel/login" style="color: #007bff;">log in to the admin panel</a> with your new password.
              </p>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 12px;">
              <p style="margin: 0;">
                This is an automated message, please do not reply to this email.
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send password reset confirmation email:', emailError);
      // Don't fail the password reset if confirmation email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
} 