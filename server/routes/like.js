import express from "express";
import { deletelike, handlelike, getallLikedVideo } from "../controllers/like.js";

const routes = express.Router();
routes.get("/:userId", getallLikedVideo);
routes.delete("/:id", deletelike);
routes.post("/:videoId", handlelike);
export default routes;
