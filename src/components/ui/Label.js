export default function Label({ children, className = "" }) {
  return <label className={`text-sm text-gray-600 ${className}`}>{children}</label>;
}
