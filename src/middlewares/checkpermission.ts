import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../Errors";

// Middleware للتحقق من صلاحيات الدخول في SubAdmin
export const checkOnlyAdmin = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        throw new UnauthorizedError("Authentication required");
      }

      return next();
    } catch (error) {
      next(error);
    }
  };
};

export const checkPermission = checkOnlyAdmin;