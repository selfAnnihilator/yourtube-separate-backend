import express from "express";
import {
  deletewatchlater,
  getallwatchlater,
  handlewatchlater,
} from "../controllers/watchlater.js";

const routes = express.Router();
routes.get("/:userId", getallwatchlater);
routes.delete("/:id", deletewatchlater);
routes.post("/:videoId", handlewatchlater);
export default routes;
