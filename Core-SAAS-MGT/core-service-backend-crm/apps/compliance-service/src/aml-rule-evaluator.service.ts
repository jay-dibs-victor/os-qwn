import { Injectable } from '@nestjs/common';
import { AmlRule, AmlRuleType } from './entities/aml-rule.entity';
import { ComplianceAlert } from './entities/compliance-alert.entity';

export interface TransactionContext {
  transactionId: string;
  customerId: string;
  counterpartyName?: string;
  amount: number;
  tenantId: string;
}

@Injectable()
export class AmlRuleEvaluatorService {
  evaluate(
    transaction: TransactionContext,
    rules: AmlRule[],
  ): ComplianceAlert[] {
    const alerts: ComplianceAlert[] = [];

    for (const rule of rules) {
      if (!rule.isEnabled) continue;

      let triggered = false;
      const evidence: Record<string, unknown> = { ruleId: rule.id };

      switch (rule.type) {
        case AmlRuleType.AMOUNT_THRESHOLD: {
          const threshold = (rule.conditions?.threshold as number) ?? 0;
          if (transaction.amount >= threshold) {
            triggered = true;
            evidence.amount = transaction.amount;
            evidence.threshold = threshold;
          }
          break;
        }
        case AmlRuleType.SANCTIONS: {
          const blockedNames = [
            'Blocked Person Holdings',
            'Sanctioned Entity Ltd',
          ];
          if (
            transaction.counterpartyName &&
            blockedNames.some((n) =>
              transaction.counterpartyName?.toLowerCase().includes(n.toLowerCase()),
            )
          ) {
            triggered = true;
            evidence.counterpartyName = transaction.counterpartyName;
          }
          break;
        }
        case AmlRuleType.VELOCITY: {
          // Would check frequency of transactions over time window
          break;
        }
        case AmlRuleType.COUNTRY: {
          // Would check country of counterparty
          break;
        }
      }

      if (triggered) {
        const alert = new ComplianceAlert();
        alert.transactionId = transaction.transactionId;
        alert.customerId = transaction.customerId;
        alert.ruleId = rule.id;
        alert.ruleName = rule.name;
        alert.severity = rule.severity;
        alert.status = 'OPEN';
        alert.evidence = evidence;
        alert.tenantId = transaction.tenantId;
        alerts.push(alert);
      }
    }

    return alerts;
  }
}
