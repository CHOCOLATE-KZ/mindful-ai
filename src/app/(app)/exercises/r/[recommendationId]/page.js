import GeneratedTestRunner from "./GeneratedTestRunner";

export default async function GeneratedTestPage(props) {
  const params = await props.params;
  const recommendationId = params?.recommendationId;
  return <GeneratedTestRunner recommendationId={recommendationId} />;
}
