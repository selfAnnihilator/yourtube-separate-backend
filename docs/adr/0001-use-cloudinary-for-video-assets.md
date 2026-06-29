# Use Cloudinary for video assets

YourTube stores uploaded video assets in Cloudinary instead of on the backend server filesystem. This avoids relying on paid or ephemeral hosted disks, keeps playback URLs stable across backend restarts and redeploys, and fits the project's constraint that hosted infrastructure must remain on free tiers.

The backend stores Cloudinary metadata and a playback URL in MongoDB after upload. It does not treat the backend filesystem path as the source of truth for video playback.

Existing records that point at old `/uploads/...` paths are treated as stale video records. Users should reupload those videos because MongoDB cannot reconstruct missing local files.

Stale video records remain visible for now. The project will not add automatic hiding or cleanup logic until there is a stronger need; old rows can be manually deleted after replacement uploads exist.

Uploads continue to flow through the Express backend for now. This keeps the frontend upload flow close to the current implementation while replacing local disk persistence with Cloudinary persistence.

For compatibility with the existing frontend, the `filepath` database field temporarily stores the Cloudinary playback URL. The domain term remains playback URL; the field name can be cleaned up later.

## Considered Options

- **Render persistent disk**: rejected because persistent disks are paid infrastructure.
- **Backend local filesystem**: rejected because hosted filesystems are not durable enough for uploaded video assets.
- **Vercel Blob**: rejected for now because the project needs video-oriented hosting and delivery, and Cloudinary is more directly suited to media playback.
