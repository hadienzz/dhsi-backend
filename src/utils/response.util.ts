import { Response } from "express";

export interface APIResponse<T = unknown> {
  status: "success" | "error";
  message: string;
  data?: T;
  errors?: unknown;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response<APIResponse<T>>,
  data: T,
  message = "Success",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

/**
 * Send success response with pagination
 */
export const sendPaginatedSuccess = <T>(
  res: Response<APIResponse<T[]>>,
  data: T[],
  meta: PaginationMeta,
  message = "Success",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
    meta,
  });
};

/**
 * Send created response (201)
 */
export const sendCreated = <T>(
  res: Response<APIResponse<T>>,
  data: T,
  message = "Data berhasil dibuat"
) => {
  return sendSuccess(res, data, message, 201);
};

/**
 * Send no content response (204)
 */
export const sendNoContent = (res: Response) => {
  return res.status(204).send();
};

/**
 * Send error response
 */
export const sendError = (
  res: Response<APIResponse>,
  message: string,
  statusCode = 400,
  errors?: unknown
) => {
  return res.status(statusCode).json({
    status: "error",
    message,
    errors,
  });
};

/**
 * Calculate pagination meta
 */
export const calculatePagination = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};
