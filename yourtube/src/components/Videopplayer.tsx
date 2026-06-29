"use client";

import { useRef } from "react";
import { getMediaUrl, isStaleUploadPath } from "@/lib/media";

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
  };
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaUrl = getMediaUrl(video?.filepath);

  if (!mediaUrl) {
    return (
      <div className="aspect-video bg-gray-950 text-white rounded-lg overflow-hidden flex items-center justify-center p-6 text-center">
        <div>
          <p className="font-medium">Video unavailable</p>
          <p className="text-sm text-gray-300 mt-2">
            {isStaleUploadPath(video?.filepath)
              ? "This upload was stored on the old server filesystem and is no longer available. Reupload the video to create a durable playback URL."
              : "This video does not have a playback URL."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <video ref={videoRef} className="w-full h-full" controls>
        <source src={mediaUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
