import { Injectable } from '@nestjs/common';

export interface AbacContext {
  user: any;
  resource: any;
  env: any;
}

@Injectable()
export class AbacService {
  evaluate(rules: Record<string, any>, context: AbacContext): boolean {
    return this.match(rules, context);
  }

  private match(rule: Record<string, any>, context: any): boolean {
    if (typeof rule !== 'object' || rule === null) return false;

    for (const key in rule) {
      const ruleVal = rule[key] as unknown;
      if (key === 'OR' && Array.isArray(ruleVal)) {
        return (ruleVal as Record<string, any>[]).some((r) =>
          this.match(r, context),
        );
      }
      if (key === 'AND' && Array.isArray(ruleVal)) {
        return (ruleVal as Record<string, any>[]).every((r) =>
          this.match(r, context),
        );
      }

      const contextVal = this.getValueByPath(context, key);

      if (contextVal !== ruleVal) return false;
    }

    return true;
  }

  private getValueByPath(obj: any, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;
    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = (current as Record<string, any>)[part];
      } else {
        return undefined;
      }
    }
    return current;
  }
}
