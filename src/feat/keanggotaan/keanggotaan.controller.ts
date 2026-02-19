import { NextFunction, Request, Response } from "express";
import { APIResponse } from "../../utils/response.util";
import { keanggotaanService } from "./keanggotaan.service";
import { uploadToSupabase } from "../../utils/upload-to-supabase";

const getAll = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const data = await keanggotaanService.getAll();
    return res.status(200).json({
      status: "success",
      message: "Data keanggotaan berhasil diambil",
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
    const { nama_lengkap, role } = req.body;

    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;
    const fotoFile = files?.["foto"]?.[0];

    let upload_foto_formal = req.body.upload_foto_formal ?? "";

    if (fotoFile) {
      const { url } = await uploadToSupabase(fotoFile, "profile");
      upload_foto_formal = url;
    }

    if (!nama_lengkap || !role || !upload_foto_formal) {
      return res.status(400).json({
        status: "error",
        message: "nama_lengkap, role, dan foto wajib diisi",
      });
    }

    const data = await keanggotaanService.create({
      nama_lengkap,
      role,
      upload_foto_formal,
    });

    return res.status(201).json({
      status: "success",
      message: "Keanggotaan berhasil ditambahkan",
      data,
    });
  } catch (err) {
    next(err);
  }
};

const update = async (
  req: Request,
  res: Response<APIResponse>,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const { nama_lengkap, role } = req.body;

    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;
    const fotoFile = files?.["foto"]?.[0];

    const updateData: {
      nama_lengkap?: string;
      role?: string;
      upload_foto_formal?: string;
    } = {};

    if (nama_lengkap) updateData.nama_lengkap = nama_lengkap;
    if (role) updateData.role = role;

    if (fotoFile) {
      const { url } = await uploadToSupabase(fotoFile, "profile");
      updateData.upload_foto_formal = url;
    }

    const data = await keanggotaanService.update(id, updateData);

    return res.status(200).json({
      status: "success",
      message: "Keanggotaan berhasil diperbarui",
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
    await keanggotaanService.deleteById(id);
    return res.status(200).json({
      status: "success",
      message: "Keanggotaan berhasil dihapus",
    });
  } catch (err) {
    next(err);
  }
};

export const keanggotaanController = { getAll, create, update, deleteById };
