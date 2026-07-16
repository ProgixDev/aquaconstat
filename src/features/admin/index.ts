/**
 * Admin feature — public API (spec 004).
 *
 * Mock data until the backend spec. Note `dossiers` is no longer exported as a
 * value: reads go through getDossiers()/getDossier(), which enforce the admin
 * session (R2R 2026-07-16, ADR-0008).
 */
export { AdminHeader } from "./components/admin-header";
export { LoginForm } from "./components/login-form";
export { DossiersTable } from "./components/dossiers-table";
export { DossierDetail } from "./components/dossier-detail";
export { OverviewBand } from "./components/overview-band";
export { getDossiers, getDossier } from "./data";
export type { DossierRow, DossierDetail as DossierDetailData, DossierStatut } from "./data";
export { requireAdminSession, isAdminAuthenticated } from "./session";
export { adminLoginAction, adminLoginFormAction, adminLogoutAction } from "./actions";
