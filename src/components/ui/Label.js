export default function Label({ children, className = "" }) {
  return <label className={`text-sm text-gray-600 dark:text-slate-400 ${className}`}>{children}</label>;
}
