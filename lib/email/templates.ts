export function inviteEmailTemplate({
  firstName,
  accessLink,
}: {
  firstName: string
  accessLink: string
}) {
  const year = new Date().getFullYear()

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>JAMB CBT – Your Exam Access</title></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0"
  style="max-width:560px;background:#fff;border-radius:16px;
         box-shadow:0 4px 24px rgba(0,100,0,.10);overflow:hidden;">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#15803d,#166534);
                  padding:32px 40px;text-align:center;">
    <p style="margin:0;font-size:42px;">🇳🇬</p>
    <h1 style="margin:12px 0 4px;color:#fff;font-size:22px;font-weight:900;">
      JAMB CBT Portal
    </h1>
    <p style="margin:0;color:#bbf7d0;font-size:11px;letter-spacing:2px;text-transform:uppercase;">
      Unified Tertiary Matriculation Examination
    </p>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:36px 40px;">

    <p style="margin:0 0 6px;font-size:15px;color:#374151;">
      Hello <strong>${firstName}</strong>,
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.8;">
      Your <strong>JAMB CBT exam access</strong> is ready!
      Click the button below — you will be taken directly to the exam portal
      where you pick your subject combination and start your timed test immediately.
      <br/><strong>No registration or password required.</strong>
    </p>

    <!-- Big CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
    <tr><td align="center">
      <a href="${accessLink}"
        style="display:inline-block;background:#15803d;color:#fff;
               font-size:17px;font-weight:800;text-decoration:none;
               padding:18px 48px;border-radius:12px;
               box-shadow:0 3px 14px rgba(21,128,61,.4);letter-spacing:.3px;">
        🚀 Start My Exam Now
      </a>
    </td></tr></table>

    <!-- Steps -->
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#f0fdf4;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
    <tr><td>
      <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#15803d;
                text-transform:uppercase;letter-spacing:.5px;">
        What happens when you click
      </p>
      <table cellpadding="0" cellspacing="0">
        ${[
          ['1️⃣', 'Choose Science, Commercial, or Arts combination'],
          ['2️⃣', 'Select your 3 elective subjects (English is compulsory)'],
          ['3️⃣', '30-minute timed exam begins — just like real JAMB CBT'],
          ['4️⃣', 'Get your score out of 400 instantly'],
        ].map(([n, t]) => `
        <tr>
          <td style="padding:5px 12px 5px 0;font-size:20px;vertical-align:top;">${n}</td>
          <td style="padding:5px 0;font-size:13px;color:#374151;line-height:1.6;">${t}</td>
        </tr>`).join('')}
      </table>
    </td></tr></table>

    <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">
      Link not working? Copy and paste into your browser:
    </p>
    <p style="margin:0 0 16px;font-size:12px;">
      <a href="${accessLink}" style="color:#15803d;word-break:break-all;">${accessLink}</a>
    </p>
    <p style="margin:0;font-size:12px;color:#d1d5db;">
      ⏳ This link is valid for <strong>7 days</strong>.
    </p>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;
                  border-top:1px solid #e5e7eb;">
    <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">
      © ${year} JAMB CBT Practice Platform · Nigeria
    </p>
    <p style="margin:0;font-size:11px;color:#d1d5db;">
      Do not share this link — it is unique to you.
    </p>
  </td></tr>

</table></td></tr></table>
</body></html>`

  const text = `Hello ${firstName},

Your JAMB CBT exam access is ready. No registration needed — just click the link below, pick your subjects, and start your exam immediately.

${accessLink}

Steps after clicking:
1. Choose Science, Commercial, or Arts combination
2. Select 3 elective subjects
3. 30-minute timed exam starts
4. Get your score out of 400 instantly

This link is valid for 7 days.

© ${year} JAMB CBT Practice Platform · Nigeria`

  return {
    subject: '🎓 Your JAMB CBT Exam is Ready — Start Now',
    html,
    text,
  }
}
