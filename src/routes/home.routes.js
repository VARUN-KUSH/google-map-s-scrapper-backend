import { Router } from "express";
import {mapScrapper} from "../controllers/home.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/datascrape").post(mapScrapper)

export default router;