import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class NotificationService {
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const sendgridApiKey = this.configService.get<string>('sendgrid.apiKey');
    this.fromEmail = this.configService.get<string>('sendgrid.fromEmail') || '';

    if (!sendgridApiKey) {
      throw new Error('SendGrid API key is required');
    }

    sgMail.setApiKey(sendgridApiKey);
  }
  public async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
    options?: {},
  ): Promise<{ success: boolean; message: string }> {
    const message = {
      to,
      from: this.fromEmail,
      subject,
      text,
      html,
      ...options,
    };

    try {
      await sgMail.send(message);
      return { success: true, message: 'Email sent successfully' };
    } catch (error: any) {
      console.error('Error sending email:', error);
      return { success: false, message: error };
    }
  }
}
