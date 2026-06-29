import video from "../Modals/video.js";
import like from "../Modals/like.js";
import dislike from "../Modals/dislike.js";

export const handlelike = async (req, res) => {
  const { userId } = req.body;
  const { videoId } = req.params;
  try {
    const exisitinglike = await like.findOne({
      viewer: userId,
      videoid: videoId,
    });
    if (exisitinglike) {
      await like.findByIdAndDelete(exisitinglike._id);
      const updatedVideo = await video.findByIdAndUpdate(
        videoId,
        { $inc: { Like: -1 } },
        { new: true }
      );
      return res.status(200).json({
        liked: false,
        disliked: false,
        likeCount: updatedVideo?.Like || 0,
        dislikeCount: updatedVideo?.Dislike || 0,
      });
    } else {
      const existingdislike = await dislike.findOne({
        viewer: userId,
        videoid: videoId,
      });
      const countChanges = { Like: 1 };
      if (existingdislike) {
        await dislike.findByIdAndDelete(existingdislike._id);
        countChanges.Dislike = -1;
      }

      await like.create({ viewer: userId, videoid: videoId });
      const updatedVideo = await video.findByIdAndUpdate(
        videoId,
        { $inc: countChanges },
        { new: true }
      );
      return res.status(200).json({
        liked: true,
        disliked: false,
        likeCount: updatedVideo?.Like || 0,
        dislikeCount: updatedVideo?.Dislike || 0,
      });
    }
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getallLikedVideo = async (req, res) => {
  const { userId } = req.params;
  try {
    const likevideo = await like
      .find({ viewer: userId })
      .populate({
        path: "videoid",
        model: "videofiles",
      })
      .exec();
    return res.status(200).json(likevideo);
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deletelike = async (req, res) => {
  const { id } = req.params;
  try {
    const existinglike = await like.findByIdAndDelete(id);
    if (existinglike) {
      await video.findByIdAndUpdate(existinglike.videoid, { $inc: { Like: -1 } });
    }
    return res.status(200).json({ liked: false });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
