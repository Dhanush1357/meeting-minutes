import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private mailService: MailService) {}

  private readonly jwtSecret = process.env.JWT_SECRET || 'default-secret-key';

  async signup(email: string, password: string, role: UserRole) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { email, password: hashedPassword, role },
    });
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { token: jwt.sign({ userId: user.id },this.jwtSecret, { expiresIn: '1h' }) };
  }

  async forgotPasswordMail(email: string) {
    // const user = await this.prisma.user.findUnique({ where: { email } });
    // if (!user) throw new Error('User not found');

    const resetToken = jwt.sign({ email },this.jwtSecret, { expiresIn: '1h' });
    await this.mailService.sendResetPasswordMail(email, resetToken);
  }

  async resetPassword(resetToken: string, newPassword: string) {
    let decoded;
    try {
      decoded = jwt.verify(resetToken,this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { email: decoded.email }, data: { password: hashedPassword } });
  }
}
