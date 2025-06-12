import { Role } from '@prisma/client';

export class LoginResponseDto {
  token: string;
  user: {
    id: string;
    firstName: string;
    secondName: string;
    email: string;
    role: Role | null;
  };
}
