import Collaborator from "@/components/settings/Collaborator";

export default async function Collaborate({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  await params; // planId derived inside Collaborator via pathname
  return <Collaborator />;
}
