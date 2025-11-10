import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn() id: number;

  @Column() title: string;
  @Column({ default: '' }) category: string; // e.g. Work, Personal
  @Column({ default: false }) done: boolean;

  @Column({ type: 'int', default: 0 })
  position!: number;

  @ManyToOne(() => Organization, { eager: true })
  organization: Organization;

  @ManyToOne(() => User, { eager: true, nullable: true })
  owner?: User; // creator
}
