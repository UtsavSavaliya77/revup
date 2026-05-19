"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("error");

  const [formData, setFormData] = useState({
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
      router.push("/feed");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      showAlert(
        "Error",
        "Please fill all fields",
        "error"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showAlert(
          "Error",
          data.message || "Login failed",
          "error"
        );
        return;
      }

      showAlert(
        "Success",
        data.message || "Login successful",
        "success"
      );

      console.log(data);
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
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 space-y-5"
        >
          <h1 className="text-3xl font-bold text-center">
            RevUp Login
          </h1>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-zinc-800 outline-none border border-transparent focus:border-red-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-zinc-800 outline-none border border-transparent focus:border-red-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 p-3 rounded-lg font-semibold transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* SIGNUP REDIRECT */}
          <div className="text-center text-sm text-zinc-400 pt-2">
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="text-red-500 hover:text-red-400 font-semibold"
            >
              Signup
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
                className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl font-bold text-white ${
                  alertType === "success"
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
                className={`mt-6 w-full rounded-xl py-3 font-semibold text-white transition ${
                  alertType === "success"
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