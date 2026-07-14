/**
 * GDPR Utilities
 * Utilities for GDPR compliance and data privacy
 */

import { GDPRRequest, GDPRRequestStatus, GDPRRequestType } from '@prisma/client';

/**
 * GDPR Request Service
 * Handles data export, deletion, and rectification requests
 */
export class GDPRService {
  /**
   * Create a data export request
   * @param userId - User ID requesting data export
   * @param reason - Reason for request (optional)
   * @returns GDPR request record
   */
  static async createDataExportRequest(
    userId: string,
    reason?: string,
  ): Promise<Partial<GDPRRequest>> {
    return {
      userId,
      type: GDPRRequestType.DATA_EXPORT,
      status: GDPRRequestStatus.PENDING,
      reason,
    };
  }

  /**
   * Create a data deletion request
   * @param userId - User ID requesting data deletion
   * @param reason - Reason for request (optional)
   * @returns GDPR request record
   */
  static async createDataDeletionRequest(
    userId: string,
    reason?: string,
  ): Promise<Partial<GDPRRequest>> {
    return {
      userId,
      type: GDPRRequestType.DATA_DELETION,
      status: GDPRRequestStatus.PENDING,
      reason,
    };
  }

  /**
   * Create a data rectification request
   * @param userId - User ID requesting data rectification
   * @param reason - Reason for request (optional)
   * @returns GDPR request record
   */
  static async createDataRectificationRequest(
    userId: string,
    reason?: string,
  ): Promise<Partial<GDPRRequest>> {
    return {
      userId,
      type: GDPRRequestType.DATA_RECTIFICATION,
      status: GDPRRequestStatus.PENDING,
      reason,
    };
  }

  /**
   * Export user data
   * @param userId - User ID
   * @returns User data object
   */
  static async exportUserData(userId: string): Promise<object> {
    return {
      userId,
      dataExportedAt: new Date().toISOString(),
      exportFormat: 'JSON',
      // In production, this would gather all user data
    };
  }

  /**
   * Delete user data
   * @param userId - User ID
   * @returns Deletion confirmation
   */
  static async deleteUserData(userId: string): Promise<object> {
    return {
      userId,
      deletedAt: new Date().toISOString(),
      deletionStatus: 'SCHEDULED',
      // In production, this would delete all user data
    };
  }

  /**
   * Privacy policy content
   */
  static readonly PRIVACY_POLICY_EN = `
    Privacy Policy for The Brain AI & Logic

    1. Data Collection
    We collect data necessary to provide and improve our services:
    - Account information (email, name)
    - Usage data and analytics
    - Transcription data (audio/text)
    - Device and browser information

    2. Data Usage
    Your data is used to:
    - Provide transcription services
    - Improve AI models
    - Enhance user experience
    - Comply with legal obligations

    3. Data Protection
    We implement end-to-end encryption and secure data storage
    compliant with GDPR and international standards.

    4. Your Rights
    You have the right to:
    - Access your data
    - Export your data
    - Delete your data
    - Rectify incorrect data
    - Opt-out of non-essential tracking

    5. Contact
    For privacy inquiries: privacy@thebrain.com
  `;

  /**
   * Data retention policy
   */
  static readonly DATA_RETENTION_POLICY = {
    activeUserData: '3 years',
    inactiveUserData: '1 year',
    auditLogs: '2 years',
    deletedUserData: '90 days (grace period)',
  };
}

/**
 * Anonymization utility
 * Helps anonymize sensitive data
 */
export class DataAnonymizer {
  /**
   * Anonymize email
   * @param email - Email to anonymize
   * @returns Anonymized email
   */
  static anonymizeEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    return `${localPart.substring(0, 2)}***@${domain}`;
  }

  /**
   * Anonymize IP address
   * @param ip - IP address to anonymize
   * @returns Anonymized IP
   */
  static anonymizeIP(ip: string): string {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.0.0`;
  }

  /**
   * Remove PII from text
   * @param text - Text to anonymize
   * @returns Anonymized text
   */
  static removePII(text: string): string {
    // Remove email addresses
    let result = text.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL]');

    // Remove phone numbers
    result = result.replace(/\+?(\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[PHONE]');

    // Remove credit card patterns
    result = result.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]');

    return result;
  }
}
