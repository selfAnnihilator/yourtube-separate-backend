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
CLOUDINARY_CLOUD_NAME=<your cloudinary cloud name>
CLOUDINARY_API_KEY=<your cloudinary api key>
CLOUDINARY_API_SECRET=<your cloudinary api secret>
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
