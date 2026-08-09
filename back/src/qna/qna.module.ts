import { Module } from '@nestjs/common';

import { QnaController } from './qna.controller';
import { QnaService } from './qna.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    controllers: [QnaController,],
    providers: [QnaService,],
    exports: [QnaService,],
})
export class QnaModule { }