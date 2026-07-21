import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// `server-only` throws outside an RSC bundle; neutralise it for the node env.
vi.mock("server-only", () => ({}));

const sendMail = vi.fn(async () => ({ messageId: "id" }));
const createTransport = vi.fn(() => ({ sendMail }));
vi.mock("nodemailer", () => ({ default: { createTransport }, createTransport }));

const resendSend = vi.fn(async () => ({ error: null }));
// A plain function, not an arrow — email.ts calls `new Resend(...)`.
vi.mock("resend", () => ({
  Resend: vi.fn(function () {
    return { emails: { send: resendSend } };
  }),
}));

// `isEmailLive`/`DEFAULT_FROM` are decided at module load from env, so each case
// re-imports the module with a fresh mocked env.
async function loadEmail(overrides: Record<string, unknown>) {
  vi.resetModules();
  vi.doMock("@/core/env", () => ({ env: { SMTP_PORT: 587, ...overrides } }));
  return import("./email");
}

const msg = { to: "camille@example.com", subject: "s", html: "<p>h</p>", text: "t" };

beforeEach(() => {
  vi.clearAllMocks();
});
afterEach(() => {
  vi.doUnmock("@/core/env");
});

describe("sendEmail — provider seam", () => {
  const smtp = {
    SMTP_HOST: "smtp.gmail.com",
    SMTP_USER: "nino@olala.fr",
    SMTP_PASSWORD: "app-password",
  };

  it("sends over SMTP when SMTP_* are set (client, 2026-07-21)", async () => {
    const { sendEmail, isEmailLive } = await loadEmail({ ...smtp, SMTP_PORT: 587 });
    expect(isEmailLive).toBe(true);
    const res = await sendEmail(msg);
    expect(res.delivered).toBe(true);
    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // 587 ⇒ STARTTLS
        auth: { user: "nino@olala.fr", pass: "app-password" },
      }),
    );
    // From defaults to the SMTP user when EMAIL_FROM is unset.
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: msg.to, from: "nino@olala.fr" }),
    );
    expect(resendSend).not.toHaveBeenCalled();
  });

  it("uses implicit TLS on port 465", async () => {
    const { sendEmail } = await loadEmail({ ...smtp, SMTP_PORT: 465 });
    await sendEmail(msg);
    expect(createTransport).toHaveBeenCalledWith(expect.objectContaining({ secure: true }));
  });

  it("prefers SMTP over Resend when both are configured", async () => {
    const { sendEmail } = await loadEmail({ ...smtp, SMTP_PORT: 587, RESEND_API_KEY: "re_abc123" });
    await sendEmail(msg);
    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(resendSend).not.toHaveBeenCalled();
  });

  it("falls back to Resend when only its key is set", async () => {
    const { sendEmail, isEmailLive } = await loadEmail({ RESEND_API_KEY: "re_abc123" });
    expect(isEmailLive).toBe(true);
    const res = await sendEmail(msg);
    expect(res.delivered).toBe(true);
    expect(resendSend).toHaveBeenCalledTimes(1);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("logs instead of sending when nothing is configured (simulation)", async () => {
    const { sendEmail, isEmailLive } = await loadEmail({});
    expect(isEmailLive).toBe(false);
    const res = await sendEmail(msg);
    expect(res.delivered).toBe(false);
    expect(sendMail).not.toHaveBeenCalled();
    expect(resendSend).not.toHaveBeenCalled();
  });
});
