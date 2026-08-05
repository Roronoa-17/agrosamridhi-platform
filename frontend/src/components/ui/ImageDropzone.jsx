import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";

export default function ImageDropzone({ file, onChange, accept = "image/*" }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const previewUrl = file ? URL.createObjectURL(file) : null;

  const handleFiles = (files) => {
    if (files?.[0]) onChange(files[0]);
  };

  if (previewUrl) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-black/10">
        <img src={previewUrl} alt="Selected upload" className="h-64 w-full object-cover" />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/70"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
        dragOver ? "border-brand-400 bg-brand-50" : "border-black/10 bg-white hover:bg-slate-50"
      }`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <UploadCloud size={22} />
      </div>
      <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
      <p className="text-xs text-slate-400">PNG or JPG</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
