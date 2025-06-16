import { registerAs } from '@nestjs/config';

export default registerAs('sendgrid', () => ({
  apiKey: process.env.SENDGRID_API_KEY,
  fromEmail: process.env.DEFAULT_FROM_EMAIL,
}));
