import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

    private readonly logger = new Logger('Parent-In-API');

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('Database connected successfully');
        } catch (error) {
            this.logger.error('Failed to connect to the database', error);
            throw new Error(`Database connection failed: ${error.message}`);
        }
    }

    async onModuleDestroy() {
        try {
            await this.$disconnect();
            this.logger.log('Database disconnected successfully');
        } catch (error) {
            this.logger.error('Error disconnecting from database', error);
            throw new Error(`Database disconnect failed: ${error.message}`);
        }
    }
}
