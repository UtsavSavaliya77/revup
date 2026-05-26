"use client";

import { useEffect, useState } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Send,
} from "lucide-react";

type Reel = {
  id: string;
  caption: string;
  image?: string;
  video?: string;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "reel";
  category?: string;

  user: {
    username: string;
    avatar?: string;
  };

  likes: {
    userId: string;
  }[];

  saves?: {
    userId: string;
  }[];

  comments: {
    id: string;
    text?: string;
    user?: {
      username: string;
    };
  }[];
};

function getReelMediaSrc(reel: Reel) {
  return reel.mediaUrl || reel.video || reel.image || "";
}

function isVideoReel(reel: Reel) {
  const src = getReelMediaSrc(reel).toLowerCase();

  return (
    reel.mediaType === "video" ||
    reel.mediaType === "reel" ||
    src.includes("/video/upload/") ||
    src.includes(".mp4") ||
    src.includes(".webm") ||
    src.includes(".mov")
  );
}

export default function ReelsPage() {
  console.log("Fetch reel page");
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [mutedVideos, setMutedVideos] = useState<string[]>([]);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [openCommentsReelId, setOpenCommentsReelId] = useState<string | null>(
    null
  );
  const [commentText, setCommentText] = useState("");
  const [direction, setDirection] = useState<"up" | "down">("down");

  const goNextReel = () => {
    setDirection("down");
    setOpenCommentsReelId(null);

    setCurrentReelIndex((prev) => (prev < reels.length - 1 ? prev + 1 : prev));
  };

  const goPrevReel = () => {
    setDirection("up");
    setOpenCommentsReelId(null);

    setCurrentReelIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  useEffect(() => {
    fetchReels();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      const data = await response.json();
      setCurrentUser(data.user);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchReels = async () => {
    try {
      const response = await fetch("/api/posts?type=all", {
        cache: "no-store",
      });

      const data = await response.json();

      const reelPosts = (data.posts || []).filter((post: Reel) =>
        isVideoReel(post)
      );

      setReels(reelPosts);
      setCurrentReelIndex(0);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await fetch("/api/posts/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          userId: currentUser?.id,
        }),
      });

      fetchReels();
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async (postId: string) => {
    try {
      await fetch("/api/posts/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          userId: currentUser?.id,
        }),
      });

      fetchReels();
    } catch (error) {
      console.log(error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!commentText.trim()) return;

    try {
      await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          text: commentText,
        }),
      });

      setCommentText("");
      fetchReels();
    } catch (error) {
      console.log(error);
    }
  };

  const handleShare = async (postId: string) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;

    if (navigator.share) {
      await navigator.share({
        title: "Check this reel",
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert("Reel link copied!");
    }
  };

  const toggleComments = (reelId: string) => {
    setOpenCommentsReelId((prevId) => (prevId === reelId ? null : reelId));
  };

  const playCurrentVideo = (reelId: string) => {
    setTimeout(() => {
      const video = document.getElementById(
        `reel-video-${reelId}`
      ) as HTMLVideoElement | null;

      if (!video) return;

      video.play().catch(() => {});
      setPlayingVideoId(reelId);
    }, 100);
  };

  useEffect(() => {
    if (reels.length > 0 && reels[currentReelIndex]) {
      playCurrentVideo(reels[currentReelIndex].id);
    }
  }, [reels, currentReelIndex]);

  useEffect(() => {
    let locked = false;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (locked) return;

      locked = true;

      if (e.deltaY > 0) {
        goNextReel();
      } else {
        goPrevReel();
      }

      setTimeout(() => {
        locked = false;
      }, 700);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") goNextReel();
      if (e.key === "ArrowUp") goPrevReel();
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [reels]);

  const toggleMute = (reelId: string) => {
    const video = document.getElementById(
      `reel-video-${reelId}`
    ) as HTMLVideoElement | null;

    if (!video) return;

    video.muted = !video.muted;

    setMutedVideos((prev) =>
      video.muted ? [...prev, reelId] : prev.filter((id) => id !== reelId)
    );
  };

  const togglePlay = (reelId: string) => {
    const video = document.getElementById(
      `reel-video-${reelId}`
    ) as HTMLVideoElement | null;

    if (!video) return;

    if (video.paused) {
      video
        .play()
        .then(() => {
          setPlayingVideoId(reelId);
        })
        .catch(() => {});
    } else {
      video.pause();
      setPlayingVideoId(null);
    }
  };

  if (loading) {
    return (
      <main className="fixed left-0 right-0 top-[72px] bottom-[84px] bg-black text-white overflow-hidden flex items-center justify-center">
        Loading reels...
      </main>
    );
  }

  if (reels.length === 0) {
    return (
      <main className="fixed left-0 right-0 top-[72px] bottom-[84px] bg-black text-white overflow-hidden flex items-center justify-center">
        No reels found
      </main>
    );
  }

  const reel = reels[currentReelIndex];
  const reelSrc = getReelMediaSrc(reel);

  const isMuted = mutedVideos.includes(reel.id);
  const isPlaying = playingVideoId === reel.id;
  const isLiked = reel.likes.some((like) => like.userId === currentUser?.id);
  const isSaved = reel.saves?.some((save) => save.userId === currentUser?.id);
  const isCommentOpen = openCommentsReelId === reel.id;

  return (
    <main className="fixed left-0 right-0 top-[0px] bottom-[80px] bg-black text-white overflow-hidden flex items-center justify-center">
      <section
        className={`relative h-full w-full md:max-w-[400px] overflow-hidden bg-black transform transition-all duration-500 ease-out ${
          direction === "down"
            ? "animate-[slideUp_0.45s_ease-out]"
            : "animate-[slideDown_0.45s_ease-out]"
        }`}
      >
        <div onClick={() => togglePlay(reel.id)} className="absolute inset-0 cursor-pointer">
          {reelSrc ? (
            <video
              key={reel.id}
              id={`reel-video-${reel.id}`}
              src={reelSrc}
              loop
              muted={isMuted}
              playsInline
              autoPlay
              onPlay={() => setPlayingVideoId(reel.id)}
              onPause={() => setPlayingVideoId(null)}
              className="w-screen h-screen object-cover bg-black"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-black text-zinc-500">
              Video not found
            </div>
          )}

          {!isPlaying && reelSrc && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
                <Play size={38} className="fill-white text-white ml-1" />
              </div>
            </div>
          )}
        </div>

        <div className="absolute right-4 bottom-24 z-30 flex flex-col items-center gap-5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLike(reel.id);
            }}
            className="flex flex-col items-center text-white"
          >
            <div className="w-12 h-12 rounded-full bg-black/55 backdrop-blur-md flex items-center justify-center">
              <Heart
                size={27}
                className={isLiked ? "fill-red-500 text-red-500" : "text-white"}
              />
            </div>
            <span className="text-xs mt-1">{reel.likes.length}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleComments(reel.id);
            }}
            className="flex flex-col items-center text-white"
          >
            <div className="w-12 h-12 rounded-full bg-black/55 backdrop-blur-md flex items-center justify-center">
              <MessageCircle
                size={27}
                className={isCommentOpen ? "text-orange-500" : "text-white"}
              />
            </div>
            <span className="text-xs mt-1">{reel.comments.length}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSave(reel.id);
            }}
            className="flex flex-col items-center text-white"
          >
            <div className="w-12 h-12 rounded-full bg-black/55 backdrop-blur-md flex items-center justify-center">
              <Bookmark
                size={27}
                className={isSaved ? "fill-white text-white" : "text-white"}
              />
            </div>
            <span className="text-xs mt-1">{reel.saves?.length || 0}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare(reel.id);
            }}
            className="flex flex-col items-center text-white"
          >
            <div className="w-12 h-12 rounded-full bg-black/55 backdrop-blur-md flex items-center justify-center">
              <Share2 size={25} />
            </div>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute(reel.id);
            }}
            className="flex flex-col items-center text-white"
          >
            <div className="w-12 h-12 rounded-full bg-black/55 backdrop-blur-md flex items-center justify-center">
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </div>
          </button>
        </div>

        {!isCommentOpen && (
          <div className="absolute bottom-1 left-4 right-24 z-30">
            <div className="flex items-center gap-3 mb-2">
              <img
                src={
                  reel.user.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${reel.user.username}`
                }
                alt={reel.user.username}
                className="w-10 h-10 rounded-full border border-white/30 object-cover"
              />

              <div>
                <h3 className="font-bold text-base">@{reel.user.username}</h3>

                {reel.category && (
                  <p className="text-orange-500 text-xs font-bold uppercase">
                    {reel.category}
                  </p>
                )}
              </div>
            </div>

            <p className="text-sm text-zinc-200 leading-relaxed">
              {reel.caption}
            </p>
          </div>
        )}

        {isCommentOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-4 bottom-6 z-40 w-[72%] max-w-[300px] rounded-3xl bg-black/65 backdrop-blur-xl border border-white/10 p-4"
          >
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {reel.comments.length > 0 ? (
                reel.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-white/10 rounded-2xl px-4 py-3"
                  >
                    <p className="text-sm font-semibold">
                      @{comment.user?.username || "user"}
                    </p>

                    <p className="text-zinc-300 mt-1 text-sm">
                      {comment.text}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-400">No comments yet</p>
              )}
            </div>

            <div className="relative mt-4">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-zinc-900/90 rounded-full py-3 pl-5 pr-14 outline-none text-sm"
              />

              <button
                onClick={() => handleComment(reel.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}