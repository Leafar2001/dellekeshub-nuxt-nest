import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { type Role, roles } from '../../lib/project';
import { Review } from '../../reviews/persistence/review.entity';
import { WatchProgress } from '../../watch-progress/persistence/watch-progress.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  image: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  username: string | null;

  @Column({ type: 'varchar', nullable: true })
  displayUsername: string | null;

  @Column({ type: 'enum', enum: roles as unknown as string[], default: 'user' })
  role: Role;

  @Column({ type: 'text', nullable: true })
  avatarB64: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => WatchProgress, (progress) => progress.user)
  watchProgress: WatchProgress[];
}
