import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Download,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";
import { TransitionsEffectsPanel } from "@/components/TransitionsEffectsPanel";
import { AudioMixerConsole } from "@/components/AudioMixerConsole";
import { trpc } from "@/lib/trpc";

interface VideoClip {
  id: string;
  name: string;
  duration: number;
  type: "video" | "audio";
  url: string;
  thumbnail?: string | null;
}

interface TimelineTrack {
  id: string;
  name: string;
  type: "video" | "audio";
  muted: boolean;
  locked: boolean;
  visible: boolean;
  clips: TimelineClip[];
}

interface TimelineClip {
  id: string;
  trackId: string;
  clipId: string;
  startTime: number;
  duration: number;
  name: string;
  url?: string;
}

interface VideoTabProps {
  projectId: number;
}

export default function VideoTab({ projectId }: VideoTabProps) {
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [tracks, setTracks] = useState<TimelineTrack[]>([
    {
      id: "video-1",
      name: "Video",
      type: "video",
      muted: false,
      locked: false,
      visible: true,
      clips: [],
    },
    {
      id: "audio-1",
      name: "Audio 1",
      type: "audio",
      muted: false,
      locked: false,
      visible: true,
      clips: [],
    },
    {
      id: "audio-2",
      name: "Audio 2",
      type: "audio",
      muted: false,
      locked: false,
      visible: true,
      clips: [],
    },
    {
      id: "effects-1",
      name: "Effects",
      type: "audio",
      muted: false,
      locked: false,
      visible: true,
      clips: [],
    },
  ]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedClip, setSelectedClip] = useState<TimelineClip | null>(null);
  const [zoom, setZoom] = useState(100);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePanel, setActivePanel] = useState<"transitions" | "mixer">("transitions");
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Query for videos
  const videosQuery = trpc.video.list.useQuery({ projectId });
  const createVideoMutation = trpc.video.create.useMutation();

  // Timeline dimensions
  const pixelsPerSecond = (zoom / 100) * 50;

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
  };

  // Auto-populate timeline when videos are generated
  useEffect(() => {
    if (videosQuery.data && videosQuery.data.length > 0) {
      const completedVideos = videosQuery.data.filter(
        (v) => v.status === "completed" && v.videoUrl
      );

      const newClips: VideoClip[] = completedVideos.map((video, idx) => ({
        id: `video-${video.id}`,
        name: `Generated Video ${idx + 1}`,
        duration: 5,
        type: "video",
        url: video.videoUrl!,
        thumbnail: video.videoUrl,
      }));

      if (newClips.length > 0) {
        setClips(newClips);

        if (newClips.length > 0 && tracks[0].clips.length === 0) {
          const firstClip = newClips[0];
          setTracks(
            tracks.map((track) =>
              track.id === "video-1"
                ? {
                    ...track,
                    clips: [
                      {
                        id: `clip-${firstClip.id}`,
                        trackId: "video-1",
                        clipId: firstClip.id,
                        startTime: 0,
                        duration: firstClip.duration,
                        name: firstClip.name,
                        url: firstClip.url,
                      },
                    ],
                  }
                : track
            )
          );
        }
      }
    }
  }, [videosQuery.data]);

  // Handle playback
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle video generation
  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    try {
      await createVideoMutation.mutateAsync({
        projectId,
        provider: "sora",
      });
      videosQuery.refetch();
    } catch (error) {
      console.error("Failed to generate video:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle track controls
  const toggleTrackMute = (trackId: string) => {
    setTracks(
      tracks.map((track) =>
        track.id === trackId ? { ...track, muted: !track.muted } : track
      )
    );
  };

  const toggleTrackLock = (trackId: string) => {
    setTracks(
      tracks.map((track) =>
        track.id === trackId ? { ...track, locked: !track.locked } : track
      )
    );
  };

  const toggleTrackVisibility = (trackId: string) => {
    setTracks(
      tracks.map((track) =>
        track.id === trackId ? { ...track, visible: !track.visible } : track
      )
    );
  };

  // Handle clip deletion
  const deleteClip = (trackId: string, clipId: string) => {
    setTracks(
      tracks.map((track) =>
        track.id === trackId
          ? {
              ...track,
              clips: track.clips.filter((clip) => clip.id !== clipId),
            }
          : track
      )
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] text-white">
      {/* Header Toolbar */}
      <div className="bg-[#2a2a2a] border-b border-[#404040] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePlayPause}
            className="hover:bg-[#404040]"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          <Button size="sm" variant="ghost" className="hover:bg-[#404040]">
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="hover:bg-[#404040]">
            <SkipForward className="w-4 h-4" />
          </Button>

          <div className="mx-4 px-3 py-1 bg-[#1a1a1a] rounded text-sm font-mono">
            {formatTime(currentTime)}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Zoom:</span>
            <input
              type="range"
              min="50"
              max="200"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-xs text-gray-400 w-8">{zoom}%</span>
          </div>

          <Button
            size="sm"
            onClick={handleGenerateVideo}
            disabled={isGenerating || createVideoMutation.isPending}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <Zap className="w-4 h-4 mr-2" />
            Generate AI Video
          </Button>

          <Button size="sm" variant="ghost" className="hover:bg-[#404040]">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Content Area - 4 Panel Layout */}
      <div className="flex flex-1 overflow-hidden gap-1 bg-[#1a1a1a] p-1">
        {/* Left Panel - Media Pool */}
        <div className="w-48 bg-[#2a2a2a] rounded border border-[#404040] flex flex-col overflow-hidden">
          <div className="bg-[#1a1a1a] px-3 py-2 border-b border-[#404040] font-semibold text-sm">
            MEDIA POOL
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {clips.length === 0 ? (
              <div className="text-xs text-gray-500 text-center py-4">
                No clips yet
              </div>
            ) : (
              clips.map((clip) => (
                <div
                  key={clip.id}
                  className="bg-[#3a3a3a] rounded p-2 hover:bg-[#404040] cursor-pointer text-xs"
                >
                  {clip.thumbnail && (
                    <video
                      src={clip.thumbnail}
                      className="w-full h-20 rounded mb-1 object-cover"
                    />
                  )}
                  <div className="truncate">{clip.name}</div>
                  <div className="text-gray-500 text-xs">
                    {formatTime(clip.duration)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center Top - Canvas/Preview */}
        <div className="flex-1 flex flex-col bg-[#2a2a2a] rounded border border-[#404040] overflow-hidden">
          <div className="bg-[#1a1a1a] px-3 py-2 border-b border-[#404040] font-semibold text-sm">
            CANVAS
          </div>
          <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
            {selectedClip?.url ? (
              <video
                ref={videoRef}
                src={selectedClip.url}
                className="max-w-full max-h-full"
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              />
            ) : (
              <div className="text-gray-500 text-center">
                <Play className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-sm">Select a clip to preview</p>
              </div>
            )}
            <div className="absolute bottom-4 left-4 text-sm font-mono text-white bg-black/60 px-3 py-1 rounded">
              ADVENTURE AWAITS
            </div>
          </div>
        </div>

        {/* Right Panel - Inspector / Effects / Mixer */}
        <div className="w-80 bg-[#2a2a2a] rounded border border-[#404040] flex flex-col overflow-hidden">
          <Tabs value={activePanel} onValueChange={(v: any) => setActivePanel(v)} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full rounded-none border-b border-[#404040] bg-[#1a1a1a] grid grid-cols-2">
              <TabsTrigger value="transitions" className="text-xs">
                Effects
              </TabsTrigger>
              <TabsTrigger value="mixer" className="text-xs">
                Audio
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transitions" className="flex-1 overflow-hidden p-0">
              <TransitionsEffectsPanel />
            </TabsContent>

            <TabsContent value="mixer" className="flex-1 overflow-hidden p-0">
              <AudioMixerConsole />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Timeline Panel - Bottom */}
      <div className="h-64 bg-[#2a2a2a] border-t border-[#404040] flex flex-col overflow-hidden">
        <div className="bg-[#1a1a1a] px-3 py-2 border-b border-[#404040] font-semibold text-sm flex items-center justify-between">
          <span>TIMELINE</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {tracks.reduce((sum, t) => sum + t.clips.length, 0)} clips
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-auto flex flex-col">
          {/* Track Headers */}
          <div className="flex border-b border-[#404040]">
            <div className="w-32 bg-[#1a1a1a] border-r border-[#404040] flex flex-col">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="h-12 border-b border-[#404040] px-2 flex items-center gap-1 text-xs font-semibold"
                >
                  <button
                    onClick={() => toggleTrackVisibility(track.id)}
                    className="p-1 hover:bg-[#404040] rounded"
                  >
                    {track.visible ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={() => toggleTrackMute(track.id)}
                    className={`p-1 rounded ${
                      track.muted ? "bg-red-600" : "hover:bg-[#404040]"
                    }`}
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => toggleTrackLock(track.id)}
                    className={`p-1 rounded ${
                      track.locked ? "bg-yellow-600" : "hover:bg-[#404040]"
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                  </button>
                  <span className="flex-1 truncate text-xs">{track.name}</span>
                </div>
              ))}
            </div>

            {/* Timeline Tracks */}
            <div className="flex-1 overflow-x-auto bg-[#1a1a1a]" ref={timelineRef}>
              <div className="flex flex-col">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className="h-12 border-b border-[#404040] bg-[#0a0a0a] relative"
                  >
                    {track.clips.map((clip) => (
                      <div
                        key={clip.id}
                        onClick={() => setSelectedClip(clip)}
                        className={`absolute h-10 top-1 rounded cursor-pointer text-xs flex items-center px-2 overflow-hidden ${
                          selectedClip?.id === clip.id
                            ? "bg-cyan-600 border-2 border-cyan-400"
                            : "bg-[#3a3a3a] border border-[#404040] hover:bg-[#404040]"
                        }`}
                        style={{
                          left: `${clip.startTime * pixelsPerSecond}px`,
                          width: `${clip.duration * pixelsPerSecond}px`,
                        }}
                      >
                        <span className="truncate font-semibold">{clip.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteClip(track.id, clip.id);
                          }}
                          className="ml-auto p-1 hover:bg-red-600 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
