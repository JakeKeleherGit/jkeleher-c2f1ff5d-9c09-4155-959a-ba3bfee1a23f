import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Organization } from './organization.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn() id: number;

  @Column({ unique: true }) email: string;
  @Column() passwordHash: string;

  @Column({ default: 'viewer' }) role: 'owner' | 'admin' | 'viewer';

  @ManyToOne(() => Organization, { eager: true })
  organization: Organization;
}
