/**
 * Funnel feature — public API (spec 003).
 * Étapes 1–4 + confirmation. Source of truth: design/prototype/etape-*.dc.html.
 */
export { FunnelStoreProvider, useFunnelStore } from "./provider";
export { FunnelChrome } from "./components/funnel-chrome";
export { StepShell } from "./components/step-shell";
export { DossierForm } from "./components/dossier-form";
export { QuestionnaireForm } from "./components/questionnaire-form";
export { PhotosForm } from "./components/photos-form";
export { PaiementForm } from "./components/paiement-form";
export { ConfirmationContent } from "./components/confirmation-content";
export { handleStripeWebhook, type WebhookResult } from "./webhook";
