import { Router } from "express";
import { packetController } from "./packet.controller";

const router = Router();

router.get("/get", packetController.getPackets);

export default router;
