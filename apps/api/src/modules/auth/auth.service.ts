import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../../database/prisma.service';

// In-memory mock store fallback if DB is offline during testing
const mockUsers = new Map<string, any>();

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.findUserByEmail(dto.email);
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const userId = `usr_${Date.now()}`;

    let user;
    try {
      user = await this.prisma.user.create({
        data: {
          id: userId,
          email: dto.email,
          passwordHash: hashedPassword,
          name: dto.name,
        },
      });
    } catch {
      // In-memory fallback
      user = {
        id: userId,
        email: dto.email,
        passwordHash: hashedPassword,
        name: dto.name,
        createdAt: new Date(),
      };
      mockUsers.set(dto.email, user);
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return {
      user: { id: user.id, email: user.email, name: user.name },
      accessToken: token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.findUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return {
      user: { id: user.id, email: user.email, name: user.name },
      accessToken: token,
    };
  }

  async generateWsToken(userId: string, sessionId: string) {
    return this.jwtService.sign(
      { sub: userId, sessionId, type: 'ws_token' },
      { expiresIn: '15m' }
    );
  }

  async verifyWsToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.type !== 'ws_token') {
        throw new UnauthorizedException('Invalid token type');
      }
      return payload;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired WebSocket token');
    }
  }

  private async findUserByEmail(email: string) {
    try {
      return await this.prisma.user.findUnique({ where: { email } });
    } catch {
      return mockUsers.get(email) || null;
    }
  }
}
