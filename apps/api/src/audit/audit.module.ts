import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuthModule } from '../auth/auth.module';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [AuthModule],                 // <-- makes JwtService available
  providers: [AuditService, JwtGuard, RolesGuard],
  controllers: [AuditController],
  exports: [AuditService],
})
export class AuditModule {}
