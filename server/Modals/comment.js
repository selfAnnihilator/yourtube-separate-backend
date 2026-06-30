import mongoose from "mongoose";
const commentschema = mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    videoid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofiles",
      required: true,
    },
    commentbody: { type: String },
    originalText: { type: String },
    normalizedText: { type: String },
    detectedLanguage: { type: String, default: "en" },
    languageDetectionConfidence: {
      type: String,
      enum: ["high", "low"],
      default: "high",
    },
    englishTranslation: { type: String },
    translatedAt: { type: Date },
    authorName: { type: String },
    authorAvatar: { type: String },
    usercommented: { type: String },
    commentedon: { type: Date, default: Date.now },
    Like: { type: Number, default: 0 },
    Dislike: { type: Number, default: 0 },
    moderationState: {
      type: String,
      enum: ["visible", "flagged_for_review"],
      default: "visible",
    },
    flaggedForReview: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("comment", commentschema);
