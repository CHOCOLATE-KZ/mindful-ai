export default function Input(props) {
  const { className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={
        "w-full rounded-2xl border px-3 py-2 text-[15px] outline-none " +
        "focus:ring-2 focus:ring-blue-300 " +
        (className ||
          "border-[color:var(--ring)] bg-white dark:bg-[rgb(28_28_40)] text-gray-900 dark:text-slate-100 " +
          "placeholder:text-gray-400 dark:placeholder:text-slate-500 " +
          "dark:border-white/[0.10] dark:focus:ring-blue-500/30 dark:focus:border-blue-400/50")
      }
    />
  );
}
