import { NextFunction, Request, Response } from "express";
import { APIResponse, calculatePagination, sendPaginatedSuccess } from "../../utils/response.util";
import { pesertaPelatihanService } from "./peserta-pelatihan.service";

const getAll = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);

    if (page && limit) {
      const { data, total } = await pesertaPelatihanService.getAllPaginated(page, limit);
      const meta = calculatePagination(page, limit, total);
      return sendPaginatedSuccess(res, data, meta, "Data peserta pelatihan berhasil diambil");
    }

    const data = await pesertaPelatihanService.getAll();
    return res.status(200).json({
      status: "success",
      message: "Data peserta pelatihan berhasil diambil",
      data,
    });
  } catch (err) {
    next(err);
  }
};

const create = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const { nama_lengkap, email, nama_pelatihan } = req.body;

    if (!nama_lengkap || !email || !nama_pelatihan) {
      return res.status(400).json({
        status: "error",
        message: "nama_lengkap, email, dan nama_pelatihan wajib diisi",
      });
    }

    const data = await pesertaPelatihanService.create({
      nama_lengkap,
      email,
      nama_pelatihan,
    });

    return res.status(201).json({
      status: "success",
      message: "Peserta pelatihan berhasil ditambahkan",
      data,
    });
  } catch (err) {
    next(err);
  }
};

const deleteById = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    await pesertaPelatihanService.deleteById(id);
    return res.status(200).json({
      status: "success",
      message: "Peserta pelatihan berhasil dihapus",
    });
  } catch (err) {
    next(err);
  }
};

export const pesertaPelatihanController = { getAll, create, deleteById };
