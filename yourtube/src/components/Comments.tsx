import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  originalText?: string;
  usercommented: string;
  authorAvatar?: string;
  commentedon: string;
  detectedLanguage?: string;
  languageDetectionConfidence?: "high" | "low";
  hasEnglishTranslation?: boolean;
}
const Comments = ({ videoId }: any) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [translatedComments, setTranslatedComments] = useState<Record<string, string>>({});
  const [translatingCommentId, setTranslatingCommentId] = useState<string | null>(null);
  const [translationErrors, setTranslationErrors] = useState<Record<string, string>>({});
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}`);
      setComments(res.data);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div>Loading history...</div>;
  }
  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post("/comment/postcomment", {
        videoid: videoId,
        userid: user._id,
        commentbody: newComment,
        usercommented: user.name,
        authorAvatar: user.image || "",
      });
      if (res.data.comment) {
        setComments([res.data.comment, ...comments]);
      }
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.originalText || comment.commentbody);
  };

  const handleUpdateComment = async () => {
    if (!editingCommentId || !editText.trim()) return;
    const commentId = editingCommentId;

    try {
      const res = await axiosInstance.post(
        `/comment/editcomment/${commentId}`,
        { commentbody: editText }
      );
      if (res.data) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === commentId
              ? { ...c, ...res.data, commentbody: res.data.commentbody || editText }
              : c
          )
        );
        setTranslatedComments((prev) => {
          const next = { ...prev };
          delete next[commentId];
          return next;
        });
        setTranslationErrors((prev) => {
          const next = { ...prev };
          delete next[commentId];
          return next;
        });
        setEditingCommentId(null);
        setEditText("");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/comment/deletecomment/${id}`);
      if (res.data.comment) {
        setComments((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const canTranslateComment = (comment: Comment) =>
    comment.detectedLanguage &&
    comment.detectedLanguage !== "en" &&
    comment.languageDetectionConfidence === "high";

  const getErrorMessage = (error: any) =>
    error?.response?.data?.message || "Could not translate this comment right now.";

  const handleTranslate = async (comment: Comment) => {
    if (translatedComments[comment._id]) {
      setTranslatedComments((prev) => {
        const next = { ...prev };
        delete next[comment._id];
        return next;
      });
      return;
    }

    setTranslatingCommentId(comment._id);
    setTranslationErrors((prev) => {
      const next = { ...prev };
      delete next[comment._id];
      return next;
    });

    try {
      const res = await axiosInstance.post(`/comment/${comment._id}/translate`);
      setTranslatedComments((prev) => ({
        ...prev,
        [comment._id]: res.data.englishTranslation,
      }));
      setComments((prev) =>
        prev.map((currentComment) =>
          currentComment._id === comment._id
            ? { ...currentComment, hasEnglishTranslation: true }
            : currentComment
        )
      );
    } catch (error) {
      setTranslationErrors((prev) => ({
        ...prev,
        [comment._id]: getErrorMessage(error),
      }));
    } finally {
      setTranslatingCommentId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{comments.length} Comments</h2>

      {user && (
        <div className="flex gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e: any) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none border-0 border-b-2 rounded-none focus-visible:ring-0"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => setNewComment("")}
                disabled={!newComment.trim()}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={comment.authorAvatar || ""} />
                <AvatarFallback>{comment.usercommented?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {comment.usercommented}
                  </span>
                  <span className="text-xs text-gray-600">
                    {formatDistanceToNow(new Date(comment.commentedon))} ago
                  </span>
                </div>

                {editingCommentId === comment._id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        onClick={handleUpdateComment}
                        disabled={!editText.trim()}
                      >
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap">
                      {translatedComments[comment._id] ||
                        comment.originalText ||
                        comment.commentbody}
                    </p>
                    {canTranslateComment(comment) && (
                      <div className="mt-2">
                        <button
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                          onClick={() => handleTranslate(comment)}
                          disabled={translatingCommentId === comment._id}
                        >
                          {translatedComments[comment._id]
                            ? "Show original"
                            : translatingCommentId === comment._id
                              ? "Translating..."
                              : "Translate to English"}
                        </button>
                      </div>
                    )}
                    {translationErrors[comment._id] && (
                      <p className="mt-1 text-sm text-red-600">
                        {translationErrors[comment._id]}
                      </p>
                    )}
                    {comment.userid === user?._id && (
                      <div className="flex gap-2 mt-2 text-sm text-gray-500">
                        <button onClick={() => handleEdit(comment)}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(comment._id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
