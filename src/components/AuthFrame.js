export default function AuthFrame({ children }) {
  return (
    <main className="min-h-dvh grid place-items-center px-4 relative overflow-hidden bg-slate-50">
      {children}
    </main>
  );
}
