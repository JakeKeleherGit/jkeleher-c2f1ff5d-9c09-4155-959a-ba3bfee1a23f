import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn() id: number;

  @Column() name: string;

  // Two-level: parent has null parentId; child has parent
  @ManyToOne(() => Organization, (o) => o.children, { nullable: true })
  parent?: Organization;

  @OneToMany(() => Organization, (o) => o.parent)
  children: Organization[];
}
