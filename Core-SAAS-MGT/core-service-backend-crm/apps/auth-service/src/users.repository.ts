import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class UsersRepository extends AbstractRepository<User> {
  protected readonly logger = new Logger(UsersRepository.name);

  constructor(
    @InjectRepository(User)
    userRepository: Repository<User>,
    entityManager: EntityManager,
  ) {
    super(userRepository, entityManager);
  }

  async findByEmail(email: string): Promise<User> {
    return this.findOne({ email });
  }

  async findByPhone(phone: string): Promise<User> {
    return this.findOne({ phone });
  }

  async findByEmailInTenant(email: string, tenantId: string): Promise<User> {
    this.logger.log(`Finding user by email ${email} in tenant ${tenantId}`);
    return this.findOne({ email, tenantId });
  }

  async findByPhoneInTenant(phone: string, tenantId: string): Promise<User> {
    this.logger.log(`Finding user by phone ${phone} in tenant ${tenantId}`);
    return this.findOne({ phone, tenantId });
  }
}
