import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../entities/customer.entity';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CustomersRepository } from '../customers.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  providers: [CustomersService, CustomersRepository],
  controllers: [CustomersController],
  exports: [CustomersService, CustomersRepository],
})
export class CustomersModule {}
