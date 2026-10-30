"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { uploadMedia } from "./rich-editor";

/** Campo de imagen: subir archivo o pegar URL, con vista previa. */
export function MediaField({ name, defaultValue = "" }: { name: string; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  const [progress, setProgress] = useState<number | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function onFile(file?: File) {
    if (!file) return;
    try {
      setProgress(0);
      setValue(await uploadMedia(file, setProgress));
    } catch (e) {
      alert(`No se pudo subir la imagen: ${(e as Error).message}`);
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input name={name} value={value} onChange={(e) => setValue(e.target.value)} placeholder="https://… o sube un archivo" className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-ink outline-none focus:border-brand" />
        <button type="button" onClick={() => input.current?.click()} className="flex shrink-0 items-center gap-1.5 rounded-xl bg-nav px-4 text-sm text-white hover:bg-brand">
          <Upload className="h-4 w-4" /> {progress !== null ? `${Math.round(progress)}%` : "Subir"}
        </button>
        <input ref={input} type="file" accept="image/*" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
      {value && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="max-h-40 rounded-xl border border-black/10" />
          <button type="button" onClick={() => setValue("")} title="Quitar" className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-nav text-white hover:bg-red-600">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
