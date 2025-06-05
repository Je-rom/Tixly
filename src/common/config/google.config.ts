import { registerAs } from '@nestjs/config';

export default registerAs('google', () => {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    sessionSecret: process.env.SESSION_SECRET,
    callBackURL: process.env.GOOGLE_CALLBACK_URI,
  };
});
