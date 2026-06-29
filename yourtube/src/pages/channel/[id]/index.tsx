import ChannelHeader from "@/components/ChannelHeader";
import Channeltabs from "@/components/Channeltabs";
import ChannelVideos from "@/components/ChannelVideos";
import VideoUploader from "@/components/VideoUploader";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";

const index = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const channelId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);
  const isOwnChannel = Boolean(user && channelId && user._id === channelId);

  const loadVideos = async () => {
    if (!isOwnChannel) {
      setVideos([]);
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.get("/video/getall");
      setVideos(res.data.filter((video: any) => video.uploader === channelId));
    } catch (error) {
      console.error("Error fetching channel videos:", error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, [channelId, isOwnChannel]);

  if (!router.isReady) {
    return <div className="flex-1 p-4">Loading channel...</div>;
  }

  if (!user) {
    return (
      <div className="flex-1 p-4">
        <div className="text-center py-12">
          <h1 className="text-xl font-semibold mb-2">Channel unavailable</h1>
          <p className="text-gray-600">
            Sign in to view and manage your channel.
          </p>
        </div>
      </div>
    );
  }

  if (!isOwnChannel) {
    return (
      <div className="flex-1 p-4">
        <div className="text-center py-12">
          <h1 className="text-xl font-semibold mb-2">Channel unavailable</h1>
          <p className="text-gray-600">
            Public channel pages are not available yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-white">
      <div className="max-w-full mx-auto">
        <ChannelHeader channel={user} user={user} />
        <Channeltabs />
        <div className="px-4 pb-8">
          <VideoUploader
            channelId={channelId}
            channelName={user?.channelname}
            onUploadComplete={loadVideos}
          />
        </div>
        <div className="px-4 pb-8">
          {loading ? <div>Loading videos...</div> : <ChannelVideos videos={videos} />}
        </div>
      </div>
    </div>
  );
};

export default index;
