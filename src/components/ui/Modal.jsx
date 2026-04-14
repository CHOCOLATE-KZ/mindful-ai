import { cn } from "@/lib/utils/cn";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
          <div className="text-lg font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/[0.04]"
            aria-label="Close"
          >
            
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
