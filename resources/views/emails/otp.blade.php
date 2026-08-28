<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F7FC;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F7FC;padding:40px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #E1E8F0;overflow:hidden;">
                    <tr>
                        <td style="background:#0D1B3E;padding:24px 32px;">
                            <h2 style="margin:0;color:#ffffff;font-size:20px;">{{ $appName }}</h2>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            <h1 style="margin:0 0 12px;color:#0D1B3E;font-size:22px;">Hello {{ $userName }},</h1>
                            <p style="margin:0 0 16px;color:#4B5563;font-size:15px;line-height:1.6;">
                                {{ $purpose === 'new'
                                    ? 'Please use the verification code below to confirm your new email address.'
                                    : 'Please use the verification code below to confirm your current email address.' }}
                            </p>
                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 24px;width:100%;">
                                <tr>
                                    <td align="center" style="background:#F8FAFD;border:1px dashed #C9963A;border-radius:12px;padding:24px;">
                                        <div style="color:#0D1B3E;font-size:36px;font-weight:bold;letter-spacing:8px;font-family:monospace;">{{ $otp }}</div>
                                        <div style="color:#9CA3AF;font-size:13px;margin-top:8px;">This code is valid for <strong>10 minutes</strong>.</div>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin:0 0 16px;color:#4B5563;font-size:14px;line-height:1.6;">
                                If you did not request this verification, you can safely ignore this email.
                            </p>
                            <hr style="border:none;border-top:1px solid #E1E8F0;margin:24px 0;">
                            <p style="margin:0;color:#9CA3AF;font-size:12px;line-height:1.6;">
                                For security, never share this verification code with anyone.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 32px;background:#F8FAFD;border-top:1px solid #E1E8F0;">
                            <p style="margin:0;color:#9CA3AF;font-size:12px;">&copy; {{ date('Y') }} {{ $appName }}. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
