import { Injectable, NotFoundException } from '@nestjs/common';
import { GlAccountsRepository } from './repositories/gl-accounts.repository';
import { CreateGlAccountDto, UpdateGlAccountDto } from './dto/gl-account.dto';
import { GlAccount } from './entities/gl-account.entity';

const ROOT_TENANT = 'root-admin';

@Injectable()
export class GlAccountsService {
  constructor(private readonly glAccountsRepository: GlAccountsRepository) {}

  async createGlAccount(dto: CreateGlAccountDto) {
    const glAccount = new GlAccount();
    Object.assign(glAccount, dto);
    if (glAccount.type) {
      glAccount.type = glAccount.type.toLowerCase() as any;
    }

    if (dto.parentId) {
      const parent = await this.glAccountsRepository.findOneNullable({
        id: dto.parentId,
      });
      if (parent) glAccount.parent = parent;
    }

    return this.glAccountsRepository.create(glAccount);
  }

  async getGlAccounts(tenantId: string, skip = 0, take = 100) {
    const filter = tenantId !== ROOT_TENANT ? { tenantId } : {};
    const [data, total] = await this.glAccountsRepository.findAndCount({
      where: filter,
      skip,
      take,
      order: { code: 'ASC' },
    });
    return { data, total };
  }

  async getGlAccountTrees(tenantId: string) {
    if (tenantId === ROOT_TENANT) {
      return this.glAccountsRepository.findTrees();
    }
    return this.glAccountsRepository.findTreesByTenant(tenantId);
  }

  async getGlAccount(id: string, tenantId: string) {
    const filter = tenantId !== ROOT_TENANT ? { id, tenantId } : { id };
    return this.glAccountsRepository.findOne(filter);
  }

  async updateGlAccount(id: string, dto: UpdateGlAccountDto, tenantId: string) {
    const filter = tenantId !== ROOT_TENANT ? { id, tenantId } : { id };
    const account = await this.glAccountsRepository.findOneNullable(filter);
    if (!account) {
      throw new NotFoundException(`GL account ${id} not found`);
    }
    const updateData = { ...dto };
    if (updateData.type) {
      updateData.type = updateData.type.toLowerCase() as any;
    }
    return this.glAccountsRepository.findOneAndUpdate(filter, updateData as any);
  }
}
