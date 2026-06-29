import video from "../Modals/video.js";
import like from "../Modals/like.js";
import dislike from "../Modals/dislike.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadVideoToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: "yourtube/videos",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });
}

export const uploadvideo = async (req, res) => {
  if (req.file === undefined) {
    return res
      .status(404)
      .json({ message: "plz upload a mp4 video file only" });
  } else {
    try {
      const cloudinaryVideo = await uploadVideoToCloudinary(req.file);
      const file = new video({
        videotitle: req.body.videotitle,
        filename: req.file.originalname,
        filepath: cloudinaryVideo.secure_url,
        filetype: req.file.mimetype,
        filesize: req.file.size,
        cloudinaryPublicId: cloudinaryVideo.public_id,
        videochanel: req.body.videochanel,
        uploader: req.body.uploader,
      });
      await file.save();
      return res.status(201).json("file uploaded successfully");
    } catch (error) {
      console.error(" error:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }
};
export const getallvideo = async (req, res) => {
  try {
    const files = await video.find();
    return res.status(200).send(files);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getreaction = async (req, res) => {
  const { videoId, userId } = req.params;

  try {
    const [existinglike, existingdislike] = await Promise.all([
      like.findOne({ viewer: userId, videoid: videoId }),
      dislike.findOne({ viewer: userId, videoid: videoId }),
    ]);

    return res.status(200).json({
      liked: Boolean(existinglike),
      disliked: Boolean(existingdislike),
    });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
