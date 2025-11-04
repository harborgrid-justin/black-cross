import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigService } from '../config/config.service';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        dialect: 'postgres',
        host: configService.database.postgresql.host,
        port: configService.database.postgresql.port,
        username: configService.database.postgresql.username,
        password: configService.database.postgresql.password,
        database: configService.database.postgresql.database,
        autoLoadModels: true,
        synchronize: true,
        logging: false,
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        uri: configService.database.mongodb.uri,
      }),
    }),
  ],
})
export class DatabaseModule {}
