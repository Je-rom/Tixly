import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class TemplateService {
  private readonly templatesPath = join(__dirname, '../templates/email');

  async getEmailTemplate(
    templateName: string,
    data: Record<string, string>,
  ): Promise<string> {
    try {
      //Load template file
      const templatePath = join(this.templatesPath, `${templateName}.html`);
      let template = readFileSync(templatePath, 'utf-8');

      //Replace all placeholders with actual data
      Object.keys(data).forEach((key) => {
        const placeholder = `{{${key}}}`;
        template = template.replace(new RegExp(placeholder, 'g'), data[key]);
      });

      return template;
    } catch (error) {
      console.error(`Error loading template ${templateName}:`, error);
      throw new Error(`Failed to load email template: ${templateName}`);
    }
  }

  async getEmailVerificationTemplate(data: {
    firstName: string;
    verificationUrl: string;
    appName?: string;
    supportEmail?: string;
  }): Promise<string> {
    const templateData = {
      FIRST_NAME: data.firstName,
      VERIFICATION_URL: data.verificationUrl,
      APP_NAME: 'Crowdia',
      SUPPORT_EMAIL:
        data.supportEmail || process.env.SUPPORT_EMAIL || 'support@example.com',
    };

    return this.getEmailTemplate('email-verification', templateData);
  }

  async getPasswordResetTemplate(data: {
    firstName: string;
    resetUrl: string;
    appName?: string;
    supportEmail?: string;
  }): Promise<string> {
    const templateData = {
      FIRST_NAME: data.firstName,
      RESET_URL: data.resetUrl,
      APP_NAME: 'Crowdia',
      SUPPORT_EMAIL:
        data.supportEmail || process.env.SUPPORT_EMAIL || 'support@example.com',
    };

    return this.getEmailTemplate('password-reset', templateData);
  }

  async getWelcomeTemplate(data: {
    firstName: string;
    appName?: string;
  }): Promise<string> {
    const templateData = {
      FIRST_NAME: data.firstName,
      APP_NAME: 'Crowdia',
    };

    return this.getEmailTemplate('welcome', templateData);
  }
}
