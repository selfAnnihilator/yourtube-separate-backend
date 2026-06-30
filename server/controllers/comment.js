import comment from "../Modals/comment.js";
import mongoose from "mongoose";
import {
  RECENT_DUPLICATE_WINDOW_MS,
  checkCommentSafety,
  detectCommentLanguage,
  validateCommentText,
} from "../utils/commentSafety.js";

function serializeComment(commentDoc) {
  const value = commentDoc.toObject ? commentDoc.toObject() : commentDoc;
  const originalText = value.originalText || value.commentbody || "";
  const authorName = value.authorName || value.usercommented || "";
  const postedAt = value.commentedon || value.createdAt;

  return {
    ...value,
    commentbody: originalText,
    originalText,
    usercommented: authorName,
    authorName,
    commentedon: postedAt,
    Like: value.Like || 0,
    Dislike: value.Dislike || 0,
    moderationState: value.moderationState || "visible",
    flaggedForReview: Boolean(value.flaggedForReview),
  };
}

async function hasRecentDuplicate({ userId, videoId, normalizedText, excludeId }) {
  const createdAfter = new Date(Date.now() - RECENT_DUPLICATE_WINDOW_MS);
  const query = {
    userid: userId,
    videoid: videoId,
    normalizedText,
    createdAt: { $gte: createdAfter },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return Boolean(await comment.exists(query));
}

async function buildCommentTextFields(rawText, { userId, videoId, excludeId }) {
  const validation = validateCommentText(rawText);
  if (!validation.ok) {
    return validation;
  }

  const detectedLanguage = detectCommentLanguage(validation.originalText);
  const safety = checkCommentSafety({
    originalText: validation.originalText,
    normalizedText: validation.normalizedText,
    detectedLanguage: detectedLanguage.language,
  });
  if (!safety.ok) {
    return safety;
  }

  if (
    await hasRecentDuplicate({
      userId,
      videoId,
      normalizedText: validation.normalizedText,
      excludeId,
    })
  ) {
    return {
      ok: false,
      status: 400,
      body: {
        code: "COMMENT_BLOCKED",
        reason: "spam_like",
        message: "Comment was blocked as spam-like.",
      },
    };
  }

  return {
    ok: true,
    originalText: validation.originalText,
    normalizedText: validation.normalizedText,
    detectedLanguage: detectedLanguage.language,
    languageDetectionConfidence: detectedLanguage.confidence,
  };
}

export const postcomment = async (req, res) => {
  const commentdata = req.body;

  try {
    const textFields = await buildCommentTextFields(commentdata.commentbody, {
      userId: commentdata.userid,
      videoId: commentdata.videoid,
    });
    if (!textFields.ok) {
      return res.status(textFields.status).json(textFields.body);
    }

    const commentToPost = new comment({
      userid: commentdata.userid,
      videoid: commentdata.videoid,
      commentbody: textFields.originalText,
      originalText: textFields.originalText,
      normalizedText: textFields.normalizedText,
      detectedLanguage: textFields.detectedLanguage,
      languageDetectionConfidence: textFields.languageDetectionConfidence,
      usercommented: commentdata.usercommented,
      authorName: commentdata.usercommented,
      authorAvatar: commentdata.authorAvatar || commentdata.userimage || "",
      commentedon: new Date(),
    });
    const savedComment = await commentToPost.save();
    return res.status(200).json({ comment: serializeComment(savedComment) });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const getallcomment = async (req, res) => {
  const { videoid } = req.params;
  try {
    const commentvideo = await comment
      .find({ videoid: videoid })
      .sort({ commentedon: -1, createdAt: -1 });
    return res.status(200).json(commentvideo.map(serializeComment));
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const deletecomment = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    await comment.findByIdAndDelete(_id);
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const editcomment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentbody } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }
  try {
    const existingComment = await comment.findById(_id);
    if (!existingComment) {
      return res.status(404).send("comment unavailable");
    }

    const textFields = await buildCommentTextFields(commentbody, {
      userId: existingComment.userid,
      videoId: existingComment.videoid,
      excludeId: _id,
    });
    if (!textFields.ok) {
      return res.status(textFields.status).json(textFields.body);
    }

    const updatecomment = await comment.findByIdAndUpdate(
      _id,
      {
        $set: {
          commentbody: textFields.originalText,
          originalText: textFields.originalText,
          normalizedText: textFields.normalizedText,
          detectedLanguage: textFields.detectedLanguage,
          languageDetectionConfidence: textFields.languageDetectionConfidence,
        },
        $unset: {
          englishTranslation: "",
          translatedAt: "",
        },
      },
      { new: true }
    );
    return res.status(200).json(serializeComment(updatecomment));
  } catch (error) {
    console.error(" error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
