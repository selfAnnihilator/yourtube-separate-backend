import express from "express";
import { handledislike } from "../controllers/dislike.js";

const routes = express.Router();

routes.post("/:videoId", handledislike);

export default routes;
