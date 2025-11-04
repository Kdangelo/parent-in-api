import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

    private readonly logger = new Logger('Parent-In-API');

    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('Databse connected');
        } catch (error) {
            this.logger.error('Failed to connect to the database', error);
            throw Error;
        }
    }

    async onModuleDestroy() {
        await this.$desconnect();
        this.logger.log('Database disconnectted');
    }
}
