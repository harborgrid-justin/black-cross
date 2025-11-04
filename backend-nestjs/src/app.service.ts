import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'operational',
      platform: 'Black-Cross',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      modules: {
        auth: 'operational',
        database: 'operational',
      },
    };
  }

  getInfo() {
    return {
      message: 'Black-Cross API v1.0.0',
      documentation: '/api/v1/docs',
      features: [
        'Threat Intelligence Management',
        'Authentication & Authorization',
        'RESTful API',
        'Swagger Documentation',
      ],
    };
  }
}
