import * as jose from 'jose';
import bcrypt from 'bcryptjs';
import { query } from '../db';
import { H3Event } from 'h3';

export class AuthService {
  static async getSecret(event: any) {
    const secret = event.context.cloudflare?.env?.JWT_SECRET || 'fallback_secret_for_dev_only';
    return new TextEncoder().encode(secret);
  }

  static async sign(event: any, payload: any) {
    const secret = await this.getSecret(event);
    return new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);
  }

  static async verify(event: any, token: string) {
    try {
      const secret = await this.getSecret(event);
      const { payload } = await jose.jwtVerify(token, secret);
      return payload;
    } catch (e) {
      return null;
    }
  }

  static async login(event: H3Event, email: string, pass: string) {
    const rows: any[] = await query(event, 'SELECT * FROM restaurants WHERE email = ?', [email]);
    if (rows.length === 0) return null;
    
    const user = rows[0];
    const match = await bcrypt.compare(pass, user.password);
    if (!match) return null;
    
    return {
      id: user.id,
      name: user.name,
      slug: user.slug,
      email: user.email
    };
  }

  static async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }
}
