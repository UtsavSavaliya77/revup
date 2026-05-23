"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Eye,
  Heart,
  Play,
  Settings,
  UserCircle,
  LogOut,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

type Profile = {
  id?: string;
  name?: string | null;
  username: string;
  avatar?: string | null;
  bio?: string | null;
  following?: number | null;
  followers?: number | null;
  likes?: number | null;
  views?: number | null;
  videosCount?: number | null;
};

type ProfilePost = {
  id: string;
  thumbnail?: string | null;
  image?: string | null;
  imageUrl?: string | null;
  mediaUrl?: string | null;
  fileUrl?: string | null;
  videoUrl?: string | null;
  video?: string | null;
  videoThumbnail?: string | null;
  title?: string;
  caption?: string;
  type?: string;
  mediaType?: "image" | "video" | "reel";
};

function safeNumber(value: number | null | undefined) {
  return Number(value || 0);
}

function normalizeSavedItem(item: any): ProfilePost | null {
  if (!item) return null;

  const source = item.post || item.reel || item.video || item;

  return {
    id: String(source.id || item.id),
    thumbnail: source.thumbnail || source.videoThumbnail || item.thumbnail,
    image: source.image || item.image,
    imageUrl: source.imageUrl || item.imageUrl,
    mediaUrl: source.mediaUrl || item.mediaUrl,
    fileUrl: source.fileUrl || item.fileUrl,
    videoUrl: source.videoUrl || source.video || item.videoUrl,
    video: source.video || item.video,
    videoThumbnail: source.videoThumbnail || item.videoThumbnail,
    title: source.title || item.title,
    caption: source.caption || item.caption,
    type: source.type || item.type,
    mediaType: source.mediaType || item.mediaType,
  };
}

function getMediaSrc(post: ProfilePost) {
  return (
    post.videoUrl ||
    post.video ||
    post.mediaUrl ||
    post.fileUrl ||
    post.videoThumbnail ||
    post.thumbnail ||
    post.image ||
    post.imageUrl ||
    null
  );
}

function checkIsVideo(post: ProfilePost, mediaSrc: string | null) {
  const src = mediaSrc?.toLowerCase() || "";

  return (
    post.type === "video" ||
    post.type === "reel" ||
    post.mediaType === "video" ||
    post.mediaType === "reel" ||
    src.includes(".mp4") ||
    src.includes(".webm") ||
    src.includes(".mov")
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [saved, setSaved] = useState<ProfilePost[]>([]);
  const [activeTab, setActiveTab] = useState<"videos" | "saved">("videos");
  const [loading, setLoading] = useState(true);
  const [reelsOpen, setReelsOpen] = useState(false);
  const [activeReelIndex, setActiveReelIndex] = useState(0);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    document.body.style.overflow = reelsOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [reelsOpen]);

  const [customAlert, setCustomAlert] = useState<{
    open: boolean;
    title: string;
    message: string;
    type: "error" | "success";
  }>({
    open: false,
    title: "",
    message: "",
    type: "error",
  });

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const showCustomAlert = (
    message: string,
    title = "Error",
    type: "error" | "success" = "error"
  ) => {
    setCustomAlert({
      open: true,
      title,
      message,
      type,
    });
  };

  const closeCustomAlert = () => {
    setCustomAlert((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      window.location.href = "/login";
    } catch (error) {
      console.error(error);
      showCustomAlert("Something went wrong while logging out.");
    }
  };

  async function loadProfile() {
    try {
      const res = await fetch("/api/profile", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await res.json();

      setProfile(data.profile || null);
      setPosts(Array.isArray(data.videos) ? data.videos : []);

      const allSavedRaw = [
        ...(Array.isArray(data.saved) ? data.saved : []),
        ...(Array.isArray(data.savedPosts) ? data.savedPosts : []),
        ...(Array.isArray(data.savedReels) ? data.savedReels : []),
        ...(Array.isArray(data.profile?.saved) ? data.profile.saved : []),
        ...(Array.isArray(data.profile?.savedPosts)
          ? data.profile.savedPosts
          : []),
        ...(Array.isArray(data.profile?.savedReels)
          ? data.profile.savedReels
          : []),
      ];

      const normalizedSaved = allSavedRaw
        .map(normalizeSavedItem)
        .filter(Boolean) as ProfilePost[];

      const uniqueSaved = Array.from(
        new Map(normalizedSaved.map((item) => [item.id, item])).values()
      );

      setSaved(uniqueSaved);
    } catch (error) {
      console.error(error);
      showCustomAlert("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  const openEditProfile = () => {
    setEditUsername(profile?.username || "");
    setEditBio(profile?.bio || "");
    setEditAvatarPreview(profile?.avatar || "");
    setEditAvatarFile(null);
    setIsEditOpen(true);
  };

  const handleUpdateProfile = async () => {
    try {
      setSavingProfile(true);

      const formData = new FormData();
      formData.append("username", editUsername);
      formData.append("bio", editBio);

      if (editAvatarFile) {
        formData.append("avatar", editAvatarFile);
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        showCustomAlert(data.error || "Failed to update profile");
        return;
      }

      setProfile((prev) => ({
        ...(prev || {}),
        ...data.profile,
      }));

      window.dispatchEvent(
        new CustomEvent("profile-updated", {
          detail: {
            avatar: data.profile.avatar,
            username: data.profile.username,
          },
        })
      );

      setIsEditOpen(false);
      showCustomAlert("Profile updated successfully.", "Success", "success");
    } catch (error) {
      console.error(error);
      showCustomAlert("Something went wrong");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-slate-400">
        Loading profile...
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] text-slate-400">
        Profile not found.
      </main>
    );
  }

  const currentPosts = activeTab === "videos" ? posts : saved;
  const isSuccessAlert = customAlert.type === "success";

  const reelPosts = currentPosts.filter((post) => {
    const mediaSrc = getMediaSrc(post);
    return mediaSrc && checkIsVideo(post, mediaSrc);
  });

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <button className="fixed left-4 top-6 z-50 text-slate-300 hover:text-orange-500">
        <Settings size={18} />
      </button>

      <section className="relative h-40 overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-[#050505]" />
      </section>

      <section className="px-5 pb-8">
        <div className="relative mx-auto max-w-7xl">
          <div className="absolute right-0 top-6 flex flex-col items-center gap-3 md:top-12 md:flex-row">
            <button
              onClick={openEditProfile}
              className="rounded-md border border-orange-600 bg-white px-4 py-2 text-xs font-bold uppercase text-black transition hover:bg-orange-500 hover:text-white"
            >
              Edit Profile
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-md border border-red-500 bg-red-500 px-4 py-2 text-xs font-bold uppercase text-white transition hover:bg-red-600"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>

          <div className="-mt-16 max-w-4xl">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.username}
                className="mb-5 h-28 w-28 rounded-full object-cover ring-4 ring-black"
              />
            ) : (
              <div className="mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-neutral-900 text-slate-500">
                <UserCircle size={80} />
              </div>
            )}

            <h1 className="text-2xl font-black uppercase tracking-tight md:text-4xl">
              @{profile.username || "user"}
            </h1>

            {profile.bio && (
              <p className="mt-4 max-w-3xl text-sm text-neutral-400">
                {profile.bio}
              </p>
            )}

            <div className="mt-7 flex gap-9">
              <Stat number={profile.following} label="Following" />
              <Stat number={profile.followers} label="Followers" />
              <Stat number={profile.likes} label="Likes" orange />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Metric icon={<Eye size={20} />} value={profile.views} />
            <Metric icon={<Play size={20} />} value={profile.videosCount} />
            <Metric icon={<Heart size={20} />} value={profile.likes} />
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-900">
        <div className="grid grid-cols-2 text-center text-sm font-black uppercase tracking-wide text-neutral-500">
          <button
            onClick={() => {
              setActiveTab("videos");
            }}
            className={`border-b-2 py-5 transition ${activeTab === "videos"
              ? "border-orange-600 text-orange-500"
              : "border-transparent hover:text-white"
              }`}
          >
            Videos
          </button>

          <button
            onClick={() => {
              setActiveTab("saved");
            }}
            className={`border-b-2 py-5 transition ${activeTab === "saved"
              ? "border-orange-600 text-orange-500"
              : "border-transparent hover:text-white"
              }`}
          >
            Saved
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {currentPosts.length > 0 ? (
          currentPosts.map((post) => {
            const mediaSrc = getMediaSrc(post);
            const isVideo = checkIsVideo(post, mediaSrc);

            return (
              <article
                key={post.id}
                className="group relative aspect-[4/3] overflow-hidden bg-neutral-900"              >
                {mediaSrc ? (
                  isVideo ? (
                    <div className="relative h-full w-full">
                      <video
                        ref={(el) => {
                          videoRefs.current[post.id] = el;
                        }}
                        src={mediaSrc}
                        className="h-full w-full object-cover"
                        muted
                        loop
                        playsInline
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const reelIndex = reelPosts.findIndex((item) => item.id === post.id);
                          setActiveReelIndex(reelIndex >= 0 ? reelIndex : 0);
                          window.dispatchEvent(new Event("reels-open"));
                          setReelsOpen(true);
                        }}
                        className="absolute inset-0 z-20 flex items-center justify-center"
                      >
                        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/70 text-white ring-1 ring-white/20 backdrop-blur-sm transition group-hover:scale-110">
                          <Play size={26} fill="white" />
                        </span>
                      </button>
                    </div>
                  ) : (
                    <img
                      src={mediaSrc}
                      alt={post.title || post.caption || "Post"}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  )
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-500">
                    No media
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 bg-black/10 transition group-hover:bg-black/30" />

                {(post.title || post.caption) && (
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                    <h3 className="font-black uppercase text-white">
                      {post.title || post.caption}
                    </h3>
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center text-slate-500">
            No {activeTab} found.
          </div>
        )}
      </section>

      {isEditOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-[#101010] p-6">
            <h2 className="text-2xl font-black uppercase">Edit Profile</h2>

            <div className="mt-6 space-y-4">
              <input
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="Username"
                className="w-full rounded-lg border border-neutral-800 bg-black px-4 py-3 text-white outline-none focus:border-orange-600"
              />

              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Bio"
                rows={4}
                className="w-full rounded-lg border border-neutral-800 bg-black px-4 py-3 text-white outline-none focus:border-orange-600"
              />

              <div>
                <label className="mb-2 block text-xs font-black uppercase text-neutral-400">
                  Avatar
                </label>

                {editAvatarPreview && (
                  <img
                    src={editAvatarPreview}
                    alt="Avatar preview"
                    onError={() => {
                      showCustomAlert(
                        "This image cannot be previewed."
                      );

                      setEditAvatarPreview("");
                      setEditAvatarFile(null);
                    }}
                    className="mb-3 h-20 w-20 rounded-full object-cover"
                  />
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (!file) return;

                    const allowedTypes = [
                      "image/jpeg",
                      "image/jpg",
                      "image/pjpeg",
                      "image/png",
                      "image/webp",
                    ];

                    if (!allowedTypes.includes(file.type)) {
                      showCustomAlert(
                        "Only JPG, JPEG, PNG, and WEBP images are allowed."
                      );
                      return;
                    }

                    if (file.size > 5 * 1024 * 1024) {
                      showCustomAlert(
                        "Image size must be less than 5MB."
                      );
                      return;
                    }

                    if (
                      editAvatarPreview &&
                      editAvatarPreview.startsWith("blob:")
                    ) {
                      URL.revokeObjectURL(editAvatarPreview);
                    }

                    const previewUrl = URL.createObjectURL(file);

                    setEditAvatarFile(file);
                    setEditAvatarPreview(previewUrl);
                  }}
                  className="w-full rounded-lg border border-neutral-800 bg-black px-4 py-3 text-white"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsEditOpen(false)}
                className="rounded-lg border border-neutral-700 px-5 py-3 text-sm font-bold text-neutral-300 hover:bg-neutral-900"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateProfile}
                disabled={savingProfile}
                className="rounded-lg bg-orange-600 px-5 py-3 text-sm font-black uppercase text-white disabled:opacity-60"
              >
                {savingProfile ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {reelsOpen && (
        <ReelsModal
          posts={reelPosts}
          initialIndex={activeReelIndex}
          onClose={() => {
  window.dispatchEvent(new Event("reels-close"));
  setReelsOpen(false);
}}
        />
      )}

      {customAlert.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-sm rounded-2xl border p-6 text-center shadow-2xl ${isSuccessAlert
              ? "border-green-500/30 bg-[#101010] shadow-green-500/20"
              : "border-red-500/30 bg-[#101010] shadow-red-500/20"
              }`}
          >
            <div
              className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${isSuccessAlert
                ? "bg-green-500/15 text-green-500"
                : "bg-red-500/15 text-red-500"
                }`}
            >
              {isSuccessAlert ? (
                <CheckCircle size={30} />
              ) : (
                <AlertTriangle size={30} />
              )}
            </div>

            <h2 className="text-xl font-black uppercase text-white">
              {customAlert.title}
            </h2>

            <p className="mt-3 text-sm text-neutral-400">
              {customAlert.message}
            </p>

            <button
              onClick={closeCustomAlert}
              className={`mt-6 w-full rounded-lg px-5 py-3 text-sm font-black uppercase text-white transition ${isSuccessAlert
                ? "bg-green-600 hover:bg-green-500"
                : "bg-orange-600 hover:bg-orange-500"
                }`}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({
  number,
  label,
  orange = false,
}: {
  number?: number | null;
  label: string;
  orange?: boolean;
}) {
  return (
    <div>
      <div
        className={`text-2xl font-black ${orange ? "text-orange-500" : "text-white"
          }`}
      >
        {safeNumber(number).toLocaleString()}
      </div>

      <div
        className={`mt-1 text-xs font-bold uppercase ${orange ? "text-orange-500" : "text-neutral-500"
          }`}
      >
        {label}
      </div>
    </div>
  );
}

function Metric({
  icon,
  value,
}: {
  icon: React.ReactNode;
  value?: number | null;
}) {
  return (
    <div className="flex h-20 flex-col items-center justify-center rounded-lg border border-neutral-800 bg-[#101010] text-slate-300">
      <div className="text-neutral-500">{icon}</div>

      <div className="mt-2 font-black">
        {safeNumber(value).toLocaleString()}
      </div>
    </div>
  );
}


function ReelsModal({
  posts,
  initialIndex,
  onClose,
}: {
  posts: ProfilePost[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const indexRef = useRef(initialIndex);
  const lockRef = useRef(false);
  const touchStartY = useRef(0);

  const goToReel = (nextIndex: number) => {
    if (lockRef.current) return;
    if (nextIndex < 0 || nextIndex >= posts.length) return;

    lockRef.current = true;
    indexRef.current = nextIndex;
    setIndex(nextIndex);

    setTimeout(() => {
      lockRef.current = false;
    }, 900);
  };

  const goNext = () => {
    goToReel(indexRef.current + 1);
  };

  const goPrev = () => {
    goToReel(indexRef.current - 1);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (Math.abs(e.deltaY) < 40) return;

    if (e.deltaY > 0) {
      goNext();
    } else {
      goPrev();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;

    if (Math.abs(diff) < 80) return;

    if (diff > 0) {
      goNext();
    } else {
      goPrev();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      }

      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const activePost = posts[index];
  const mediaSrc = activePost ? getMediaSrc(activePost) : null;

  return (
    <div
      className="fixed inset-0 z-[150] bg-black overflow-hidden"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
    >
      <button
        type="button"
        onClick={onClose}
        className="fixed right-5 top-5 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-2xl text-white"
      >
        ×
      </button>

      <div className="flex h-screen w-full items-center justify-center overflow-hidden bg-black">
        <div className="relative h-full w-full max-w-md bg-black">
          {mediaSrc && (
            <video
              key={activePost.id}
              src={mediaSrc}
              controls
              autoPlay
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          )}

          {(activePost?.title || activePost?.caption) && (
            <div className="absolute bottom-6 left-4 right-4 z-20 rounded-xl bg-black/40 p-4 text-white backdrop-blur-sm">
              <h3 className="text-sm font-black uppercase">
                {activePost.title || activePost.caption}
              </h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}