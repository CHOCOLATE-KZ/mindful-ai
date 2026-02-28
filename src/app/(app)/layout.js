// AppShell уже применен в root layout (src/app/layout.js)
// Не нужно дублировать здесь - это вызывает двойные контексты и ошибки навигации

export default function AppSegmentLayout({ children }) {
  return <>{children}</>;
}
