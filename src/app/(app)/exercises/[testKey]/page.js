import { Suspense } from "react";
import TestRunner from "./TestRunner";

function TestLoading() {
  return <div className="mx-auto max-w-2xl p-6 text-center text-slate-600">Загрузка теста…</div>;
}

export default async function TestPage(props) {
  const params = await props.params;
  const testKey = params?.testKey;

  return (
    <Suspense fallback={<TestLoading />}>
      <TestRunner testKey={testKey} />
    </Suspense>
  );
}