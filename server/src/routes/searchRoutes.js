import express from "express";
import { globalSearch } from "../controllers/searchController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, globalSearch);

export default router;
