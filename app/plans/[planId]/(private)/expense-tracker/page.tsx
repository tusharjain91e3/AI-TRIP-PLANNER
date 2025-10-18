import ExpenseSection from "@/components/expenseTracker/ExpenseSection";

export default async function ExpenseTracker({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;

  return <ExpenseSection planId={planId} />;
}
