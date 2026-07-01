import express from "express";
import {
  deletecomment,
  editcomment,
  getallcomment,
  postcomment,
  translatecomment,
} from "../controllers/comment.js";


const routes = express.Router();
routes.get("/:videoid", getallcomment);
routes.post("/:id/translate", translatecomment);
routes.post("/postcomment", postcomment);
routes.delete("/deletecomment/:id", deletecomment);
routes.post("/editcomment/:id", editcomment);
export default routes;
