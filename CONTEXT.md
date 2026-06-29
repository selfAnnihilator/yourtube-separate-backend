# YourTube

YourTube is a video sharing application where users upload videos and watch videos uploaded by others.

## Language

**Uploaded Video Asset**:
A durable video file made available for playback after a user upload.
_Avoid_: Local file, server upload, disk file

**Playback URL**:
A stable URL that a viewer's browser can use to stream an Uploaded Video Asset.
_Avoid_: File path, upload path

**Stale Video Record**:
A video record whose Uploaded Video Asset is no longer available for playback.
_Avoid_: Broken upload, missing file
