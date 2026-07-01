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

- [x] Replace or supplement `commentbody` with fields for:
  - [x] original text
  - [x] normalized text for safety checks
  - [x] detected language code
  - [x] language detection confidence or certainty marker
  - [x] optional cached English translation
  - [x] author display name snapshot
  - [x] author avatar snapshot
  - [x] posted time
  - [x] like count
  - [x] dislike count
  - [x] moderation state, default visible
  - [x] flagged-for-review marker

- [x] Keep compatibility with existing comments during migration by reading old `commentbody` as Original Comment Text until data is migrated.

## Phase 2: Backend moderation and validation

Create a comment safety module that runs before create/edit:

- [x] trim harmless leading/trailing whitespace
- [x] reject empty or whitespace-only text as validation error
- [x] reject over-length text as validation error
- [x] normalize text for checks
- [x] reject English abusive words from project-owned blocklist
- [x] reject Recent Duplicate Comment by same author on same video
- [x] reject Spam-Like Comment patterns
- [x] reject Punctuation-Flood Comment patterns

Return broad block reasons only:

- [x] abusive language
- [x] spam-like comment
- [x] repeated punctuation

- [x] Do not reveal exact words or thresholds.

## Phase 3: Language detection and English translation

Add language detection on create/edit:

- [x] store ISO language code for every comment, including `en`
- [x] hide translation option for English comments
- [x] hide translation option when language detection is uncertain
- [x] clear cached English translation when Original Comment Text changes

Add translation endpoint:

- [x] `POST /comment/:id/translate`
- [x] allowed for signed-in and signed-out viewers
- [x] only works for non-English comments
- [x] creates cached English translation on first request
- [x] returns cached translation afterward
- [x] on failure, preserve original text and return an error

- [x] Provider choice is intentionally not locked in yet. Implemented behind environment variables with DeepL support and LibreTranslate compatibility.

## Phase 4: Comment reaction model

Add a comment reaction collection:

- [ ] `viewer`
- [ ] `commentid`
- [ ] reaction type: like or dislike
- [ ] timestamps

Add endpoints:

- [ ] `POST /comment/:id/reaction`
- [ ] toggles selected reaction off if clicked again
- [ ] switches like to dislike or dislike to like
- [ ] rejects author reacting to own comment

- [x] Keep aggregate like/dislike counts on the comment for fast reads.

## Phase 5: Comment report model

Add a comment report collection:

- [ ] `viewer`
- [ ] `commentid`
- [ ] reason
- [ ] timestamps

Report reasons:

- [ ] abusive language
- [ ] spam
- [ ] harassment
- [ ] misleading content
- [ ] other

Add endpoint:

- [ ] `POST /comment/:id/report`
- [ ] requires sign-in
- [ ] rejects author reporting own comment
- [ ] enforces one report per user per comment
- [ ] sets comment moderation state to Flagged for Review
- [ ] does not hide or delete the comment

- [x] Do not expose report counts in public APIs.

## Phase 6: Batched comment read API

Replace or extend `GET /comment/:videoid` so it returns comments for a video with:

- [x] comment id
- [x] Original Comment Text
- [x] author display snapshot
- [x] posted relative timestamp source
- [x] detected language flag sufficient to decide Translate visibility
- [x] like/dislike counts
- [ ] `currentUserReaction`
- [ ] `reportedByCurrentUser`

- [ ] Accept optional user context for signed-in viewers.
- [x] Avoid one request per comment.

- [x] Sort comments newest first.

## Phase 7: Frontend comment UI

Update `yourtube/src/components/Comments.tsx`:

- [x] render username, avatar/fallback initial, and posted time
- [x] preserve line breaks in plain text
- [x] show Translate to English only for non-English comments
- [x] replace visible text with translation after click
- [x] change button to Show original while translated
- [x] do not show report/reaction controls for signed-out viewers, except public counts
- [x] hide reaction/report controls on the author's own comments
- [x] show Edit/Delete for own comments
- [ ] show Reported after current user reports a comment
- [ ] show broad block/validation errors when create/edit fails

- [x] Keep comments plain text. Do not add Markdown or HTML rendering.

## Phase 8: Delete/edit behavior

On edit:

- [x] run the same validation and safety checks as create
- [x] if rejected, keep existing comment unchanged
- [x] update Original Comment Text
- [x] recalculate Detected Comment Language
- [x] clear cached English translation
- [x] preserve reactions and reports
- [x] preserve Flagged for Review state

On delete:

- [x] hard-delete the comment
- [ ] delete related comment reactions
- [ ] delete related comment reports

## Phase 9: Verification

Backend:

- [x] `node --check` for changed backend files
- [ ] create comment accepts normal English text
- [ ] create comment accepts non-English text and stores detected language
- [ ] create comment blocks abusive English blocklist terms
- [ ] create comment blocks duplicate same-author same-video recent text
- [ ] create comment blocks punctuation flood
- [ ] create comment allows emoji-heavy comments and emoticons
- [ ] edit applies safety checks and preserves old text on failure
- [ ] report sets Flagged for Review without hiding comment
- [ ] dislike does not flag or hide comment
- [ ] own comment reaction/report is rejected
- [ ] duplicate report is rejected
- [ ] delete removes reactions and reports

Frontend:

- [x] `npm run build`
- [ ] signed-out viewer can read and translate non-English comments
- [x] signed-out viewer cannot react/report/post
- [ ] signed-in viewer can post, edit, delete own comment
- [ ] signed-in viewer can like/dislike/report other comments
- [ ] reaction toggle updates counts
- [ ] report button changes to Reported
- [x] English comments show no translation option
- [x] translation failure leaves original text visible

Production smoke:

- [ ] `/health`
- [ ] `/video/getall`
- [ ] watch page with comments
- [ ] comment translation endpoint
- [ ] comment reaction endpoint
- [ ] comment report endpoint

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
