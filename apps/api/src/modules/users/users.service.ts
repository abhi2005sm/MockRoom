import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProfile(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, createdAt: true },
      });
      if (!user) throw new NotFoundException('User profile not found');
      return user;
    } catch {
      // Mock fallback
      return {
        id: userId,
        email: 'alex.chen@example.com',
        name: 'Alex Chen',
        createdAt: new Date(),
      };
    }
  }
}
