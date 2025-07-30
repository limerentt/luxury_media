# Authentication Setup Guide

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# NextAuth.js Configuration
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Configuration  
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Node Environment
NODE_ENV=development
```

## Google OAuth Setup

1. **Go to Google Cloud Console**: Visit [Google Cloud Console](https://console.cloud.google.com/)

2. **Create a New Project** (or select existing):
   - Click "Select a project" → "New Project"
   - Enter project name: "Luxury Account"
   - Click "Create"

3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" 
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Name: "Luxury Account Web Client"
   
5. **Configure Authorized URLs**:
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://yourdomain.com` (for production)
   
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://yourdomain.com/api/auth/callback/google` (for production)

6. **Copy Credentials**:
   - Copy the "Client ID" and "Client Secret"
   - Add them to your `.env.local` file

## Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use this online generator: https://generate-secret.vercel.app/32

## Testing Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit: http://localhost:3000/en

3. Click "Sign In" to test Google OAuth

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error**:
   - Check that your redirect URI in Google Console matches exactly: `http://localhost:3000/api/auth/callback/google`

2. **"invalid_client" error**:
   - Verify your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
   - Make sure there are no extra spaces or newlines

3. **"Access blocked" error**:
   - Your app needs to be verified by Google for production use
   - For development, add test users in Google Console

4. **Session not persisting**:
   - Check that NEXTAUTH_SECRET is set and consistent
   - Clear browser cookies and try again

### Security Notes:

- Never commit `.env.local` to version control
- Use different OAuth credentials for development and production
- Rotate secrets regularly in production
- Consider using OAuth scopes to limit access

## File Structure Created:

- `src/lib/auth.ts` - NextAuth configuration
- `src/app/api/auth/[...nextauth]/route.ts` - API routes
- `src/components/providers/session-provider.tsx` - Session provider
- `src/components/auth/login-button.tsx` - Login component
- `src/components/auth/user-menu.tsx` - User menu component
- `src/components/auth/signin-form.tsx` - Sign in form
- `src/app/[locale]/auth/signin/page.tsx` - Sign in page 