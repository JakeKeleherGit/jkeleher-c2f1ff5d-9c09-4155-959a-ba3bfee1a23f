import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { RequireRole } from '@turbovets21/auth';
import { AuditService } from './audit.service';

@UseGuards(JwtGuard, RolesGuard)
@Controller('audit-log')
export class AuditController {
  constructor(private audit: AuditService) {}

  @Get()
  @RequireRole('admin') // owner/admin allowed (your RolesGuard will allow owner too)
  list() {
    return this.audit.list(); // returns the recent audit entries
  }
}
