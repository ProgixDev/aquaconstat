import { env } from "@/core/env";
import { safeEqual } from "@/lib/admin-session";
import { purgeExpiredDossiers } from "@/lib/dossiers";

/**
 * RGPD retention sweep, triggered by a scheduler (Vercel Cron, pg_cron + pg_net,
 * or any cron that can POST). It cannot be a pure SQL job: Supabase forbids
 * deleting `storage.objects` directly, so photos must go through the Storage
 * API — i.e. server code. See src/lib/dossiers/retention.ts.
 *
 * Fails closed: with no CRON_SECRET the route refuses everything, so an
 * unconfigured deployment can never be swept by a stranger.
 */

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  const secret = env.CRON_SECRET;
  if (!secret) return new Response("Retention not configured.", { status: 503 });

  const header = request.headers.get("authorization") ?? "";
  const prefix = "Bearer ";
  // Constant-time compare — a plain !== leaks the secret one byte at a time.
  const presented = header.startsWith(prefix) ? header.slice(prefix.length) : "";
  if (!(await safeEqual(presented, secret))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await purgeExpiredDossiers();
  return Response.json(result);
}
