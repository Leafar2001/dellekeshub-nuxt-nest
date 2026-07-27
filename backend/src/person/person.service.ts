import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './persistence/person.entity';
import type { LocalizedString } from '../lib/validation/localization';

@Injectable()
export class PersonService {
  private readonly logger = new Logger(PersonService.name);

  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) {}

  findById(id: string) {
    return this.personRepository.findOne({ where: { id } });
  }

  async findByIdOrFail(id: string) {
    const person = await this.findById(id);
    if (!person) throw new NotFoundException('Person not found');
    return person;
  }

  findAll() {
    return this.personRepository.find({ order: { firstname: 'ASC' } });
  }

  create(data: {
    firstname: string;
    lastname?: string | null;
    description?: LocalizedString | null;
  }) {
    const person = this.personRepository.create(data);
    return this.personRepository.save(person);
  }
}
