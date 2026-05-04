import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, Role } from '../types';

export const roleGuard = (...roles: Role[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Ruxsat yo\'q' });
      return;
    }
    next();
  };
