import { Request } from 'express';

export type Role = 'admin' | 'cashier' | 'doctor';

export interface JwtPayload {
  userId: number;
  role: Role;
  doctorId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
