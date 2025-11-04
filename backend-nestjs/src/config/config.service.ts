import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: NestConfigService) {}

  get app() {
    return {
      name: this.configService.get<string>('APP_NAME', 'Black-Cross'),
      env: this.configService.get<string>('NODE_ENV', 'development'),
      port: this.configService.get<number>('APP_PORT', 8080),
      host: this.configService.get<string>('APP_HOST', '0.0.0.0'),
      url: this.configService.get<string>('APP_URL', 'http://localhost:8080'),
    };
  }

  get database() {
    return {
      postgresql: {
        host: this.configService.get<string>('DB_HOST', 'localhost'),
        port: this.configService.get<number>('DB_PORT', 5432),
        username: this.configService.get<string>('DB_USER', 'postgres'),
        password: this.configService.get<string>('DB_PASSWORD', 'postgres'),
        database: this.configService.get<string>('DB_NAME', 'blackcross'),
      },
      mongodb: {
        uri: this.configService.get<string>(
          'MONGODB_URI',
          'mongodb://localhost:27017/blackcross',
        ),
      },
      redis: {
        host: this.configService.get<string>('REDIS_HOST', 'localhost'),
        port: this.configService.get<number>('REDIS_PORT', 6379),
        password: this.configService.get<string>('REDIS_PASSWORD', ''),
      },
    };
  }

  get security() {
    return {
      jwt: {
        secret: this.configService.get<string>(
          'JWT_SECRET',
          'your-secret-key-change-in-production',
        ),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '24h'),
      },
      bcrypt: {
        rounds: this.configService.get<number>('BCRYPT_ROUNDS', 10),
      },
    };
  }

  get features() {
    return {
      darkWebMonitoring: this.configService.get<boolean>(
        'FEATURE_DARK_WEB',
        true,
      ),
      elasticsearch: this.configService.get<boolean>(
        'FEATURE_ELASTICSEARCH',
        false,
      ),
      aiIntegration: this.configService.get<boolean>('FEATURE_AI', true),
    };
  }
}
