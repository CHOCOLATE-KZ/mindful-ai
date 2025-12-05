export default function Input(props) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-2xl border border-[color:var(--ring)] px-3 py-2 text-[15px] outline-none " +
        "focus:ring-2 focus:ring-violet-300 bg-white " + (props.className||"")
      }
    />
  );
}
