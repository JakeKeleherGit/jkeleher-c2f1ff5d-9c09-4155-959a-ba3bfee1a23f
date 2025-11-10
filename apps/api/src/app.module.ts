import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Organization } from './entities/organization.entity';
import { Task } from './entities/task.entity';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'sqlite',
        database: process.env.DB_PATH || './tmp.db',
        entities: [User, Organization, Task],
        synchronize: true, // OK for assessment; not for prod
        logging: false,
      })
    }),
    TypeOrmModule.forFeature([User, Organization, Task]),
    AuthModule,
    TasksModule,
    AuditModule,
  ],
})
export class AppModule {}
