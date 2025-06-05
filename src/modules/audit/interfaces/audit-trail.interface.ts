import { Users } from 'src/modules/auth/interfaces/user-login.interface';

export enum AuditType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}
export interface AuditTrail {
  id?: string;
  userId: string;
  user?: Users;
  description: string;
  resource?: string;
  resourceId?: string;
  type: AuditType;
  createdAt?: Date;
  updatedAt?: Date;
}
