export default function Input(props) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-2xl border border-[color:var(--ring)] px-3 py-2 text-[15px] outline-none " +
        "bg-white dark:bg-[rgb(28_28_40)] text-gray-900 dark:text-slate-100 " +
        "placeholder:text-gray-400 dark:placeholder:text-slate-500 " +
        "dark:border-white/[0.10] " +
        "focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500/30 dark:focus:border-blue-400/50 " +
        (props.className||"")
      }
    />
  );
}
