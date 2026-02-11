# Security Policy

## Environment Variables Security

### ✅ Safe (Public)
These variables are prefixed with `NEXT_PUBLIC_` and are **intentionally** exposed to the browser:
- `NEXT_PUBLIC_GOOGLE_CALENDAR_LINK` - Public booking link

### ⚠️ Secret (Server-only)
These variables are **NEVER** exposed to the browser and only accessible in API routes:
- `ANTHROPIC_API_KEY` - Claude AI API key
- `RESEND_API_KEY` - Email sending API key
- `NOVA_REPORTS_EMAIL` - Internal email address
- `NOVA_REPORTS_FROM_EMAIL` - Sender email address

## Security Measures Implemented

### 1. API Keys Protection
- All secret keys are only accessible in server-side API routes (`/app/api/*`)
- Never used in client components
- Never logged in production builds
- Environment variables are validated before use

### 2. HTTP Security Headers
- `X-Frame-Options: SAMEORIGIN` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: origin-when-cross-origin` - Limits referrer data
- `X-DNS-Prefetch-Control: on` - Optimizes DNS resolution

### 3. Content Security
- Service worker sandboxed
- No inline scripts except for SW registration
- All user input is sanitized
- API routes validate input types

### 4. Rate Limiting (Recommended)
Consider adding rate limiting to API routes:
- `/api/chat` - Limit to 10 requests/minute per IP
- `/api/discovery/report` - Limit to 5 requests/hour per session

### 5. CORS Protection
- API routes only accept requests from same origin
- No CORS headers exposed

## What You See in Browser Inspector

When you open DevTools → Network/Console, you will see:
- ✅ `NEXT_PUBLIC_GOOGLE_CALENDAR_LINK` - This is SAFE, it's a public booking link
- ❌ You should NEVER see `ANTHROPIC_API_KEY` or `RESEND_API_KEY`

If you see secret keys in the browser, contact the development team immediately.

## Reporting Security Issues

If you discover a security vulnerability, please email: security@nova-ai.dev

## Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Rotate keys regularly** - Change API keys every 3-6 months
3. **Use different keys** - Dev/staging/production should have separate keys
4. **Monitor usage** - Check Anthropic/Resend dashboards for unusual activity
5. **Enable 2FA** - On all service accounts (Vercel, Anthropic, Resend, GitHub)

## Vercel Security

On Vercel, environment variables are:
- Encrypted at rest
- Only accessible during build and runtime
- Never exposed in logs or error messages
- Can be scoped per environment (Production/Preview/Development)

## Additional Security Recommendations

1. **Add rate limiting** using Vercel Edge Config or Upstash Redis
2. **Enable Vercel Firewall** for DDoS protection
3. **Add CAPTCHA** on contact form to prevent spam
4. **Monitor logs** for suspicious activity
5. **Set up alerts** for API usage spikes
