// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Organization } from './entities/organization.entity';
import * as bcrypt from 'bcrypt';
import { getRepositoryToken } from '@nestjs/typeorm';

async function seed(app: INestApplication) {        
  const orgRepo = app.get<Repository<Organization>>(getRepositoryToken(Organization));
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

  let org = await orgRepo.findOne({ where: { name: 'Acme' } });
  if (!org) org = await orgRepo.save(orgRepo.create({ name: 'Acme' }));

  const users = [
    { email: 'owner@acme.test', role: 'owner', pw: 'pass123' },
    { email: 'admin@acme.test', role: 'admin', pw: 'pass123' },
    { email: 'viewer@acme.test', role: 'viewer', pw: 'pass123' },
  ];

  for (const u of users) {
    const exist = await userRepo.findOne({ where: { email: u.email } });
    if (!exist) {
      await userRepo.save(userRepo.create({
        email: u.email,
        role: u.role as any,
        organization: org,
        passwordHash: await bcrypt.hash(u.pw, 10),
      }));
    }
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  await seed(app);
  await app.listen(3333);
}
bootstrap();
