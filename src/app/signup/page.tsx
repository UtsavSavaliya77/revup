"use client";

import React, { useState } from "react";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("error");

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

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
  
    if (alertType === "success") {
      window.location.replace("/feed");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.username ||
      !formData.email ||
      !formData.password
    ) {
      showAlert("Error", "Please fill all fields", "error");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        showAlert(
          "Error",
          data.message || "Signup failed",
          "error"
        );
        return;
      }

      showAlert(
        "Success",
        data.message || "Account created successfully",
        "success"
      );
    } catch (error) {
      console.log(error);

      showAlert(
        "Error",
        "Something went wrong",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <form
          noValidate
          onSubmit={handleSignup}
          className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 space-y-5"
        >
          <h1 className="text-center text-3xl font-bold">
            RevUp Signup
          </h1>

          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-lg bg-zinc-800 p-3 outline-none focus:border-red-500 border border-transparent"
          />

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full rounded-lg bg-zinc-800 p-3 outline-none focus:border-red-500 border border-transparent"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-lg bg-zinc-800 p-3 outline-none focus:border-red-500 border border-transparent"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-lg bg-zinc-800 p-3 outline-none focus:border-red-500 border border-transparent"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-red-600 p-3 font-semibold transition hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
          <div className="pt-2 text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                window.location.href = "/login";
              }}
              className="font-semibold text-red-500 hover:text-red-400"
            >
              Login
            </button>
          </div>
        </form>
      </div>

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
                {alertType === "success" ? "✓" : "!"}
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