"use client";

import React, { useEffect, useState } from "react";
import { Plus, Zap, ShoppingBag, X } from "lucide-react";

type Build = {
  id: string;
  year: string;
  name: string;
  model: string;
  power: number;
  parts: number;
  image: string;
};

type BuildForm = {
  year: string;
  name: string;
  model: string;
  power: string;
  parts: string;
  image: File | null;
  preview: string;
};

const emptyForm: BuildForm = {
  year: "",
  name: "",
  model: "",
  power: "",
  parts: "",
  image: null,
  preview: "",
};

function AddBuildModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (build: Build) => void;
}) {
  const [form, setForm] = useState<BuildForm>(emptyForm);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.image) {
      alert("Please select an image.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("year", form.year);
      formData.append("name", form.name);
      formData.append("model", form.model);
      formData.append("power", form.power);
      formData.append("parts", form.parts);
      formData.append("image", form.image);

      const res = await fetch("/api/builds", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to create build");
      }

      const newBuild = await res.json();

      onCreated(newBuild);
      setForm(emptyForm);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Build not saved. Check your API/database setup.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-[#111] p-6 text-white shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase">
            Add <span className="text-orange-500">Build</span>
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <input
            className="garage-input"
            placeholder="Year"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
            required
          />

          <input
            className="garage-input"
            placeholder="Brand e.g. Nissan"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <input
            className="garage-input sm:col-span-2"
            placeholder="Model e.g. GT-R R34"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            required
          />

          <input
            className="garage-input"
            placeholder="Power"
            type="number"
            value={form.power}
            onChange={(e) => setForm({ ...form, power: e.target.value })}
            required
          />

          <input
            className="garage-input"
            placeholder="Parts"
            type="number"
            value={form.parts}
            onChange={(e) => setForm({ ...form, parts: e.target.value })}
            required
          />

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-bold uppercase tracking-wide text-slate-400">
              Upload Image
            </label>

            <input
              type="file"
              accept="image/*"
              className="garage-input w-full"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;

                setForm({
                  ...form,
                  image: file,
                  preview: file ? URL.createObjectURL(file) : "",
                });
              }}
              required
            />

            {form.preview && (
              <img
                src={form.preview}
                alt="Preview"
                className="mt-4 h-40 w-full rounded-xl object-cover"
              />
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-orange-600 px-5 py-3 font-black uppercase text-white transition hover:bg-orange-500 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Build"}
        </button>
      </form>
    </div>
  );
}

function AddBuildCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-[290px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-800 bg-[#080808] text-slate-400 transition hover:border-orange-500/80 hover:text-orange-500"
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-900">
        <Plus size={34} />
      </div>

      <span className="text-lg font-black uppercase tracking-tight">
        Add Build
      </span>
    </button>
  );
}

function BuildCard({ build }: { build: Build }) {
  return (
    <article className="group relative min-h-[290px] overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
      <img
        src={build.image}
        alt={`${build.name} ${build.model}`}
        className="absolute inset-0 h-full w-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/95" />

      <div className="relative flex h-full min-h-[290px] flex-col justify-between p-4">
        <span className="w-fit rounded-md bg-neutral-800/90 px-3 py-1 text-sm font-black text-white shadow">
          {build.year}
        </span>

        <div>
          <h2 className="mb-3 text-2xl font-black uppercase tracking-tight text-white">
            {build.name} <span className="text-orange-500">{build.model}</span>
          </h2>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-md border border-neutral-700 bg-black/60 px-2 py-1 text-xs font-bold text-white backdrop-blur">
              <Zap size={14} className="text-orange-500" />
              {build.power}
            </div>

            <div className="flex items-center gap-1 rounded-md border border-neutral-700 bg-black/60 px-2 py-1 text-xs font-bold text-white backdrop-blur">
              <ShoppingBag size={14} className="text-slate-300" />
              {build.parts}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function GaragePage() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function loadBuilds() {
      try {
        const res = await fetch("/api/builds", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch builds");
        }

        const data = await res.json();
        setBuilds(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadBuilds();
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] px-5 py-8 text-white">
      <style jsx global>{`
        .garage-input {
          border: 1px solid #262626;
          border-radius: 12px;
          background: #080808;
          padding: 12px 14px;
          color: white;
          outline: none;
        }

        .garage-input:focus {
          border-color: #f97316;
        }
      `}</style>

      <AddBuildModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(build) => setBuilds((current) => [build, ...current])}
      />

      <div className="mx-auto max-w-lg">
        <header className="mb-8">
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight">
            My <span className="text-orange-500">Garage</span>
          </h1>

          <p className="mt-2 text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-slate-400">
            The Fleet
          </p>
        </header>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <AddBuildCard onClick={() => setModalOpen(true)} />

          {loading ? (
            <p className="text-slate-400">Loading builds...</p>
          ) : (
            builds.map((build) => <BuildCard key={build.id} build={build} />)
          )}
        </section>
      </div>
    </main>
  );
}