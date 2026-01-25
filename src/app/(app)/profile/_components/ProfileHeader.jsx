"use client";

import { MoreVertical } from "lucide-react";

export default function ProfileHeader({ title = "Profile & Settings", subtitle = "" }) {
  return (
    <div className="mb-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-black">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-black/60">{subtitle}</p> : null}
        </div>

        <button className="p-2 hover:bg-black/5 rounded-full transition-colors" aria-label="Menu">
          <MoreVertical className="h-5 w-5 text-black/60" />
        </button>
      </div>
    </div>
  );
}
