import { UserRole } from 'src/modules/roles/interfaces/role.interface';

export interface Users {
  id: string;
  email: string;
  firstName: string;
  secondName: string;
  password?: string;
  roles: UserRole[];
  googleId?: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  events: Event[];
  //   payments: Payment[];
  //   eventAccesses: EventAccess[];
  //   reviews: Review[];
  //   organizerProfile?: OrganizerProfile;
  //   attendances: Attendee[];
}
