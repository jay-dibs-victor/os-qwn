import { Injectable } from '@nestjs/common';
import { InterestMethod, RepaymentFrequency } from './entities/loan-application.entity';
import { RepaymentSchedule, RepaymentStatus } from './entities/repayment-schedule.entity';
import { LoanAccount } from './entities/loan-account.entity';

@Injectable()
export class LoanCalculationService {
  computeSchedules(
    principal: number,
    annualRate: number,
    termMonths: number,
    method: InterestMethod,
    frequency: RepaymentFrequency,
    loanAccount: LoanAccount,
    tenantId: string,
  ): RepaymentSchedule[] {
    const totalInstallments = termMonths;
    const monthlyRate = annualRate / 100 / 12;
    const schedules: RepaymentSchedule[] = [];

    let remainingPrincipal = principal;

    for (let i = 1; i <= totalInstallments; i++) {
      let interestDue: number;
      let principalDue: number;

      if (method === InterestMethod.FLAT_RATE) {
        interestDue = principal * monthlyRate;
        principalDue = principal / totalInstallments;
      } else {
        interestDue = remainingPrincipal * monthlyRate;
        principalDue =
          (principal * monthlyRate * Math.pow(1 + monthlyRate, totalInstallments)) /
            (Math.pow(1 + monthlyRate, totalInstallments) - 1) -
          interestDue;
      }

      const totalDue = principalDue + interestDue;
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);

      const schedule = new RepaymentSchedule();
      schedule.installmentNumber = i;
      schedule.dueDate = dueDate;
      schedule.principalDue = Math.round(principalDue * 100) / 100;
      schedule.interestDue = Math.round(interestDue * 100) / 100;
      schedule.totalDue = Math.round(totalDue * 100) / 100;
      schedule.amountPaid = 0;
      schedule.status = RepaymentStatus.DUE;
      schedule.loanAccount = loanAccount;
      schedule.tenantId = tenantId;

      schedules.push(schedule);
      remainingPrincipal -= principalDue;
    }

    return schedules;
  }

  accrueInterest(
    account: LoanAccount,
    days: number,
    annualRate: number,
  ): number {
    const dailyRate = annualRate / 100 / 365;
    return Math.round(account.outstandingPrincipal * dailyRate * days * 100) / 100;
  }

  computeDpdBucket(daysPastDue: number): string {
    if (daysPastDue <= 0) return 'CURRENT';
    if (daysPastDue <= 30) return 'DPD_1_30';
    if (daysPastDue <= 60) return 'DPD_31_60';
    if (daysPastDue <= 90) return 'DPD_61_90';
    return 'DPD_90_PLUS';
  }
}
