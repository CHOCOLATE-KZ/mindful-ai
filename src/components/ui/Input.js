export default function Input(props) {
  const { className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={
        "w-full rounded-2xl border px-3 py-2 text-[15px] outline-none " +
        "focus:ring-2 focus:ring-blue-300 " +
        (className ||
          "border-[color:var(--ring)] bg-white text-gray-900 " +
          "placeholder:text-gray-400")
      }
    />
  );
}
