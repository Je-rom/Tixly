import { Users } from 'src/modules/auth/interfaces/user-login.interface';

export enum Role {
  ATTENDEE = 'ATTENDEE',
  ORGANIZER = 'ORGANIZER',
  PODCASTER = 'PODCASTER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export interface UserRole {
  id: string;
  user: Users;
  userId: string;
  role: Role;
}
