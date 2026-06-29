import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { getMediaUrl } from "@/lib/media";

interface RelatedVideosProps {
  videos: Array<{
    _id: string;
    videotitle: string;
    videochanel: string;
    views: number;
    createdAt: string;
    filepath?: string;
  }>;
}
export default function RelatedVideos({ videos }: RelatedVideosProps) {
  return (
    <div className="space-y-2">
      {videos.map((video) => {
        const mediaUrl = getMediaUrl(video.filepath);

        return (
          <Link
            key={video._id}
            href={`/watch/${video._id}`}
            className="flex gap-2 group"
          >
            <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden flex-shrink-0">
              {mediaUrl ? (
                <video
                  src={mediaUrl}
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 text-center px-2">
                  Unavailable
                </div>
              )}
            </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
              {video.videotitle}
            </h3>
            <p className="text-xs text-gray-600 mt-1">{video.videochanel}</p>
            <p className="text-xs text-gray-600">
              {video.views.toLocaleString()} views •{" "}
              {formatDistanceToNow(new Date(video.createdAt))} ago
            </p>
          </div>
          </Link>
        );
      })}
    </div>
  );
}
