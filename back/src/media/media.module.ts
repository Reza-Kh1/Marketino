import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { StorageService } from './storage/storage.service';
import { S3StorageService } from './storage/s3-storage.service';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [MediaController],
    providers: [
        MediaService,
        PrismaService,
        S3StorageService,
        {
            provide: StorageService,
            useExisting: S3StorageService,
        },
    ],
    exports: [MediaService],
})
export class MediaModule { }