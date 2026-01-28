import TestRunner from "./TestRunner";

/**
 * Серверный компонент страницы теста.
 * Правильно обрабатывает params в Next.js 16+ (params может быть Promise).
 */
export default async function TestPage(props) {
  // В Next.js 16+ params может быть Promise, нужно await
  const params = await props.params;
  const testKey = params?.testKey;

  return <TestRunner testKey={testKey} />;
}