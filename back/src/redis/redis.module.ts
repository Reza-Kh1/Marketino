import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

// @Global()
// @Module({
//   imports: [
//     BullModule.forRoot({
//       connection: {
//         host: 'localhost',
//         port: 6379,
//       },
//     }),
//   ],
//   exports: [BullModule],
// })
// export class RedisModule {}

import Redis from 'ioredis';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  providers: [
    {
      provide: Redis, // 👈 توکن تزریق
      useFactory: () => {
        return new Redis({
          host: 'localhost',
          port: 6379,
          // در صورت نیاز: password, db, ...
        });
      },
    },
  ],
  exports: [BullModule, Redis], // 👈 Redis را هم export کنید
})
export class RedisModule {}