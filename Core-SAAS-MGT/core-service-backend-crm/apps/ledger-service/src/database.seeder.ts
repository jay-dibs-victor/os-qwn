import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TripFinancialRecord, TripFinancialStatus } from './entities/trip-financial-record.entity';
import { v4 as uuidv4 } from 'uuid';

interface DriverInfo {
  tenantId: string;
  driverCustomerId: string;
}

@Injectable()
export class DatabaseSeeder {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(
    @InjectRepository(TripFinancialRecord)
    private readonly tripFinancialRecordRepository: Repository<TripFinancialRecord>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting ledger-service database seeding...');
    try {
      await this.tripFinancialRecordRepository.query('TRUNCATE TABLE trip_financial_records CASCADE');
      this.logger.log('Truncated trip_financial_records table');

      const drivers = this.buildDriverList();
      const riders = this.buildRiderMap();
      let totalRecords = 0;

      for (const driver of drivers) {
        const tenantRiders = riders[driver.tenantId];
        const records = this.generateRecordsForDriver(driver, tenantRiders);
        await this.tripFinancialRecordRepository.save(records);
        totalRecords += records.length;
      }

      this.logger.log(`Seeded ${totalRecords} TripFinancialRecord records for ${drivers.length} drivers`);
      this.logger.log('Ledger-service seeding completed successfully!');
    } catch (error) {
      this.logger.error('Ledger-service seeding failed:', error);
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

  private buildRiderMap(): Record<string, string[]> {
    const riderRanges: { tenantId: string; startId: number; endId: number }[] = [
      { tenantId: 'root-admin', startId: 11, endId: 20 },
      { tenantId: 'tenant-001', startId: 36, endId: 45 },
      { tenantId: 'tenant-002', startId: 61, endId: 70 },
      { tenantId: 'acme-corp', startId: 86, endId: 95 },
    ];

    const map: Record<string, string[]> = {};
    for (const range of riderRanges) {
      const riders: string[] = [];
      for (let i = range.startId; i <= range.endId; i++) {
        riders.push(String(1000000000 + i));
      }
      map[range.tenantId] = riders;
    }

    return map;
  }

  private generateRecordsForDriver(
    driver: DriverInfo,
    tenantRiders: string[],
  ): Partial<TripFinancialRecord>[] {
    const records: Partial<TripFinancialRecord>[] = [];
    const recordCount = 10 + Math.floor(Math.random() * 6);

    for (let i = 0; i < recordCount; i++) {
      const daysAgo = Math.floor(Math.random() * 90);
      const tripDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      const totalFare = 1500 + Math.floor(Math.random() * 3501);
      const platformCommissionRate = 0.10;
      const platformCommissionAmount = Math.round(totalFare * platformCommissionRate * 100) / 100;
      const partnerCommissionAmount = 0;
      const gatewayFee = Math.round(totalFare * 0.015 * 100) / 100;
      const driverPayout = totalFare - platformCommissionAmount - partnerCommissionAmount - gatewayFee;

      const riderCustomerId = tenantRiders[Math.floor(Math.random() * tenantRiders.length)];

      let status: TripFinancialStatus;
      if (daysAgo > 14) {
        status = TripFinancialStatus.COMPLETED;
      } else if (daysAgo > 3) {
        status = TripFinancialStatus.PAYMENT_RECEIVED;
      } else {
        status = TripFinancialStatus.PENDING_PAYMENT;
      }

      records.push({
        tenantId: driver.tenantId,
        tripId: `trip-${uuidv4()}`,
        driverCustomerId: driver.driverCustomerId,
        riderCustomerId,
        totalFare,
        platformCommissionAmount,
        platformCommissionRate,
        partnerCommissionAmount,
        partnerCommissionRate: 0,
        gatewayFee,
        driverPayout,
        currency: 'NGN',
        status,
        isCorporateDriver: false,
        createdAt: tripDate,
        updatedAt: tripDate,
      });
    }

    return records;
  }
}
