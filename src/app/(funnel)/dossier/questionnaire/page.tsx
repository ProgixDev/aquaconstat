import type { Metadata } from "next";
import { QuestionnaireForm, StepShell } from "@/features/funnel";

export const metadata: Metadata = {
  title: "Étape 2 · Questionnaire dégât des eaux",
};

export default function QuestionnairePage() {
  return (
    <StepShell step={2}>
      <QuestionnaireForm />
    </StepShell>
  );
}
