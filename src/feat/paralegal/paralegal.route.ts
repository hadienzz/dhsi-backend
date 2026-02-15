import { Router } from "express";
import { paralegalController } from "./paralegal.controller";

const router = Router();

router.get("/get", paralegalController.getParalegalData);

export default router;
