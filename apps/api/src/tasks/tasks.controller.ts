import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Patch } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { RequireRole } from '@turbovets21/auth';
import { TasksService } from './tasks.service';

@UseGuards(JwtGuard, RolesGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly svc: TasksService) {}

  @Get()
  // allow any authenticated role (viewer/admin/owner)
  list(@Req() req: any) {
    return this.svc.list(req.user);
  }

  @Post()
  @RequireRole('admin') // only admin/owner
  create(@Body() dto: { title: string; category?: string }, @Req() req: any) {
    return this.svc.create(req.user, dto);
  }

  @Put(':id')
  @RequireRole('admin')
  update(@Param('id') id: string, @Body() patch: any, @Req() req: any) {
    return this.svc.update(req.user, +id, patch);
  }

  @Delete(':id')
  @RequireRole('admin')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.svc.remove(req.user, +id);
  }

   @Patch('reorder')
  @RequireRole('admin') // owner inherits via RolesGuard
  reorder(@Req() req, @Body() body: { ids: number[] }) {
    return this.svc.reorder(req.user, body?.ids ?? []);
  }
}
