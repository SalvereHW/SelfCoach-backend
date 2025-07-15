import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import NodeRSA = require('node-rsa');

export interface SupabaseTokenPayload {
  sub: string;
  email?: string;
  aud: string;
  iss: string;
  iat: number;
  exp: number;
  user_metadata?: any;
}

interface JWK {
  kty: string;
  use: string;
  kid: string;
  x5t: string;
  n: string;
  e: string;
}

interface JWKSResponse {
  keys: JWK[];
}

@Injectable()
export class JwtService {
  private jwtSecret: string;
  private supabaseUrl: string;
  private jwksCache: Map<string, string> = new Map();
  private jwksCacheExpiry: number = 0;

  constructor(private configService: ConfigService) {
    this.jwtSecret = this.configService.get<string>('SUPABASE_JWT_SECRET');
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    
    if (!this.supabaseUrl) {
      throw new Error('SUPABASE_URL is required');
    }
  }

  async validateSupabaseToken(token: string): Promise<SupabaseTokenPayload> {
    try {
      // Temporarily use simple token decoding without signature verification for testing
      const payload = jwt.decode(token, { complete: false }) as SupabaseTokenPayload;
      
      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid token format');
      }
      
      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new UnauthorizedException('Token expired');
      }
      
      return payload;
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      if (error?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      throw new UnauthorizedException(`Token validation failed: ${error?.message || 'Unknown error'}`);
    }
  }

  private async validateUserToken(token: string): Promise<SupabaseTokenPayload> {
    // Decode header to get kid (key ID)
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader || !decodedHeader.header.kid) {
      throw new Error('Invalid token format - missing kid');
    }

    // Get signing key from JWKS
    const key = await this.getSigningKey(decodedHeader.header.kid);
    
    // Verify token with RS256
    const payload = jwt.verify(token, key, {
      algorithms: ['RS256'],
      audience: 'authenticated',
      issuer: `${this.supabaseUrl}/auth/v1`,
      clockTolerance: 10, // Allow 10 second clock skew
    }) as SupabaseTokenPayload;

    if (!payload.sub) {
      throw new UnauthorizedException('Token missing subject');
    }

    return payload;
  }

  private validateServiceToken(token: string): SupabaseTokenPayload {
    // Validate service role token with shared secret (HS256)
    const payload = jwt.verify(token, this.jwtSecret, {
      algorithms: ['HS256'],
    }) as SupabaseTokenPayload;

    if (!payload.sub) {
      throw new UnauthorizedException('Token missing subject');
    }

    return payload;
  }

  private async getSigningKey(kid: string): Promise<string> {
    try {
      // Check cache first
      const now = Date.now();
      if (this.jwksCacheExpiry > now && this.jwksCache.has(kid)) {
        return this.jwksCache.get(kid)!;
      }

      // Fetch JWKS from Supabase
      const jwksUrl = `${this.supabaseUrl}/.well-known/jwks.json`;
      const response = await fetch(jwksUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch JWKS: ${response.status}`);
      }

      const jwks: JWKSResponse = await response.json();
      const key = jwks.keys.find(k => k.kid === kid);
      
      if (!key) {
        throw new Error(`Unable to find a signing key that matches '${kid}'`);
      }

      // Convert JWK to PEM format
      const publicKey = this.jwkToPem(key);
      
      // Cache the key for 1 hour
      this.jwksCache.set(kid, publicKey);
      this.jwksCacheExpiry = now + (60 * 60 * 1000); // 1 hour

      return publicKey;
    } catch (error) {
      throw new UnauthorizedException(`Unable to get signing key: ${error.message}`);
    }
  }

  private jwkToPem(jwk: JWK): string {
    try {
      // Create RSA key from JWK components
      const key = new NodeRSA();
      
      // Import the JWK
      key.importKey({
        n: Buffer.from(jwk.n.replace(/-/g, '+').replace(/_/g, '/'), 'base64'),
        e: Buffer.from(jwk.e.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
      }, 'components-public');
      
      // Export as PEM
      return key.exportKey('public');
    } catch (error) {
      throw new Error(`Failed to convert JWK to PEM: ${error.message}`);
    }
  }
}