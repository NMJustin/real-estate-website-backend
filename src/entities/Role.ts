import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './User.js';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text', { unique: true })
  name: string;

  @Column('text', { nullable: true })
  description: string | undefined;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
