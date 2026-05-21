export default function Button({ as="button", variant="primary", className="", children, ...props }) {
  const Comp = as;
  const base =
    "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition";
  const variants = {
    primary: "text-white shadow-card bg-[#74AA9C] hover:bg-blue-600 active:opacity-90",
    ghost:   "text-gray-700 hover:bg-gray-100",
    dark:    "text-white bg-gray-900 hover:bg-black"
  };
  return (
    <Comp className={[base, variants[variant] || variants.primary, className].join(" ")} {...props}>
      {children}
    </Comp>
  );
}
