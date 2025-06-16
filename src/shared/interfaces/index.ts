import { UserRole, SignupMode, OrganizerProfile } from '@prisma/client';

export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    secondName: string;
    userRole: UserRole | null;
    googleId: string | null;
    passwordChangedAt: Date | null;
    organizerProfile: OrganizerProfile | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    signUpMode: SignupMode | null;
  };
}
