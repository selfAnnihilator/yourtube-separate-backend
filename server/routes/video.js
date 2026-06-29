import express from "express";
import { getallvideo, getreaction, uploadvideo } from "../controllers/video.js";
import upload from "../filehelper/filehelper.js";

const routes = express.Router();

routes.post("/upload", upload.single("file"), uploadvideo);
routes.get("/reaction/:videoId/:userId", getreaction);
routes.get("/getall", getallvideo);
export default routes;
