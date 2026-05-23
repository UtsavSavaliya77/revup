"use client";

import { useRef, useState } from "react";
import {
  UploadCloud,
  ChevronDown,
} from "lucide-react";

const categories = [
  "JDM",
  "DRIFT",
  "F1",
  "SUPERCAR",
  "EV",
  "MUSCLE",
  "MODS",
];

const quickTags = [
  "#turbo",
  "#v8",
  "#stancenation",
  "#speed",
  "#carmods",
  "#racing",
];

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const [mediaType, setMediaType] = useState<"image" | "video" | "reel">("video");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const [tags, setTags] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  // CUSTOM ALERT STATES
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const [alertType, setAlertType] = useState<"success" | "error">("error");

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error"
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertOpen(true);
  };

  const closeAlert = () => {
    setAlertOpen(false);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    const isVideo =
      selectedFile.type.startsWith("video");

    const isImage =
      selectedFile.type.startsWith("image");

    if (!isVideo && !isImage) {
      showAlert(
        "Error",
        "Only image or video allowed",
        "error"
      );
      return;
    }

    // Different limits
    const IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const VIDEO_MAX_SIZE = 50 * 1024 * 1024; // 50MB

    if (isImage && selectedFile.size > IMAGE_MAX_SIZE) {
      showAlert(
        "Error",
        "Image must be under 10MB",
        "error"
      );
      return;
    }

    if (isVideo && selectedFile.size > VIDEO_MAX_SIZE) {
      showAlert(
        "Error",
        "Video must be under 50MB",
        "error"
      );
      return;
    }

    setFile(selectedFile);

    setPreview(
      URL.createObjectURL(selectedFile)
    );

    setMediaType(
      isVideo ? "video" : "image"
    );
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag)
        ? prev.filter(
          (item) => item !== tag
        )
        : [...prev, tag]
    );
  };

  const uploadToCloudinary = async () => {
    if (!file) throw new Error("No file selected");

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    // if (!cloudName || !uploadPreset) {
    //   throw new Error(
    //     "Cloudinary env variables missing"
    //   );
    // }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset || "");
    formData.append("folder", "revup/posts");

    const resourceType =
      mediaType === "video" || mediaType === "reel" ? "video" : "image";

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Cloudinary upload failed");
    }

    return data.secure_url;
  };

  const handlePublish = async () => {
    if (!file) {
      showAlert("Error", "Please upload image or video", "error");
      return;
    }

    if (!title.trim()) {
      showAlert("Error", "Please enter title", "error");
      return;
    }

    if (!category) {
      showAlert("Error", "Please select category", "error");
      return;
    }

    try {
      setLoading(true);

      const uploadedUrl = await uploadToCloudinary();

      const response = await fetch("/api/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caption: title,
          image: uploadedUrl,
          category,
          mediaType,
          tags,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showAlert("Error", data.error || data.message || "Upload failed", "error");
        return;
      }

      showAlert("Success", "Post uploaded successfully!", "success");

      setFile(null);
      setPreview("");
      setTitle("");
      setDescription("");
      setCategory("");
      setTags([]);
    } catch (error: any) {
      console.log(error);
      // showAlert("Error", error.message || "Something went wrong", "error");
      showAlert(
        "Error",
        error instanceof Error ? error.message : "Something went wrong",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="bg-black">
        <div className="min-h-screen md:w-[45%] mx-auto bg-black text-white pb-10 px-5 pt-6">
          <h1 className="text-2xl md:text-3xl font-black tracking-wide mb-5">
            UPLOAD{" "}
            <span className="text-orange-600">
              VIDEO
            </span>
          </h1>

          <div
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="relative border border-dashed border-zinc-700 rounded-3xl h-[180px] md:h-[210px] flex flex-col items-center justify-center overflow-hidden cursor-pointer bg-zinc-950"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/mp4,video/webm"
              hidden
              onChange={handleFileChange}
            />

            {preview ? (
              mediaType === "video" ||
                mediaType === "reel" ? (
                <video
                  src={preview}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <>
                <UploadCloud
                  size={60}
                  className="text-zinc-700 mb-4"
                />

                <p className="text-zinc-400 text-sm md:text-lg">
                  Tap to upload or drag file
                  here
                </p>

                <p className="text-zinc-600 text-xs md:text-sm mt-2">
                  Images up to 10MB • Videos up to 50MB
                </p>
              </>
            )}
          </div>

          <div className="mt-10">
            <label className="text-zinc-400 text-sm font-black tracking-[3px] block mb-4">
              TITLE
            </label>

            <input
              type="text"
              placeholder="Give it a name..."
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="w-full h-14 bg-zinc-950 border border-zinc-800 rounded-xl px-5 outline-none text-white text-xs"
            />
          </div>

          <div className="mt-8">
            <label className="text-zinc-400 text-sm font-black tracking-[3px] block mb-4">
              DESCRIPTION
            </label>

            <textarea
              placeholder="What's the build?"
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              className="w-full h-[140px] bg-zinc-950 border border-zinc-800 rounded-xl p-5 outline-none resize-none text-white text-xs"
            />
          </div>

          <div className="mt-8">
            <label className="text-zinc-400 text-sm font-black tracking-[3px] block mb-4">
              CATEGORY
            </label>

            <div className="relative">
              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
                className="w-full h-14 appearance-none bg-zinc-950 border border-zinc-800 rounded-xl px-5 outline-none text-zinc-400 text-xs"
              >
                <option value="">
                  Select a category
                </option>

                {categories.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={20}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
              />
            </div>
          </div>

          <div className="mt-8">
            <label className="text-zinc-400 text-sm font-black tracking-[3px] block mb-4">
              QUICK TAGS
            </label>

            <div className="flex flex-wrap gap-1">
              {quickTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() =>
                    toggleTag(tag)
                  }
                  className={`px-3 h-7 md:px-5 md:h-11 rounded-full border text-xs md:text-sm ${tags.includes(tag)
                    ? "bg-orange-600 border-orange-600 text-white"
                    : "border-zinc-700 text-zinc-400"
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handlePublish}
            disabled={loading}
            className="w-full h-10 md:h-14 bg-orange-700 hover:bg-orange-600 disabled:opacity-50 transition-all rounded-xl font-black text-sm md:text-lg mt-12"
          >
            {loading
              ? "PUBLISHING..."
              : "PUBLISH VIDEO"}
          </button>
        </div>
      </main>

      {/* CUSTOM ALERT */}
      {alertOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm animate-[popup_.25s_ease] rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl font-bold text-white ${alertType === "success"
                  ? "bg-green-600"
                  : "bg-red-600"
                  }`}
              >
                {alertType === "success"
                  ? "✓"
                  : "!"}
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                {alertTitle}
              </h2>

              <p className="mt-3 text-sm text-zinc-300">
                {alertMessage}
              </p>

              <button
                onClick={closeAlert}
                className={`mt-6 w-full rounded-xl py-3 font-semibold text-white transition ${alertType === "success"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
                  }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes popup {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}