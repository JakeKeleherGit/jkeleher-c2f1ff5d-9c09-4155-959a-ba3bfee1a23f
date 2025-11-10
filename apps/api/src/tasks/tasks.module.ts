import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';    
import { JwtGuard } from '../auth/jwt.guard';         
import { RolesGuard } from '../auth/roles.guard';     

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    AuditModule,
    AuthModule,                                      // <-- bring in JwtService via JwtModule export
  ],
  controllers: [TasksController],
  providers: [TasksService, JwtGuard, RolesGuard],   // <-- register guards so DI works
})
export class TasksModule {}
