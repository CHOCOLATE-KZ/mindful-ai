"use client";
import { ThreeDot } from "react-loading-indicators";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center">
      {/* мягкая подложка */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/40" />
      {/* сам лоадер */}
      <div className="relative rounded-3xl bg-white/90 px-8 py-6 shadow-card ring-1 ring-black/5">
        <ThreeDot
          color={["#7c3aed", "#2563eb", "#22c55e", "#f59e0b"]} // плавная смена цветов
          size="large"
          text="Loading..."
          textColor="#475569"
        />
      </div>
    </div>
  );
}
