/**
 * Application Service
 * Core application service for health checks and metadata
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * Get application health status
   * @returns {object} Health check response
   */
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  /**
   * Get API information
   * @returns {object} API metadata
   */
  getInfo() {
    return {
      name: 'The Brain - AI & Logic API',
      version: '1.0.0',
      description: 'Speech-to-Text and AI Logic Platform API',
      endpoint: 'api/v1',
    };
  }
}
