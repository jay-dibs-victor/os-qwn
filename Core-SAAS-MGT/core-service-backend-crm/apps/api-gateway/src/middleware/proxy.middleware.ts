import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import type { IncomingHttpHeaders } from 'http';
import proxy from 'express-http-proxy';

// ─── Shared CORS header decorator ────────────────────────────────────────────
function corsHeaders(headers: IncomingHttpHeaders, req: Request): IncomingHttpHeaders {
  const origin = req.headers.origin as string | undefined;
  return {
    ...headers,
    'access-control-allow-origin':      origin || '*',
    'access-control-allow-credentials': 'true',
    'access-control-allow-methods':     'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'access-control-allow-headers':     'Content-Type,Authorization,X-Tenant-ID,x-tenant-id,x-user-id,X-User-ID',
    'vary': 'Origin',
  };
}

// ─── Shared proxy factory ─────────────────────────────────────────────────────
function makeProxy(target: string, serviceName: string) {
  return proxy(target, {
    userResHeaderDecorator(headers, userReq) {
      return corsHeaders(headers, userReq as Request);
    },
    proxyErrorHandler(err: Error, res: Response) {
      console.error(`[PROXY ERROR] ${serviceName}: ${err.message}`);
      (res as any).status(503).json({ message: `${serviceName} unavailable` });
    },
  });
}

// ─── Proxy middlewares ────────────────────────────────────────────────────────

@Injectable()
export class AuthProxyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const host = this.configService.get<string>('AUTH_SERVICE_HOST') || 'localhost';
    const port = this.configService.get<number>('AUTH_SERVICE_PORT') || 3001;
    makeProxy(`http://${host}:${port}`, 'Auth Service')(req, res, next);
  }
}

@Injectable()
export class RbacProxyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const host = this.configService.get<string>('RBAC_SERVICE_HOST') || 'localhost';
    const port = this.configService.get<number>('RBAC_SERVICE_PORT') || 3002;
    makeProxy(`http://${host}:${port}`, 'RBAC Service')(req, res, next);
  }
}

@Injectable()
export class ApprovalProxyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const host = this.configService.get<string>('APPROVAL_SERVICE_HOST') || 'localhost';
    const port = this.configService.get<number>('APPROVAL_SERVICE_PORT') || 3004;
    makeProxy(`http://${host}:${port}`, 'Approval Service')(req, res, next);
  }
}

@Injectable()
export class LedgerProxyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const host = this.configService.get<string>('LEDGER_SERVICE_HOST') || 'localhost';
    const port = this.configService.get<number>('LEDGER_SERVICE_PORT') || 3003;
    makeProxy(`http://${host}:${port}`, 'Ledger Service')(req, res, next);
  }
}

@Injectable()
export class AccountsProxyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const host = this.configService.get<string>('ACCOUNTS_SERVICE_HOST') || 'localhost';
    const port = this.configService.get<number>('ACCOUNTS_SERVICE_PORT') || 3005;
    makeProxy(`http://${host}:${port}`, 'Accounts Service')(req, res, next);
  }
}

@Injectable()
export class PaymentProxyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const host = this.configService.get<string>('PAYMENT_SERVICE_HOST') || 'localhost';
    const port = this.configService.get<number>('PAYMENT_SERVICE_PORT') || 3006;
    makeProxy(`http://${host}:${port}`, 'Payment Service')(req, res, next);
  }
}

@Injectable()
export class BatchProxyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const host = this.configService.get<string>('BATCH_SERVICE_HOST') || 'localhost';
    const port = this.configService.get<number>('BATCH_SERVICE_PORT') || 3007;
    makeProxy(`http://${host}:${port}`, 'Batch Service')(req, res, next);
  }
}

@Injectable()
export class ReversalProxyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const host = this.configService.get<string>('REVERSAL_SERVICE_HOST') || 'localhost';
    const port = this.configService.get<number>('REVERSAL_SERVICE_PORT') || 3008;
    makeProxy(`http://${host}:${port}`, 'Reversal Service')(req, res, next);
  }
}

@Injectable()
export class RetryProxyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const host = this.configService.get<string>('RETRY_SERVICE_HOST') || 'localhost';
    const port = this.configService.get<number>('RETRY_SERVICE_PORT') || 3009;
    makeProxy(`http://${host}:${port}`, 'Retry Service')(req, res, next);
  }
}

@Injectable()
export class KycProxyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const host = this.configService.get<string>('KYC_SERVICE_HOST') || 'localhost';
    const port = this.configService.get<number>('KYC_SERVICE_PORT') || 3010;
    makeProxy(`http://${host}:${port}`, 'KYC Service')(req, res, next);
  }
}

@Injectable()
export class ComplianceProxyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const host = this.configService.get<string>('COMPLIANCE_SERVICE_HOST') || 'localhost';
    const port = this.configService.get<number>('COMPLIANCE_SERVICE_PORT') || 3011;
    makeProxy(`http://${host}:${port}`, 'Compliance Service')(req, res, next);
  }
}

@Injectable()
export class AuditProxyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const host = this.configService.get<string>('AUDIT_SERVICE_HOST') || 'localhost';
    const port = this.configService.get<number>('AUDIT_SERVICE_PORT') || 3012;
    makeProxy(`http://${host}:${port}`, 'Audit Service')(req, res, next);
  }
}

@Injectable()
export class LoanProxyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const host = this.configService.get<string>('LOAN_SERVICE_HOST') || 'localhost';
    const port = this.configService.get<number>('LOAN_SERVICE_PORT') || 3013;
    makeProxy(`http://${host}:${port}`, 'Loan Service')(req, res, next);
  }
}

@Injectable()
export class CustomerProxyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const host = this.configService.get<string>('CUSTOMER_SERVICE_HOST') || 'localhost';
    const port = this.configService.get<number>('CUSTOMER_SERVICE_PORT') || 3014;
    makeProxy(`http://${host}:${port}`, 'Customer Service')(req, res, next);
  }
}

@Injectable()
export class WalletProxyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const host = this.configService.get<string>('WALLET_SERVICE_HOST') || 'localhost';
    const port = this.configService.get<number>('WALLET_SERVICE_PORT') || 3015;
    makeProxy(`http://${host}:${port}`, 'Wallet Service')(req, res, next);
  }
}

@Injectable()
export class OverdraftProxyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const host = this.configService.get<string>('OVERDRAFT_SERVICE_HOST') || 'localhost';
    const port = this.configService.get<number>('OVERDRAFT_SERVICE_PORT') || 3016;
    makeProxy(`http://${host}:${port}`, 'Overdraft Service')(req, res, next);
  }
}

@Injectable()
export class NotificationProxyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}
  use(req: Request, res: Response, next: NextFunction) {
    const host = this.configService.get<string>('NOTIFICATION_SERVICE_HOST') || 'localhost';
    const port = this.configService.get<number>('NOTIFICATION_SERVICE_PORT') || 3017;
    makeProxy(`http://${host}:${port}`, 'Notification Service')(req, res, next);
  }
}
