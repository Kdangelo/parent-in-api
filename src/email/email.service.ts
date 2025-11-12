import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger('EmailService');
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Explicit SMTP configuration for Gmail (host/port/secure is more reliable than 'service' shortcut)
    const transportOptions: any = {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    };

    this.transporter = nodemailer.createTransport(transportOptions as nodemailer.TransportOptions);

    // Verify transporter connection (non-blocking)
    this.transporter.verify((err, success) => {
      if (err) {
        this.logger.error('Error verifying email transporter', err);
      } else {
        this.logger.log('Email transporter ready');
      }
    });
  }

  async sendVerificationCode(to: string, code: string) {
    const fromName = this.configService.get<string>('EMAIL_FROM_NAME') || 'No-Reply';
    const fromAddress = this.configService.get<string>('EMAIL_FROM_ADDRESS') || this.configService.get<string>('EMAIL_USER');

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject: 'Código de verificación',
      html: `<p>Tu código de verificación es: <strong>${code}</strong></p><p>Este código expirará en 15 minutos.</p>`,
      text: `Tu código de verificación es: ${code} (expira en 15 minutos)`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error('Error sending verification email', error);
      throw error;
    }
  }
}
