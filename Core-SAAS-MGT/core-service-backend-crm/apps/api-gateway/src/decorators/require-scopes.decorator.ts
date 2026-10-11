import { SetMetadata } from '@nestjs/common';

export const SCOPES_KEY = 'required_scopes';

/**
 * Decorator to specify required OAuth scopes for an endpoint
 * @param scopes - Array of required scopes (e.g., ['payments:read', 'payments:write'])
 * 
 * @example
 * @RequireScopes('payments:read', 'payments:write')
 * @Get('payments')
 * async getPayments() {
 *   // Only accessible with both payments:read and payments:write scopes
 * }
 */
export const RequireScopes = (...scopes: string[]) =>
  SetMetadata(SCOPES_KEY, scopes);
