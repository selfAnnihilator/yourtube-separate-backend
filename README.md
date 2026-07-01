# YourTube

YourTube is a video sharing app with a Next.js frontend, an Express API, MongoDB persistence, Firebase authentication, and Cloudinary-backed video uploads.

## Project Structure

```text
.
├── yourtube/   # Next.js frontend
├── server/     # Express backend API
├── docs/       # Architecture decisions
└── render.yaml # Render backend deployment config
```

## Features

- Upload MP4 videos to Cloudinary.
- Browse, search, and watch uploaded videos.
- Like, dislike, comment, save to Watch Later, and view watch history.
- User/channel pages for the signed-in user's uploads.
- Stale local upload records are shown as unavailable instead of making broken playback requests.

## Local Setup

### Backend

```bash
cd server
npm install
npm run dev
```

Create `server/.env`:

```text
PORT=5000
DB_URL=<mongodb connection string>
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=<cloudinary cloud name>
CLOUDINARY_API_KEY=<cloudinary api key>
CLOUDINARY_API_SECRET=<cloudinary api secret>
TRANSLATION_PROVIDER=deepl
DEEPL_API_KEY=<deepl api key>
TRANSLATION_API_URL=https://api-free.deepl.com
DEEPL_DETECT_LANGUAGE_ENABLED=false
```

Health check:

```bash
curl http://localhost:5000/health
```

### Frontend

```bash
cd yourtube
npm install
npm run dev
```

Create `yourtube/.env.local`:

```text
BACKEND_URL=http://localhost:5000
```

Open `http://localhost:3000`.

## Deployment

- Frontend: Vercel from `yourtube/`.
- Backend: Render from `server/`.
- Database: MongoDB Atlas.
- Uploaded video assets: Cloudinary.

Production frontend environment variables:

```text
NEXT_PUBLIC_API_BASE_URL=https://yourtube-separate-backend.onrender.com
NEXT_PUBLIC_MEDIA_BASE_URL=https://yourtube-separate-backend.onrender.com
```

Production backend environment variables:

```text
DB_URL=<mongodb atlas uri>
FRONTEND_URL=https://yourtube-teal.vercel.app
CLOUDINARY_CLOUD_NAME=<cloudinary cloud name>
CLOUDINARY_API_KEY=<cloudinary api key>
CLOUDINARY_API_SECRET=<cloudinary api secret>
TRANSLATION_PROVIDER=deepl
DEEPL_API_KEY=<deepl api key>
TRANSLATION_API_URL=https://api-free.deepl.com
DEEPL_DETECT_LANGUAGE_ENABLED=false
```

`DEEPL_DETECT_LANGUAGE_ENABLED` should stay `false` unless your DeepL account has access to the beta Detect Language API. Translation still works without it because DeepL can auto-detect the source language during `/v2/translate`.

See [server/RENDER.md](server/RENDER.md) and [docs/adr/0001-use-cloudinary-for-video-assets.md](docs/adr/0001-use-cloudinary-for-video-assets.md).

## Verification

Frontend build:

```bash
cd yourtube
npm run build
```

Backend syntax checks:

```bash
cd server
node --check index.js
node --check controllers/video.js
```
