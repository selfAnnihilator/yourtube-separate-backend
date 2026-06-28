Deploy the Express backend on Render as a separate web service.

Render settings:

```text
Root Directory: server
Environment: Node
Build Command: npm install
Start Command: npm start
Health Check Path: /health
```

Required environment variables:

```text
DB_URL=<your mongodb atlas uri>
FRONTEND_URL=https://yourtube-teal.vercel.app
UPLOAD_DIR=/opt/render/project/src/uploads
```

Persistent disk:

```text
Mount Path: /opt/render/project/src/uploads
```

After Render gives you a backend URL like:

```text
https://yourtube-backend.onrender.com
```

set these Vercel frontend env vars and redeploy:

```text
NEXT_PUBLIC_API_BASE_URL=https://yourtube-backend.onrender.com
NEXT_PUBLIC_MEDIA_BASE_URL=https://yourtube-backend.onrender.com
```
