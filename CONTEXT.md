# YourTube

YourTube is a video sharing application where users upload videos and watch videos uploaded by others.

## Language

**Uploaded Video Asset**:
A durable video file made available for playback after a user upload.
_Avoid_: Local file, server upload, disk file

**Playback URL**:
A stable URL that a viewer's browser can use to stream an Uploaded Video Asset.
_Avoid_: File path, upload path

**Stale Video Record**:
A video record whose Uploaded Video Asset is no longer available for playback.
_Avoid_: Broken upload, missing file

**Comment**:
A user-authored message attached directly to a video, not to another comment.
_Avoid_: Message, reply, review

**Original Comment Text**:
The comment text exactly as submitted by the comment author.
_Avoid_: Source text, raw text

**Comment Length Limit**:
The maximum allowed size of the Original Comment Text.
_Avoid_: Textarea size, UI limit

**Comment Author Details**:
The public identity details captured for a Comment when it is posted: username, avatar or fallback initial, and posted time.
_Avoid_: Email, user id, exact location

**English Comment Translation**:
A viewer-facing English translation of a non-English Comment derived from the Original Comment Text, created when first requested and reusable afterward. It can be displayed in place of the Original Comment Text without replacing it.
_Avoid_: Preferred-language translation, localized comment

**Detected Comment Language**:
The language the system identifies for the Original Comment Text.
_Avoid_: User language, preferred language

**Comment Location**:
An optional place label a user may choose to show with a Comment; it is never inferred or shown by default.
_Avoid_: City, exact location, detected location

**Blocked Comment**:
A submitted Comment that is rejected before posting because it violates automatic safety checks.
_Avoid_: Deleted comment, hidden comment

**Comment Block Reason**:
A broad safety category explaining why a submitted Comment was blocked.
_Avoid_: Exact blocked word, rule threshold

**Comment Safety Check**:
An automatic check applied before posting or editing a Comment to decide whether it should be blocked.
_Avoid_: Moderation review, report check

**Abusive Word Blocklist**:
A project-owned list of abusive words or phrases used by automatic comment safety checks.
_Avoid_: External moderation decision, banned words

**Spam-Like Comment**:
A submitted Comment that appears to be duplicate, promotional, or low-signal noise rather than a genuine response to a video.
_Avoid_: Bot comment, bad comment

**Recent Duplicate Comment**:
A submitted Comment whose normalized text matches a recent Comment by the same author on the same video.
_Avoid_: Spam count, repeated post

**Punctuation-Flood Comment**:
A submitted Comment dominated by repeated punctuation marks with little or no meaningful text.
_Avoid_: Emoji reaction, emoticon, special-character comment

**Comment Reaction**:
A viewer's like or dislike on a Comment, used as engagement feedback rather than moderation.
_Avoid_: Report, moderation vote

**Reported Comment**:
A posted Comment that a user has flagged for review.
_Avoid_: Auto-deleted comment, disliked comment

**Comment Report Reason**:
A broad user-selected category explaining why a Comment was reported.
_Avoid_: Dislike reason, deletion reason

**Flagged for Review**:
A moderation state where a Reported Comment remains visible but is queued for human or later administrative review.
_Avoid_: Hidden, deleted, removed

**Comment Moderation State**:
The review-related state of a posted Comment, such as visible or Flagged for Review.
_Avoid_: Reaction state, report count
