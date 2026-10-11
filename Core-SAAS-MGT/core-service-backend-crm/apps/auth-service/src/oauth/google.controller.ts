import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  Query,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Response, Request } from 'express';
import { AuthServiceService } from '../auth-service.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('Auth Google OAuth')
@Controller('auth/google')
export class GoogleController {
  private readonly logger = new Logger(GoogleController.name);

  constructor(
    private authService: AuthServiceService,
    private configService: ConfigService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth login', description: 'Initiates the Google OAuth 2.0 authentication flow. Redirects the user to Google\'s consent screen.' })
  @ApiResponse({ status: 302, description: 'Redirect to Google consent screen' })
  async googleAuth(@Req() req: Request) {
    this.logger.debug('Google OAuth flow initiated');
  }

  @Get('callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback', description: 'Handles the OAuth callback from Google. Processes authentication, creates/updates the user, and redirects to the frontend with access tokens.' })
  @ApiQuery({ name: 'tenantId', required: false, example: 'root-admin', description: 'Tenant ID to associate with the authenticated user' })
  @ApiResponse({ status: 302, description: 'Redirect to frontend with tokens or error' })
  @ApiResponse({ status: 400, description: 'Google authentication failed or tenant ID missing' })
  async googleAuthRedirect(
    @Req() req: Request,
    @Res() res: Response,
    @Query('tenantId') tenantId?: string,
  ) {
    try {
      const user = req.user as any;

      if (!user) {
        throw new BadRequestException('Google authentication failed');
      }

      let resolvedTenantId = tenantId;
      if (!resolvedTenantId) {
        resolvedTenantId = req.headers['x-tenant-id'] as string;
      }

      if (!resolvedTenantId) {
        throw new BadRequestException('Tenant ID is required');
      }

      this.logger.debug(`Processing Google OAuth for user: ${user.email}, tenant: ${resolvedTenantId}`);

      const authResult = await this.authService.handleGoogleOAuth({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        googleId: user.googleId,
        picture: user.picture,
        tenantId: resolvedTenantId,
      });

      const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
      const redirectUrl = new URL(`${frontendUrl}/auth/callback`);
      redirectUrl.searchParams.append('accessToken', authResult.accessToken);
      redirectUrl.searchParams.append('refreshToken', authResult.refreshToken);
      redirectUrl.searchParams.append('userId', authResult.userId);
      redirectUrl.searchParams.append('tenantId', authResult.tenantId);

      this.logger.debug(`Redirecting to: ${redirectUrl.toString()}`);
      res.redirect(redirectUrl.toString());
    } catch (error) {
      this.logger.error('Google OAuth callback error:', error);
      const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
      const errorUrl = new URL(`${frontendUrl}/login`);
      errorUrl.searchParams.append('error', (error as Error).message || 'Google authentication failed');
      res.redirect(errorUrl.toString());
    }
  }
}
