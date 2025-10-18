import CurrencySelector from "@/components/settings/CurrencySelector";
import DangerZone from "@/components/settings/DangerZone";
import DisplayName from "@/components/settings/DisplayName";

export default async function PlanSettings({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  return (
    <section className="flex flex-col gap-5">
      <CurrencySelector planId={planId} />
      <DisplayName />
      <DangerZone planId={planId} />
    </section>
  );
}
