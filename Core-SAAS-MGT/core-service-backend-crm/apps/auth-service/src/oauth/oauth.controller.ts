import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  Req,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { OauthService } from './oauth.service';
import {
  AuthorizeDto,
  RegisterClientDto,
  TokenExchangeDto,
  IntrospectTokenDto,
} from './oauth.dto';

@Controller('auth/oauth')
@ApiTags('OAuth 2.0')
export class OauthController {
  constructor(private readonly oauthService: OauthService) {}

  @Post('clients')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Register OAuth Client',
    description: 'Register a new OAuth client application',
  })
  @ApiBody({ type: RegisterClientDto })
  @ApiResponse({
    status: 201,
    description: 'OAuth client registered',
    schema: {
      example: {
        clientId: 'client_abc123',
        clientSecret: 'secret_xyz789',
        redirectUris: ['https://app.example.com/callback'],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  registerClient(@Req() req: Request, @Body() dto: RegisterClientDto) {
    const user = req.user as User;
    return this.oauthService.registerClient(dto, user.tenantId);
  }

  @Get('authorize')
  @Redirect()
  @ApiOperation({
    summary: 'OAuth Authorization (Standalone Login)',
    description: 'Initiate OAuth authorization flow. Works as standalone login method without requiring prior authentication.',
  })
  @ApiQuery({
    name: 'client_id',
    example: 'client_queensos_webapp',
    description: 'OAuth client ID',
    required: true,
  })
  @ApiQuery({
    name: 'redirect_uri',
    example: 'http://localhost:5173/oauth/callback',
    description: 'Redirect URI (must match registered URI)',
    required: true,
  })
  @ApiQuery({
    name: 'response_type',
    example: 'code',
    description: 'Response type (must be "code")',
    required: true,
  })
  @ApiQuery({
    name: 'scope',
    example: 'openid profile email',
    description: 'Requested scopes',
    required: true,
  })
  @ApiQuery({
    name: 'state',
    example: 'random_state_string',
    description: 'CSRF protection state',
    required: false,
  })
  @ApiQuery({
    name: 'code_challenge',
    example: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    description: 'PKCE code challenge (recommended)',
    required: false,
  })
  @ApiQuery({
    name: 'code_challenge_method',
    example: 'S256',
    description: 'PKCE challenge method (S256 or plain)',
    required: false,
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to authorization endpoint or login page',
  })
  @ApiResponse({ status: 400, description: 'Invalid authorization request' })
  async authorize(@Query() dto: AuthorizeDto, @Req() req: Request) {
    // Validate OAuth request parameters
    if (!dto.client_id || !dto.redirect_uri || !dto.response_type) {
      throw new BadRequestException('Missing required OAuth parameters');
    }

    // Check if user is authenticated via JWT
    const authHeader = req.headers['authorization'] as string;
    let user: User | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        user = await this.oauthService.validateAndGetUser(token);
      } catch (error) {
        // Token invalid or expired, treat as unauthenticated
      }
    }

    // If user is authenticated, proceed with authorization
    if (user) {
      const redirectUrl = await this.oauthService.authorize(dto, user);
      return { url: redirectUrl, statusCode: 302 };
    }

    // If user is not authenticated, return error to redirect_uri
    // The frontend will handle the login and retry the OAuth flow
    const errorUrl = new URL(dto.redirect_uri);
    errorUrl.searchParams.set('error', 'login_required');
    errorUrl.searchParams.set('error_description', 'User must be authenticated to authorize');
    if (dto.state) {
      errorUrl.searchParams.set('state', dto.state);
    }
    
    return { url: errorUrl.toString(), statusCode: 302 };
  }

  @Post('token')
  @ApiOperation({
    summary: 'Exchange Authorization Code or Client Credentials',
    description:
      'Exchange OAuth code for access token or use client credentials',
  })
  @ApiBody({ type: TokenExchangeDto })
  @ApiResponse({
    status: 200,
    description: 'Token exchanged successfully',
    schema: {
      example: {
        accessToken: 'access_token_abc123',
        tokenType: 'Bearer',
        expiresIn: 3600,
        refreshToken: 'refresh_token_xyz789',
        scope: 'openid profile',
        tenantId: 'root-admin',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  exchangeToken(@Body() dto: TokenExchangeDto) {
    return this.oauthService.exchangeCode(dto);
  }

  @Post('introspect')
  @ApiOperation({
    summary: 'Introspect OAuth Token',
    description: 'Validate OAuth token and retrieve metadata',
  })
  @ApiBody({ type: IntrospectTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token introspection result',
    schema: {
      example: {
        active: true,
        scope: 'openid profile payments:read',
        client_id: 'client_abc123',
        tenant_id: 'root-admin',
        user_id: 'user_uuid',
        exp: 1748345678,
        iat: 1748342078,
        token_type: 'Bearer',
        is_root: false,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid client credentials' })
  introspectToken(@Body() dto: IntrospectTokenDto) {
    return this.oauthService.introspectToken(dto);
  }
}
