import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task } from '../entities/task.entity';
import { AuditService } from '../audit/audit.service';

type CurrentUser = {
  sub: number;               // user id from JWT
  orgId: number;             // org id from JWT
  role: 'owner' | 'admin' | 'viewer';
  email?: string;
};

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly tasks: Repository<Task>,
    private readonly audit: AuditService
  ) {}

  private async nextPosition(orgId: number) {
    const latest = await this.tasks.find({
      where: { organization: { id: orgId } },
      order: { position: 'DESC' },
      take: 1
    });
    return latest.length ? latest[0].position + 1 : 1;
  }

  private canWrite(user: CurrentUser, taskOrgId: number) {
    return (user.role === 'owner' || user.role === 'admin') && user.orgId === taskOrgId;
  }

  async create(user: CurrentUser, dto: { title: string; category?: string }) {
    if (user.role !== 'owner' && user.role !== 'admin') throw new ForbiddenException();
    if (!user.orgId) throw new BadRequestException('orgId missing in token');
    if (!dto?.title?.trim()) throw new BadRequestException('title is required');

    const pos = await this.nextPosition(user.orgId);

    const entity = this.tasks.create({
      title: dto.title.trim(),
      category: dto.category ?? '',
      done: false,
      position: pos, // initial position
      organization: { id: user.orgId } as any,
      owner: { id: user.sub } as any,
    });

    const saved = await this.tasks.save(entity);
    this.audit.info('task.create', { userId: user.sub, taskId: saved.id });
    return saved;
  }

  async list(user: CurrentUser) {
    if (!user.orgId) throw new BadRequestException('orgId missing in token');

    // Backfill any missing/zero positions (safe no-op if already set)
    await this.tasks
      .createQueryBuilder()
      .update()
      .set({ position: () => '"id"' })
      .where('("position" = 0 OR "position" IS NULL)')
      .execute();

    return this.tasks.find({
      where: { organization: { id: user.orgId } },
      order: { position: 'ASC', id: 'ASC' }, // ordered list
    });
  }

  async update(user: CurrentUser, id: number, dto: Partial<Task>) {
    const task = await this.tasks.findOne({ where: { id } });
    if (!task) throw new NotFoundException();
    if (!this.canWrite(user, task.organization.id)) throw new ForbiddenException();

    const patch: Partial<Task> = {};
    if (dto.title !== undefined) patch.title = `${dto.title}`;
    if (dto.category !== undefined) patch.category = dto.category ?? '';
    if (dto.done !== undefined) patch.done = !!dto.done;

    if (Object.keys(patch).length === 0) return task;

    Object.assign(task, patch);
    const saved = await this.tasks.save(task);
    this.audit.info('task.update', { userId: user.sub, taskId: saved.id });
    return saved;
  }

  async remove(user: CurrentUser, id: number) {
    const task = await this.tasks.findOne({ where: { id } });
    if (!task) return { ok: true };
    if (!this.canWrite(user, task.organization.id)) throw new ForbiddenException();

    await this.tasks.remove(task);
    this.audit.info('task.delete', { userId: user.sub, taskId: id });
    return { ok: true };
  }

  // bulk reorder by id sequence
  async reorder(user: CurrentUser, ids: number[]) {
    if (user.role !== 'owner' && user.role !== 'admin') throw new ForbiddenException();
    if (!Array.isArray(ids) || ids.length === 0) return { ok: true };

    // Fetch only tasks in this org & among provided ids
    const rows = await this.tasks.find({
      where: { organization: { id: user.orgId }, id: In(ids) },
      select: ['id'],
    });
    const allowedIds = new Set(rows.map(r => r.id));

    await this.tasks.manager.transaction(async (mgr) => {
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        if (!allowedIds.has(id)) continue; // ignore foreign/org-mismatched ids
        await mgr
          .createQueryBuilder()
          .update(Task)
          .set({ position: i + 1 })
          .where({ id })
          .execute();
      }
    });

    this.audit.info('task.reorder', { userId: user.sub, ids });
    return { ok: true };
  }
}
