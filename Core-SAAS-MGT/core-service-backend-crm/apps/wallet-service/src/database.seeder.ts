import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DriverEarning, DriverEarningStatus } from './entities/driver-earning.entity';
import { v4 as uuidv4 } from 'uuid';

interface DriverInfo {
  tenantId: string;
  driverCustomerId: string;
}

@Injectable()
export class DatabaseSeeder {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(
    @InjectRepository(DriverEarning)
    private readonly driverEarningRepository: Repository<DriverEarning>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting wallet-service database seeding...');
    try {
      await this.driverEarningRepository.query('TRUNCATE TABLE driver_earnings CASCADE');
      this.logger.log('Truncated driver_earnings table');

      const drivers = this.buildDriverList();
      let totalRecords = 0;

      for (const driver of drivers) {
        const records = this.generateEarningsForDriver(driver);
        await this.driverEarningRepository.save(records);
        totalRecords += records.length;
      }

      this.logger.log(`Seeded ${totalRecords} DriverEarning records for ${drivers.length} drivers`);
      this.logger.log('Wallet-service seeding completed successfully!');
    } catch (error) {
      this.logger.error('Wallet-service seeding failed:', error);
      this.logger.warn('Service will continue despite seeding failure');
    }
  }

  private buildDriverList(): DriverInfo[] {
    const drivers: DriverInfo[] = [];

    const tenantDriverRanges: { tenantId: string; startId: number; endId: number }[] = [
      { tenantId: 'root-admin', startId: 1, endId: 10 },
      { tenantId: 'tenant-001', startId: 26, endId: 35 },
      { tenantId: 'tenant-002', startId: 51, endId: 60 },
      { tenantId: 'acme-corp', startId: 76, endId: 85 },
    ];

    for (const range of tenantDriverRanges) {
      for (let i = range.startId; i <= range.endId; i++) {
        drivers.push({
          tenantId: range.tenantId,
          driverCustomerId: String(1000000000 + i),
        });
      }
    }

    return drivers;
  }

  private generateEarningsForDriver(driver: DriverInfo): Partial<DriverEarning>[] {
    const records: Partial<DriverEarning>[] = [];
    const recordCount = 10 + Math.floor(Math.random() * 6);

    for (let i = 0; i < recordCount; i++) {
      const daysAgo = Math.floor(Math.random() * 90);
      const tripDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      const tripFare = 1500 + Math.floor(Math.random() * 3501);
      const commissionRate = 0.10 + Math.random() * 0.05;
      const platformCommission = Math.round(tripFare * commissionRate * 100) / 100;
      const partnerCommission = 0;
      const netEarnings = tripFare - platformCommission - partnerCommission;
      const bonusAmount = Math.random() > 0.7 ? Math.floor(Math.random() * 500) + 100 : 0;
      const penaltyAmount = Math.random() > 0.85 ? Math.floor(Math.random() * 200) + 50 : 0;
      const subscriptionDeduction = Math.random() > 0.9 ? 500 : 0;
      const leaseDeduction = 0;
      const finalPayout = netEarnings + bonusAmount - penaltyAmount - subscriptionDeduction - leaseDeduction;
      const status = daysAgo > 7 ? DriverEarningStatus.PAID : DriverEarningStatus.POSTED;

      records.push({
        tenantId: driver.tenantId,
        driverCustomerId: driver.driverCustomerId,
        tripId: `trip-${uuidv4()}`,
        tripFare,
        platformCommission,
        partnerCommission,
        netEarnings,
        bonusAmount,
        penaltyAmount,
        subscriptionDeduction,
        leaseDeduction,
        finalPayout,
        currency: 'NGN',
        status,
        createdAt: tripDate,
        updatedAt: tripDate,
      });
    }

    return records;
  }
}
