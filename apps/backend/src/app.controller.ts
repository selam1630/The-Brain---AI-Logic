/**
 * Application Controller
 * Root controller for health checks and general API information
 */

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Health check endpoint
   * @returns {object} Application health status
   */
  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  /**
   * Get API information
   * @returns {object} API version and metadata
   */
  @Get()
  getInfo() {
    return this.appService.getInfo();
  }
}
