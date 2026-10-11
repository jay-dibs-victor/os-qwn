import {
  IsString,
  IsNotEmpty,
  IsIn,
  IsOptional,
  IsUrl,
  IsArray,
  MinLength,
} from 'class-validator';

export class AuthorizeDto {
  @IsString()
  @IsIn(['code'])
  response_type: string;

  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsString()
  @IsUrl({ require_tld: false })
  redirect_uri: string;

  @IsString()
  @IsNotEmpty()
  scope: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsNotEmpty()
  code_challenge: string;

  @IsString()
  @IsIn(['S256'])
  code_challenge_method: string;
}

export class TokenExchangeDto {
  @IsString()
  @IsIn(['authorization_code', 'refresh_token', 'client_credentials', 'urn:ietf:params:oauth:grant-type:token-exchange'])
  grant_type: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsUrl({ require_tld: false })
  @IsOptional()
  redirect_uri?: string;

  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsString()
  @IsOptional()
  client_secret?: string; // Required for client_credentials and confidential clients

  @IsString()
  @MinLength(43)
  @IsOptional()
  code_verifier?: string;

  @IsString()
  @IsOptional()
  refresh_token?: string;

  @IsString()
  @IsOptional()
  scope?: string; // For client_credentials flow

  @IsString()
  @IsOptional()
  subject_token?: string; // For token-exchange grant (RFC 8693)

  @IsString()
  @IsOptional()
  subject_token_type?: string; // Defaults to urn:ietf:params:oauth:token-type:jwt
}

export class RegisterClientDto {
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsArray()
  @IsString({ each: true })
  redirectUris: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  scopes?: string[];

  @IsOptional()
  isPublic?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  grantTypes?: string[]; // ['authorization_code', 'client_credentials', 'refresh_token']

  @IsString()
  @IsOptional()
  description?: string;
}

export class IntrospectTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsString()
  @IsOptional()
  client_secret?: string; // Required for confidential clients
}

export class RevokeTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsIn(['access_token', 'refresh_token'])
  @IsOptional()
  token_type_hint?: string;

  @IsString()
  @IsNotEmpty()
  client_id: string;

  @IsString()
  @IsOptional()
  client_secret?: string; // Required for confidential clients
}
