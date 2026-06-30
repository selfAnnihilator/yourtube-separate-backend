# Comment moderation and translation implementation plan

## Goal

Improve comments so users can post in any language, translate non-English comments to English on demand, see basic author details, and use safe community features: safety checks, comment reactions, and reports flagged for review.

## Decisions already made

- Comments remain flat and attach directly to videos.
- Original Comment Text is the source of truth.
- Non-English comments can be translated to English only.
- English comments show no translation option.
- Translation is generated on first request and can be cached.
- Translation display replaces the visible text temporarily, with a Show original toggle.
- Translation is available to signed-out viewers.
- Comment Location is out of scope for this pass.
- Comment Author Details are a posting-time snapshot: username, avatar/fallback initial, and posted time.
- Safety checks run on the backend for create and edit.
- Blocked comment attempts are not stored.
- Reported comments remain visible and are Flagged for Review.
- Reports do not auto-hide or auto-delete comments.
- Comment likes/dislikes are engagement only, not moderation.
- Comment reactions are mutually exclusive and removable.
- One report per user per comment.
- Public APIs do not expose report counts or moderation state.
- Public APIs may expose `reportedByCurrentUser`.
- Comment author cannot react to or report their own comment.
- Comment authors can edit/delete reported comments.
- Hard-delete comments for v1, and remove related reactions/reports on delete.

## Phase 1: Backend comment schema

Update `server/Modals/comment.js`:

- Replace or supplement `commentbody` with fields for:
  - original text
  - normalized text for safety checks
  - detected language code
  - language detection confidence or certainty marker
  - optional cached English translation
  - author display name snapshot
  - author avatar snapshot
  - posted time
  - like count
  - dislike count
  - moderation state, default visible
  - flagged-for-review marker

Keep compatibility with existing comments during migration by reading old `commentbody` as Original Comment Text until data is migrated.

## Phase 2: Backend moderation and validation

Create a comment safety module that runs before create/edit:

- trim harmless leading/trailing whitespace
- reject empty or whitespace-only text as validation error
- reject over-length text as validation error
- normalize text for checks
- reject English abusive words from project-owned blocklist
- reject Recent Duplicate Comment by same author on same video
- reject Spam-Like Comment patterns
- reject Punctuation-Flood Comment patterns

Return broad block reasons only:

- abusive language
- spam-like comment
- repeated punctuation

Do not reveal exact words or thresholds.

## Phase 3: Language detection and English translation

Add language detection on create/edit:

- store ISO language code for every comment, including `en`
- hide translation option for English comments
- hide translation option when language detection is uncertain
- clear cached English translation when Original Comment Text changes

Add translation endpoint:

- `POST /comment/:id/translate`
- allowed for signed-in and signed-out viewers
- only works for non-English comments
- creates cached English translation on first request
- returns cached translation afterward
- on failure, preserve original text and return an error

Provider choice is intentionally not locked in yet.

## Phase 4: Comment reaction model

Add a comment reaction collection:

- `viewer`
- `commentid`
- reaction type: like or dislike
- timestamps

Add endpoints:

- `POST /comment/:id/reaction`
- toggles selected reaction off if clicked again
- switches like to dislike or dislike to like
- rejects author reacting to own comment

Keep aggregate like/dislike counts on the comment for fast reads.

## Phase 5: Comment report model

Add a comment report collection:

- `viewer`
- `commentid`
- reason
- timestamps

Report reasons:

- abusive language
- spam
- harassment
- misleading content
- other

Add endpoint:

- `POST /comment/:id/report`
- requires sign-in
- rejects author reporting own comment
- enforces one report per user per comment
- sets comment moderation state to Flagged for Review
- does not hide or delete the comment

Do not expose report counts in public APIs.

## Phase 6: Batched comment read API

Replace or extend `GET /comment/:videoid` so it returns comments for a video with:

- comment id
- Original Comment Text
- author display snapshot
- posted relative timestamp source
- detected language flag sufficient to decide Translate visibility
- like/dislike counts
- `currentUserReaction`
- `reportedByCurrentUser`

Accept optional user context for signed-in viewers. Avoid one request per comment.

Sort comments newest first.

## Phase 7: Frontend comment UI

Update `yourtube/src/components/Comments.tsx`:

- render username, avatar/fallback initial, and posted time
- preserve line breaks in plain text
- show Translate to English only for non-English comments
- replace visible text with translation after click
- change button to Show original while translated
- do not show report/reaction controls for signed-out viewers, except public counts
- hide reaction/report controls on the author's own comments
- show Edit/Delete for own comments
- show Reported after current user reports a comment
- show broad block/validation errors when create/edit fails

Keep comments plain text. Do not add Markdown or HTML rendering.

## Phase 8: Delete/edit behavior

On edit:

- run the same validation and safety checks as create
- if rejected, keep existing comment unchanged
- update Original Comment Text
- recalculate Detected Comment Language
- clear cached English translation
- preserve reactions and reports
- preserve Flagged for Review state

On delete:

- hard-delete the comment
- delete related comment reactions
- delete related comment reports

## Phase 9: Verification

Backend:

- `node --check` for changed backend files
- create comment accepts normal English text
- create comment accepts non-English text and stores detected language
- create comment blocks abusive English blocklist terms
- create comment blocks duplicate same-author same-video recent text
- create comment blocks punctuation flood
- create comment allows emoji-heavy comments and emoticons
- edit applies safety checks and preserves old text on failure
- report sets Flagged for Review without hiding comment
- dislike does not flag or hide comment
- own comment reaction/report is rejected
- duplicate report is rejected
- delete removes reactions and reports

Frontend:

- `npm run build`
- signed-out viewer can read and translate non-English comments
- signed-out viewer cannot react/report/post
- signed-in viewer can post, edit, delete own comment
- signed-in viewer can like/dislike/report other comments
- reaction toggle updates counts
- report button changes to Reported
- English comments show no translation option
- translation failure leaves original text visible

Production smoke:

- `/health`
- `/video/getall`
- watch page with comments
- comment translation endpoint
- comment reaction endpoint
- comment report endpoint

## Out of scope

- comment replies or threads
- public location display
- admin/reviewer UI
- automatic hiding by report count
- automatic deletion by dislike count
- free-text report notes
- notifications
- Markdown or rich text comments
- user deletion cascade rules
- manual language correction
