import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailConfig } from './entities/mail-config.entity';
import { CreateMailConfigDto } from './dto/create-mail-config.dto';
import { UpdateMailConfigDto } from './dto/update-mail-config.dto';

@Injectable()
export class NotificationServiceService {
  private readonly logger = new Logger(NotificationServiceService.name);

  constructor(
    @InjectRepository(MailConfig)
    private readonly mailConfigRepository: Repository<MailConfig>,
  ) {}

  async create(dto: CreateMailConfigDto): Promise<MailConfig> {
    const existing = await this.mailConfigRepository.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException(`Mail config "${dto.name}" already exists`);
    }

    if (dto.isDefault) {
      await this.clearDefault();
    }

    const config = this.mailConfigRepository.create(dto);
    return this.mailConfigRepository.save(config);
  }

  async findAll(): Promise<MailConfig[]> {
    return this.mailConfigRepository.find({ order: { isDefault: 'DESC', createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<MailConfig> {
    const config = await this.mailConfigRepository.findOne({ where: { id } });
    if (!config) {
      throw new NotFoundException(`Mail config with id "${id}" not found`);
    }
    return config;
  }

  async findDefault(): Promise<MailConfig | null> {
    const config = await this.mailConfigRepository.findOne({ where: { isDefault: true, isActive: true } });
    if (!config) {
      const firstActive = await this.mailConfigRepository.findOne({ where: { isActive: true } });
      if (firstActive) {
        firstActive.isDefault = true;
        return this.mailConfigRepository.save(firstActive);
      }
      return null;
    }
    return config;
  }

  async update(id: string, dto: UpdateMailConfigDto): Promise<MailConfig> {
    const config = await this.findOne(id);

    if (dto.name && dto.name !== config.name) {
      const existing = await this.mailConfigRepository.findOne({ where: { name: dto.name } });
      if (existing) {
        throw new ConflictException(`Mail config "${dto.name}" already exists`);
      }
    }

    if (dto.isDefault) {
      await this.clearDefault();
    }

    Object.assign(config, dto);
    return this.mailConfigRepository.save(config);
  }

  async setDefault(id: string): Promise<MailConfig> {
    const config = await this.findOne(id);
    await this.clearDefault();
    config.isDefault = true;
    return this.mailConfigRepository.save(config);
  }

  async remove(id: string): Promise<void> {
    const config = await this.findOne(id);
    await this.mailConfigRepository.remove(config);
  }

  private async clearDefault(): Promise<void> {
    await this.mailConfigRepository.update({ isDefault: true }, { isDefault: false });
  }
}
