# Staff portal authentication

Staff users sign in at `/portal/login`. After successful authentication, the portal routes agents, property managers, and content editors to role-specific workspaces. Admins continue to use the existing `/admin` portal.

## Password reset email configuration

Configure these backend environment variables before enabling password reset:

```env
FRONTEND_URL=http://localhost:3000
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

Use the SMTP host, port, username, password, and verified sender address supplied by your organization. Keep credentials in the backend environment only; do not add them to source control or frontend environment variables. Use `SMTP_SECURE=true` for implicit TLS (commonly port 465); for STARTTLS, use port 587 with `SMTP_SECURE=false`.

Apply the database migration from the backend directory after deploying the backend changes:

```sh
npm run migration:run
```

Reset links are single-use and expire after 30 minutes. The request endpoint returns a generic success message to avoid revealing whether an email belongs to an account. Until SMTP is configured and the migration has run, the reset flow cannot complete.

Property managers can upload property images and videos from the Properties section of their portal. Their permission is role-based; agents and property owners continue to require the individual media-upload permission.

User accounts, credentials, roles, and agent profile details are managed from the admin Users screen. Apply pending migrations with `npm run migration:run` from the backend directory to merge existing role rows whose names differ only by casing or surrounding whitespace and enforce normalized role-name uniqueness.