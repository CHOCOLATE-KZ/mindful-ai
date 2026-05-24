export default function SectionLabel({ children, className = "", light = false }) {
  return (
    <p
      className={[
        "text-xs font-semibold uppercase tracking-[0.18em]",
        light ? "text-[#9fdfd0]" : "text-[#74AA9C]",
        className,
      ].join(" ")}
    >
      {children}
    </p>
  );
}
