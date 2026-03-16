const NOVA_LOGO_URL = "https://nova.vandy.ro/nova-logo-icon.png";

function layout(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>NOVA</title>
</head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <!-- Logo -->
        <tr><td align="center" style="padding-bottom:32px;">
          <img src="${NOVA_LOGO_URL}" alt="NOVA" width="48" height="48" style="border-radius:12px;" />
        </td></tr>
        <!-- Card -->
        <tr><td style="background:#18181b;border-radius:16px;border:1px solid #27272a;padding:40px 32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td align="center" style="padding-top:24px;">
          <p style="margin:0;font-size:12px;color:#52525b;">
            NOVA AI DEVELOPMENT SRL &middot; <a href="https://nova.vandy.ro" style="color:#7c3aed;text-decoration:none;">nova.vandy.ro</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function cta(text: string, href: string) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="padding-top:24px;">
    <tr><td align="center">
      <a href="${href}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#7c3aed,#3b82f6);color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:999px;">
        ${text} &rarr;
      </a>
    </td></tr>
  </table>`;
}

function heading(text: string) {
  return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#fafafa;">${text}</h1>`;
}

function paragraph(text: string) {
  return `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#a1a1aa;">${text}</p>`;
}

function divider() {
  return `<hr style="border:none;border-top:1px solid #27272a;margin:24px 0;" />`;
}

function infoRow(label: string, value: string) {
  return `<tr>
    <td style="padding:6px 0;font-size:13px;color:#71717a;width:140px;vertical-align:top;">${label}</td>
    <td style="padding:6px 0;font-size:13px;color:#e4e4e7;vertical-align:top;">${value}</td>
  </tr>`;
}

export function welcomeEmail(name: string | null, dashboardUrl: string) {
  const displayName = name || "there";
  return layout(
    heading(`Welcome to NOVA, ${displayName}!`) +
    paragraph("Your account is ready. You now have access to the AI-powered app builder that turns your ideas into real, deployed applications.") +
    paragraph("Here's what you can do:") +
    `<table cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      <tr><td style="padding:4px 0;font-size:14px;color:#d4d4d8;">&#x2726;&nbsp; Chat with NOVA to plan and build apps</td></tr>
      <tr><td style="padding:4px 0;font-size:14px;color:#d4d4d8;">&#x2726;&nbsp; Get AI-generated code and deployments</td></tr>
      <tr><td style="padding:4px 0;font-size:14px;color:#d4d4d8;">&#x2726;&nbsp; Order custom builds from our senior team</td></tr>
    </table>` +
    cta("Go to Dashboard", dashboardUrl) +
    divider() +
    paragraph("Need help? Just reply to this email — a real human will get back to you.")
  );
}

export function orderConfirmationEmail(
  name: string | null,
  projectName: string,
  dashboardUrl: string
) {
  const displayName = name || "there";
  return layout(
    heading("We've received your project brief!") +
    paragraph(`Hi ${displayName}, your project <strong style="color:#fafafa;">"${projectName}"</strong> has been submitted successfully.`) +
    paragraph("Here's what happens next:") +
    `<table cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      <tr><td style="padding:6px 0;font-size:14px;color:#d4d4d8;"><strong style="color:#7c3aed;">1.</strong>&nbsp; Our senior team reviews your brief (within 24h)</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#d4d4d8;"><strong style="color:#7c3aed;">2.</strong>&nbsp; We start building your project</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#d4d4d8;"><strong style="color:#7c3aed;">3.</strong>&nbsp; Track progress from your dashboard</td></tr>
    </table>` +
    cta("Track Progress", dashboardUrl) +
    divider() +
    paragraph("Questions? Reply to this email anytime.")
  );
}

export function orderNotificationEmail(
  userName: string | null,
  userEmail: string,
  projectName: string,
  description: string,
  references: string | null,
  packageType: string | null,
  stripeSessionId: string | null
) {
  const details = [
    infoRow("Client", userName || "N/A"),
    infoRow("Email", userEmail),
    infoRow("Project", projectName),
    packageType ? infoRow("Package", packageType) : "",
    stripeSessionId ? infoRow("Stripe Session", stripeSessionId) : "",
  ].join("");

  return layout(
    heading("New Project Order") +
    paragraph("A client has submitted a new project brief.") +
    divider() +
    `<table cellpadding="0" cellspacing="0" width="100%">${details}</table>` +
    divider() +
    `<p style="margin:0 0 4px;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">Description</p>` +
    `<p style="margin:0 0 16px;font-size:13px;color:#d4d4d8;line-height:1.6;white-space:pre-wrap;">${description}</p>` +
    (references
      ? `<p style="margin:0 0 4px;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.05em;">References</p>` +
        `<p style="margin:0;font-size:13px;color:#d4d4d8;line-height:1.6;white-space:pre-wrap;">${references}</p>`
      : "")
  );
}
