import Image from "next/image";

export default function AuthFrame({ children }) {
  return (
    <main className="min-h-dvh grid place-items-center px-4 relative overflow-hidden pt-[4.5rem]">
      {/* Background wallpaper */}
      <Image
        src="/wallpaper1gpt.png"
        alt=""
        fill
        priority
        quality={85}
        className="object-cover object-center select-none pointer-events-none"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#0d0d14]/65" />
      {/* Content */}
      <div className="relative z-10 w-full flex justify-center py-12">
        {children}
      </div>
    </main>
  );
}
