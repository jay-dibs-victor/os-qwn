import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository, EntityManager } from 'typeorm';
import { AbstractRepository } from '@app/common';
import { GlAccount } from '../entities/gl-account.entity';

@Injectable()
export class GlAccountsRepository extends AbstractRepository<GlAccount> {
  protected readonly logger = new Logger(GlAccountsRepository.name);

  constructor(
    @InjectRepository(GlAccount)
    protected readonly treeRepository: TreeRepository<GlAccount>,
    entityManager: EntityManager,
  ) {
    super(treeRepository, entityManager);
  }

  async findTrees() {
    return this.treeRepository.findTrees();
  }

  async findTreesByTenant(tenantId: string) {
    const trees = await this.treeRepository.findTrees();
    if (tenantId === 'root-admin') {
      return trees;
    }
    return trees.filter(tree => tree.tenantId === tenantId);
  }

  async findRoots() {
    return this.treeRepository.findRoots();
  }

  async findDescendants(account: GlAccount) {
    return this.treeRepository.findDescendants(account);
  }

  async findAndCount(options: any) {
    return this.repository.findAndCount(options);
  }
}
