import jwt from 'jsonwebtoken';

const DELEGATION_SECRET = process.env.DELEGATION_SECRET || 'ai-os-delegation-secret-2026';

export interface DelegationScope {
  action: 'ride.request' | 'payment.authorize' | 'profile.read' | 'all';
  limit?: number; // e.g. max fare allowed to be authorized by AI
}

export class DelegationService {
  /**
   * Issue a short-lived token that allows the AI OS to act on behalf of the user
   */
  static issueToken(userId: string, scopes: DelegationScope[]): string {
    return jwt.sign(
      {
        sub: userId,
        scopes,
        iss: 'AI-OS-KERNEL',
        type: 'DELEGATION_PROXY'
      },
      DELEGATION_SECRET,
      { expiresIn: '1h' } // Short lived for safety
    );
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, DELEGATION_SECRET);
    } catch (err) {
      throw new Error('Invalid or expired delegation token');
    }
  }

  /**
   * Middleware-style check for a specific action and limit
   */
  static canPerform(token: string, action: string, amount?: number): boolean {
    const decoded = this.verifyToken(token);
    const scope = decoded.scopes.find((s: any) => s.action === action || s.action === 'all');
    
    if (!scope) return false;
    if (amount && scope.limit && amount > scope.limit) return false;
    
    return true;
  }
}
