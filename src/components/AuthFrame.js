export default function AuthFrame({ children }) {
  return (
    <main className="min-h-dvh grid place-items-center px-4 relative overflow-hidden">
      {/* фон за контентом */}
      <div className="absolute inset-0 -z-10 bg-liquid-warm bg-liquid-soft"></div>
      {children}
    </main>
  );
}
