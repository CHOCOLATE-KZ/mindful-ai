export default function Card({ className="", children }) {
  return (
    <div
      className={`rounded-[var(--radius)] border border-[color:var(--ring)] bg-[rgb(var(--card))] p-6 shadow-card ${className}`}
    >
      {children}
    </div>
  );
}
