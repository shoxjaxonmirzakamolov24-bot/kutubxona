import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import booksRouter from "./books";
import highlightsRouter from "./highlights";
import notesRouter from "./notes";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(booksRouter);
router.use(highlightsRouter);
router.use(notesRouter);
router.use(aiRouter);

export default router;
