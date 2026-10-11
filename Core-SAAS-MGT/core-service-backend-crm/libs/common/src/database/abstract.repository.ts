import { Logger, NotFoundException } from '@nestjs/common';
import {
  EntityManager,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { AbstractEntity } from './abstract.entity';

export abstract class AbstractRepository<T extends AbstractEntity> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly repository: Repository<T>,
    protected readonly entityManager: EntityManager,
  ) {}

  async create(entity: T): Promise<T> {
    const entityInstance = this.repository.create(entity);
    return this.entityManager.save(entityInstance);
  }

  async saveMany(entities: T[]): Promise<T[]> {
    return this.entityManager.save(entities);
  }

  async findOne(
    where: FindOptionsWhere<T>,
    relations?: FindOptionsRelations<T>,
  ): Promise<T> {
    const entity = await this.repository.findOne({ where, relations });

    if (!entity) {
      this.logger.warn('Entity not found with where', where);
      throw new NotFoundException('Entity not found.');
    }

    return entity;
  }

  async findOneNullable(
    where: FindOptionsWhere<T>,
    relations?: FindOptionsRelations<T>,
  ): Promise<T | null> {
    return this.repository.findOne({ where, relations });
  }

  async findOneAndUpdate(
    where: FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
  ): Promise<T> {
    const updateResult = await this.repository.update(where, partialEntity);

    if (!updateResult.affected) {
      this.logger.warn('Entity not found with where', where);
      throw new NotFoundException('Entity not found.');
    }

    return this.findOne(where);
  }

  async find(
    where: FindOptionsWhere<T>,
    relations?: FindOptionsRelations<T>,
  ): Promise<T[]> {
    return this.repository.find({ where, relations });
  }

  async findOneAndDelete(where: FindOptionsWhere<T>) {
    await this.repository.softDelete(where);
  }
}
