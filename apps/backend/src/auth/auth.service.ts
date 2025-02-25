import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../common/mail/mail.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  private readonly jwtSecret = process.env.JWT_SECRET || 'default-secret-key';

  /**
   * Logs in a user with the given email and password and returns a token.
   *
   * @param email The email to log in with.
   * @param password The password to log in with.
   *
   * @throws {UnauthorizedException} If the email and password do not match.
   *
   * @returns An object with a user and a JWT token.
   */
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      user: user,
      token: jwt.sign({ id: user.id, role: user.role }, this.jwtSecret),
    };
  }

  /**
   * Registers a new user with the given email, password, and role.
   *
   * @param email - The email of the new user.
   * @param password - The password for the new user.
   * @param role - The role assigned to the new user.
   *
   * @returns The created user object.
   *
   * @throws {Error} If the user creation or sending welcome email fails.
   */
  async signup(email: string, password: string, role: UserRole) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email, password: hashedPassword, role },
    });
    await this.mailService.sendWelcomeEmail(user.email, user.email, password);
    return user;
  }

  /**
   * Sends a password reset email to the given email address.
   *
   * @param email - The email address to send the email to.
   *
   * @throws {NotFoundException} If the user does not exist.
   *
   * @returns Nothing, but triggers sending a password reset email.
   */
  async forgotPasswordMail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const resetToken = jwt.sign({ email }, this.jwtSecret, { expiresIn: '5m' });
    await this.mailService.sendResetPasswordMail(email, resetToken);
  }

  /**
   * Resets the password of the user with the email address stored in the given
   * reset token to the given new password.
   *
   * @param resetToken - The reset token to get the email address from.
   * @param newPassword - The new password to set.
   *
   * @throws {Error} If the reset token is invalid or has expired.
   *
   * @returns Nothing, but triggers updating the user's password.
   */
  async resetPassword(resetToken: string, newPassword: string) {
    let decoded;
    try {
      decoded = jwt.verify(resetToken, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { email: decoded.email },
      data: { password: hashedPassword },
    });
  }
}
