import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { type PersonRole } from '../../../lib/project';
import { Video } from '../video.entity';
import { Person } from '../../../person/persistence/person.entity';

@Entity('video_persons')
export class VideoPerson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Video, (video) => video.persons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'video_id' })
  video: Video;

  @Column({ type: 'uuid' })
  videoId: string;

  @ManyToOne(() => Person, (person) => person.videoPersons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'person_id' })
  person: Person;

  @Column({ type: 'uuid' })
  personId: string;

  @Column({
    type: 'text',
    array: true,
    default: () => `'{}'`,
  })
  roles: PersonRole[];

  @CreateDateColumn({ type: 'timestamptz' })
  addedAt: Date;
}
