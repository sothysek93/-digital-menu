import * as jose from 'jose';
import bcrypt from 'bcryptjs';
import { query } from '../db';
import { H3Event } from 'h3';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_dev_only');

export class AuthService {
  static async sign(payload: any) {
    return new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);
  }

  static async verify(token: string) {
    try {
      const { payload } = await jose.jwtVerify(token, JWT_SECRET);
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
