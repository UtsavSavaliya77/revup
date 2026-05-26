"use client";

import { useEffect, useState } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Send,
} from "lucide-react";

type StoryUser = {
  id: string;
  username: string;
  avatar?: string | null;
};

type Post = {
  id: string;
  caption: string;
  image?: string;
  video?: string;
  mediaUrl?: string;
  mediaType?: "image" | "video" | "reel";
  category?: string;

  user: {
    id: string;
    name: string;
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
    text: string;
    user: {
      id: string;
      name: string;
      username: string;
    };
  }[];
};

const categories = [
  "ALL",
  "JDM",
  "DRIFT",
  "F1",
  "SUPERCAR",
  "EV",
  "MUSCLE",
  "MODS",
];

function getPostMediaSrc(post: Post) {
  return post.mediaUrl || post.video || post.image || "";
}


function isVideoPost(post: Post) {
  const src = getPostMediaSrc(post).toLowerCase();
  
  return (
    post.mediaType === "video" ||
    post.mediaType === "reel" ||
    src.includes("/video/upload/") ||
    src.endsWith(".mp4") ||
    src.endsWith(".webm") ||
    src.endsWith(".mov")
  );
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [storyUsers, setStoryUsers] = useState<StoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [viewedStories, setViewedStories] = useState<string[]>([]);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
    fetchCurrentUser();
    fetchStoryUsers();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      setCurrentUser(data.user);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchStoryUsers = async () => {
    try {
      const response = await fetch("/api/users", {
        cache: "no-store",
      });

      const data = await response.json();
      setStoryUsers(data.users || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts?type=all");
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVideoPlay = (postId: string) => {
    const video = document.getElementById(
      `video-${postId}`
    ) as HTMLVideoElement | null;

    if (!video) return;

    if (video.paused) {
      video.play();
      setPlayingVideoId(postId);
    } else {
      video.pause();
      setPlayingVideoId(null);
    }
  };

  const handleStoryOpen = (userId: string) => {
    setViewedStories((prev) => {
      if (prev.includes(userId)) return prev;
      return [...prev, userId];
    });
  };

  const filteredPosts =
    selectedCategory === "ALL"
      ? posts
      : posts.filter(
          (post) =>
            post.category?.toLowerCase() === selectedCategory.toLowerCase()
        );

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

      fetchPosts();
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
      fetchPosts();
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async (postId: string) => {
    if (!currentUser?.id) {
      console.log("No current user found");
      return;
    }

    try {
      const response = await fetch("/api/posts/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          userId: currentUser.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Save failed:", data);
        return;
      }

      fetchPosts();
    } catch (error) {
      console.log(error);
    }
  };

  const handleShare = async (postId: string) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;

    if (navigator.share) {
      await navigator.share({
        title: "Check this post",
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert("Post link copied!");
    }
  };

  const toggleComments = (postId: string) => {
    setOpenCommentsPostId((prevId) =>
      prevId === postId ? null : postId
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pb-8">
      <section className="px-5 pt-5 pb-4 overflow-x-auto">
        <div className="flex gap-5 min-w-max">
          <div className="flex flex-col items-center min-w-[80px]">
            <button className="w-16 h-16 rounded-full bg-zinc-950 border border-dashed border-zinc-500 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-white text-lg font-black">
                +
              </div>
            </button>

            <p className="text-xs text-zinc-500 mt-2 tracking-widest">
              ADD STORY
            </p>
          </div>

          {storyUsers.map((user) => {
            const isViewed = viewedStories.includes(user.id);

            return (
              <button
                key={user.id}
                onClick={() => handleStoryOpen(user.id)}
                className="flex flex-col items-center"
              >
                <div
                  className={`w-16 h-16 rounded-full p-[3px] transition-all duration-300 ${
                    isViewed
                      ? "bg-zinc-700"
                      : "bg-gradient-to-tr from-orange-500 via-red-500 to-yellow-400"
                  }`}
                >
                  <img
                    src={
                      user.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                    }
                    alt={user.username}
                    className="w-full h-full rounded-full object-cover border-[3px] border-black"
                  />
                </div>

                <p className="text-xs text-zinc-400 mt-2 max-w-[70px] truncate">
                  {user.username}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-5 py-5 flex gap-3 overflow-x-auto">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setSelectedCategory(item)}
            className={`px-6 py-3 rounded-full font-bold text-sm ${
              selectedCategory === item
                ? "bg-orange-600 text-white"
                : "bg-zinc-900 text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </section>

      <section className="px-5 pt-6 space-y-8">
        {filteredPosts.length === 0 && (
          <p className="text-center text-zinc-500 mt-10">
            No posts found in {selectedCategory}
          </p>
        )}

        {filteredPosts.map((post) => {
          const isLiked = post.likes.some(
            (like) => like.userId === currentUser?.id
          );

          const isSaved = post.saves?.some(
            (save) => save.userId === currentUser?.id
          );

          const isCommentOpen = openCommentsPostId === post.id;

          return (
            <div
              key={post.id}
              className="relative bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-900"
            >
              <div className="relative">
                {isVideoPost(post) ? (
                  <div
                    onClick={() => toggleVideoPlay(post.id)}
                    className="relative cursor-pointer"
                  >
                    <video
                      id={`video-${post.id}`}
                      // src={post.video || post.mediaUrl || post.image}
                      src={getPostMediaSrc(post)}
                      playsInline
                      loop
                      className="w-full max-h-[85vh] object-cover bg-black"
                    />

                    {playingVideoId !== post.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center">
                          <div className="ml-1 w-0 h-0 border-y-[14px] border-y-transparent border-l-[22px] border-l-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <img
                    // src={post.image || post.mediaUrl}
                    src={getPostMediaSrc(post)}
                    alt={post.caption}
                    className="w-full max-h-[85vh] object-cover"
                  />
                )}

                <div className="absolute z-30 right-4 bottom-10 flex flex-col items-center gap-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex flex-col items-center text-white"
                  >
                    <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center">
                      <Heart
                        size={22}
                        className={
                          isLiked
                            ? "fill-red-500 text-red-500"
                            : "text-white"
                        }
                      />
                    </div>

                    <span className="text-xs mt-1">{post.likes.length}</span>
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex flex-col items-center text-white"
                  >
                    <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center">
                      <MessageCircle
                        size={22}
                        className={
                          isCommentOpen ? "text-orange-500" : "text-white"
                        }
                      />
                    </div>

                    <span className="text-xs mt-1">
                      {post.comments.length}
                    </span>
                  </button>

                  <button
                    onClick={() => handleSave(post.id)}
                    className="flex flex-col items-center text-white"
                  >
                    <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center">
                      <Bookmark
                        size={22}
                        className={
                          isSaved ? "fill-white text-white" : "text-white"
                        }
                      />
                    </div>

                    <span className="text-xs mt-1">
                      {post.saves?.length || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => handleShare(post.id)}
                    className="flex flex-col items-center text-white"
                  >
                    <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center">
                      <Share2 size={20} />
                    </div>
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/95 via-black/50 to-transparent md:p-4 md:pr-20">
                  <div className={isCommentOpen ? "hidden" : "block"}>
                    <div className="flex items-center gap-3 mb-3 pl-3">
                      <img
                        src={
                          post.user.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user.username}`
                        }
                        alt={post.user.username}
                        className="w-8 h-8 md:w-12 md:h-12 rounded-full border border-white/30 object-cover"
                      />

                      <div>
                        <h3 className="text-sm md:text-base font-bold">
                          @{post.user.username}
                        </h3>

                        {post.category && (
                          <p className="text-[10px] lg:text-xl uppercase">
                            {post.category}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-zinc-200 leading-relaxed max-w-[75%] pl-3 pb-3">
                      {post.caption}
                    </p>
                  </div>

                  {isCommentOpen && (
                    <div className="mt-4 w-[75%] max-w-[520px] md:w-[420px] md:ml-auto rounded-3xl bg-black/55 backdrop-blur-xl border border-white/10 p-4">
                      <div className="space-y-3 max-h-[220px] overflow-y-auto scrollbar-none pr-1">
                        {post.comments.length > 0 ? (
                          post.comments.map((comment) => (
                            <div
                              key={comment.id}
                              className="bg-white/10 rounded-2xl px-4 py-3"
                            >
                              <p className="text-sm font-semibold">
                                @{comment.user.username}
                              </p>

                              <p className="text-zinc-300 mt-1 text-sm">
                                {comment.text}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-zinc-400">
                            No comments yet
                          </p>
                        )}
                      </div>

                      <div className="relative mt-4">
                        <input
                          id={`comment-${post.id}`}
                          type="text"
                          placeholder="Add a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="w-full bg-zinc-900/90 rounded-full py-3 pl-5 pr-14 outline-none text-sm"
                        />

                        <button
                          onClick={() => handleComment(post.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}