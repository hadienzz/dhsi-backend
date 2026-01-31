import { NextFunction, Request, Response } from "express";
import type { APIResponse } from "../utils/response.util";

export class APIError extends Error {
  statusCode: number | undefined;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

export const errorHandler = (
  err: APIError,
  req: Request,
  res: Response<APIResponse>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // eslint-disable-next-line no-console
  console.error('[errorHandler]', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
};