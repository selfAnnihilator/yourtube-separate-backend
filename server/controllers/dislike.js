import video from "../Modals/video.js";
import like from "../Modals/like.js";
import dislike from "../Modals/dislike.js";

export const handledislike = async (req, res) => {
  const { userId } = req.body;
  const { videoId } = req.params;

  try {
    const existingdislike = await dislike.findOne({
      viewer: userId,
      videoid: videoId,
    });

    if (existingdislike) {
      await dislike.findByIdAndDelete(existingdislike._id);
      const updatedVideo = await video.findByIdAndUpdate(
        videoId,
        { $inc: { Dislike: -1 } },
        { new: true }
      );

      return res.status(200).json({
        liked: false,
        disliked: false,
        likeCount: updatedVideo?.Like || 0,
        dislikeCount: updatedVideo?.Dislike || 0,
      });
    }

    const existinglike = await like.findOne({
      viewer: userId,
      videoid: videoId,
    });

    const countChanges = { Dislike: 1 };
    if (existinglike) {
      await like.findByIdAndDelete(existinglike._id);
      countChanges.Like = -1;
    }

    await dislike.create({ viewer: userId, videoid: videoId });
    const updatedVideo = await video.findByIdAndUpdate(
      videoId,
      { $inc: countChanges },
      { new: true }
    );

    return res.status(200).json({
      liked: false,
      disliked: true,
      likeCount: updatedVideo?.Like || 0,
      dislikeCount: updatedVideo?.Dislike || 0,
    });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
