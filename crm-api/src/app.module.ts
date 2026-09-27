import { Module } from '@nestjs/common';
import { ClientsModule } from './clients/clients.module.js';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ContactsModule } from './contacts/contacts.module.js';
import { OpportunitiesModule } from './opportunities/opportunities.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule,
    ContactsModule,
    OpportunitiesModule,
    DashboardModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}