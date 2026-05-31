export function inviteEmailTemplate({ firstName, registrationUrl }: { firstName: string; registrationUrl: string }) {
  const year = new Date().getFullYear()
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>JAMB CBT – Your Registration Link</title></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,100,0,.1);overflow:hidden;">
<tr><td style="background:linear-gradient(135deg,#15803d,#166534);padding:32px 40px;text-align:center;">
<p style="margin:0;font-size:40px;">🇳🇬</p>
<h1 style="margin:12px 0 4px;color:#fff;font-size:22px;font-weight:900;">JAMB CBT Portal</h1>
<p style="margin:0;color:#bbf7d0;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Unified Tertiary Matriculation Examination</p>
</td></tr>
<tr><td style="padding:36px 40px;">
<p style="margin:0 0 16px;font-size:15px;color:#374151;">Hello <strong>${firstName}</strong>,</p>
<p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
You have been invited to register for the <strong>JAMB CBT Practice Platform</strong>. Click the button below to create your account, choose your subject combination, and sit your timed practice exam.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
<tr><td align="center">
<a href="${registrationUrl}" style="display:inline-block;background:#15803d;color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:10px;box-shadow:0 2px 10px rgba(21,128,61,.3);">
📝 Register for CBT Exam →
</a>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
<tr><td>
<p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:.5px;">What to expect</p>
<table cellpadding="0" cellspacing="0">
${[['📋','Fill in your personal details and JAMB reg number'],['📚','Choose Science, Commercial, or Arts combination'],['⏱️','30-minute timed exam — just like the real JAMB CBT'],['📊','Instant score out of 400 with full subject breakdown']].map(([i,t])=>`<tr><td style="padding:3px 8px 3px 0;font-size:18px;vertical-align:top;">${i}</td><td style="padding:3px 0;font-size:13px;color:#374151;line-height:1.5;">${t}</td></tr>`).join('')}
</table>
</td></tr></table>
<p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">If the button doesn't work, copy this link into your browser:</p>
<p style="margin:0;font-size:12px;"><a href="${registrationUrl}" style="color:#15803d;word-break:break-all;">${registrationUrl}</a></p>
</td></tr>
<tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
<p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">© ${year} JAMB CBT Practice Platform · Nigeria</p>
<p style="margin:0;font-size:11px;color:#d1d5db;">This email was sent because you requested access to the CBT portal.</p>
</td></tr>
</table></td></tr></table>
</body></html>`

  const text = `Hello ${firstName},\n\nYou're invited to register for the JAMB CBT practice platform.\n\nRegister here: ${registrationUrl}\n\n© ${year} JAMB CBT Practice Platform`

  return { subject: '🎓 Your JAMB CBT Registration Link', html, text }
}
