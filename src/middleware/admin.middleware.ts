
import { Response, NextFunction, Request } from "express";
import { APIError } from "./error.middleware";

export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role === "admin") {
    return next();
  }

  throw new APIError("Forbidden: Admins only", 403);
};