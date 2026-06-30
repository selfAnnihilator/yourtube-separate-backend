# YourTube Project Context

## Summary

YourTube is a YouTube-style video sharing application. Users can sign in, create a channel, upload MP4 videos, watch uploaded videos, search videos, comment, like/dislike, save videos to Watch Later, and view watch history.

The app is split into:

- `yourtube/`: Next.js frontend deployed on Vercel.
- `server/`: Express backend deployed on Render.
- MongoDB Atlas: app data persistence.
- Firebase Auth: Google sign-in.
- Cloudinary: durable uploaded video asset storage and playback URLs.

## Core Features

### Authentication

- Google sign-in through Firebase.
- User profile is persisted in MongoDB through `POST /user/login`.
- Sign out clears local app state and signs out from Firebase.

### Channels

- Signed-in users can create/update their channel profile.
- Channel profile stores `channelname` and `description`.
- Current channel pages support the signed-in user's own uploads.
- Public channel pages are intentionally limited for now and show an honest fallback when unavailable.

### Video Uploads

- Uploads are MP4-only.
- Frontend limit: 100 MB.
- Backend uses `multer.memoryStorage()` and uploads the file buffer to Cloudinary.
- MongoDB stores Cloudinary metadata:
  - `filepath`: playback URL.
  - `cloudinaryPublicId`: Cloudinary asset id.
  - title, filename, filetype, filesize, channel name, uploader id, like/dislike counts, view count.

### Playback

- Watch page loads videos from `GET /video/getall` and selects the video by id.
- Playback uses `getMediaUrl(video.filepath)`.
- Cloudinary URLs are used directly.
- Old local upload paths such as `/uploads/...` are treated as stale and rendered as unavailable instead of making broken media requests.

### Search and Browse

- Home page shows uploaded videos.
- Search fetches `GET /video/getall` and filters client-side by title or channel name.
- Video cards use real uploaded video playback URLs when available.

### Reactions

- Like and dislike are persistent.
- Like/dislike are mutually exclusive.
- Endpoints:
  - `POST /like/:videoId`
  - `POST /dislike/:videoId`
  - `GET /video/reaction/:videoId/:userId`
- Video documents keep aggregate `Like` and `Dislike` counts.

### Comments

- Comments are stored per video.
- Signed-in users can add comments.
- Users can edit/delete their own comments.
- Endpoints:
  - `GET /comment/:videoid`
  - `POST /comment/postcomment`
  - `POST /comment/editcomment/:id`
  - `DELETE /comment/deletecomment/:id`

### Watch Later

- Signed-in users can toggle videos into Watch Later.
- Watch Later list can remove saved items.
- Endpoints:
  - `GET /watch/:userId`
  - `POST /watch/:videoId`
  - `DELETE /watch/:id`

### Watch History and Views

- Signed-in watches create history rows and increment video views.
- Signed-out watches increment video views only.
- Users can remove history entries.
- Endpoints:
  - `GET /history/:userId`
  - `POST /history/:videoId`
  - `POST /history/views/:videoId`
  - `DELETE /history/:id`

### Share and Download

- Share copies the current watch page URL to the clipboard.
- Download opens the current video's playback URL in a new tab.
- Download is disabled if a video has no usable playback URL.

## Backend Data Models

### `user`

- `email`
- `name`
- `image`
- `channelname`
- `description`

### `videofiles`

- `videotitle`
- `filename`
- `filetype`
- `filepath`
- `filesize`
- `cloudinaryPublicId`
- `videochanel`
- `uploader`
- `Like`
- `Dislike`
- `views`
- timestamps

### Relation Collections

- `like`: `viewer`, `videoid`
- `dislike`: `viewer`, `videoid`
- `watchlater`: `viewer`, `videoid`
- `history`: `viewer`, `videoid`
- `comment`: `videoid`, `userid`, `commentbody`, `usercommented`, `commentedon`

## Deployment

### Frontend

- Host: Vercel
- Production URL: `https://yourtube-teal.vercel.app`
- Root directory: `yourtube/`

Frontend production env vars:

```text
NEXT_PUBLIC_API_BASE_URL=https://yourtube-separate-backend.onrender.com
NEXT_PUBLIC_MEDIA_BASE_URL=https://yourtube-separate-backend.onrender.com
```

### Backend

- Host: Render
- Production URL: `https://yourtube-separate-backend.onrender.com`
- Root directory: `server/`
- Health check: `/health`

Backend production env vars:

```text
DB_URL=<mongodb atlas uri>
FRONTEND_URL=https://yourtube-teal.vercel.app
CLOUDINARY_CLOUD_NAME=<cloudinary cloud name>
CLOUDINARY_API_KEY=<cloudinary api key>
CLOUDINARY_API_SECRET=<cloudinary api secret>
```

## Important Constraints and Decisions

- Uploaded video assets must be durable and are stored in Cloudinary, not the Render filesystem.
- Old MongoDB video records that point to `/uploads/...` or Render filesystem paths are stale video records.
- Stale records cannot be repaired unless the original file still exists; they should be reuploaded or removed.
- The frontend intentionally avoids fake Subscribe and Play All behavior until those domain models exist.
- Search is currently simple client-side filtering over `GET /video/getall`.
- Public channel browsing is not fully implemented yet.

## Verification Commands

Frontend:

```bash
cd yourtube
npm run build
```

Backend syntax:

```bash
cd server
node --check index.js
node --check controllers/video.js
```

Production smoke checks:

```bash
curl https://yourtube-separate-backend.onrender.com/health
curl https://yourtube-separate-backend.onrender.com/video/getall
curl -I https://yourtube-teal.vercel.app
```
