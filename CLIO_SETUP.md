# Clio OAuth Integration Setup Guide

## ✅ Completed Steps

The following has been implemented for you:

1. **NextAuth Configuration** - Auth system with Clio OAuth provider (Fixed v5 compatibility)
2. **Type Definitions** - TypeScript types for session data
3. **API Routes** - NextAuth handlers and Clio API endpoints
4. **UI Components** - Sign-in, error pages, and dashboard updates
5. **Auth Guards** - Protected routes and session management
6. **Clio Client** - API client for Clio integration
7. **Flow Builder Integration** - Clio tools in the flow builder
8. **Client SessionProvider** - Fixed React Context issues with server components

## 🔧 Next Steps (Required)

### 1. Environment Configuration

Create/update your `.env.local` file with these variables:

```env
# Clio OAuth Configuration
CLIO_CLIENT_ID=your_clio_client_id
CLIO_CLIENT_SECRET=your_clio_client_secret
CLIO_REGION=app.clio.com  # or ca/eu/au.app.clio.com

# NextAuth Configuration
NEXTAUTH_SECRET=psGyNT9pEDcxbu4KYpFFmvBUkBP4R8WfHyzUzTHXb9s=
NEXTAUTH_URL=http://localhost:3000
```

**Note**: I've generated a secure NextAuth secret for you above. You can use it or generate your own with:
```bash
openssl rand -base64 32
```

### 2. Register Application with Clio

1. Go to [Clio Developer Portal](https://developers.clio.com/)
2. Create a new application with:
   - **Name**: Lua AI Assistant
   - **Redirect URI**: `http://localhost:3000/api/auth/callback/clio`
   - **Scopes**: `read write` (or specific scopes you need)
3. Note the Client ID and Secret and add them to your `.env.local`

### 3. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/auth/signin`
3. Click "Continue with Clio"
4. Complete the OAuth flow
5. You should be redirected to the dashboard with your Clio user info

## 🛠️ Recent Fixes

### React Context Error Fix
Fixed the "React Context is unavailable in Server Components" error by:
- Creating a client component wrapper for SessionProvider
- Updating NextAuth configuration to use v5 API patterns
- Properly separating server and client components

## 🎯 Features Implemented

### Authentication
- ✅ Clio OAuth provider
- ✅ JWT session management
- ✅ Protected routes
- ✅ User profile data (name, email, firm)
- ✅ Sign-out functionality

### Dashboard
- ✅ User welcome message with firm name
- ✅ Avatar with user initials/image
- ✅ Profile dropdown with sign-out
- ✅ Authentication guard

### Flow Builder
- ✅ Clio integration tool
- ✅ Session-aware configuration
- ✅ Contact/matter/task creation options
- ✅ Connect account prompt for unauthenticated users

### API Integration
- ✅ Clio API client
- ✅ Contacts endpoint
- ✅ Session-based authentication
- ✅ Error handling

## 🚀 Production Deployment

For production deployment:

1. Update environment variables:
   ```env
   CLIO_REDIRECT_URI=https://yourdomain.com/api/auth/callback/clio
   NEXTAUTH_URL=https://yourdomain.com
   ```

2. Update Clio app redirect URI in Developer Portal
3. Deploy to your hosting platform
4. Test production OAuth flow

## 🔍 File Structure

```
├── app/
│   ├── api/auth/[...nextauth]/route.ts    # NextAuth API route
│   ├── api/clio/contacts/route.ts         # Clio contacts API
│   ├── auth/signin/page.tsx               # Sign-in page
│   ├── auth/error/page.tsx                # Auth error page
│   ├── dashboard/page.tsx                 # Updated dashboard
│   └── layout.tsx                         # Updated with ClientSessionProvider
├── lib/
│   ├── auth.ts                            # NextAuth configuration (v5)
│   ├── clio-client.ts                     # Clio API client
│   └── clio-session.ts                    # Session helpers
├── hooks/
│   └── use-auth.ts                        # Auth guard hook
├── types/
│   └── next-auth.d.ts                     # NextAuth type extensions
├── components/
│   ├── providers/
│   │   └── session-provider.tsx          # Client SessionProvider wrapper
│   └── flow-builder/
│       └── step-4-tool-calls.tsx         # Updated with Clio integration
```

## 🐛 Troubleshooting

### Common Issues

1. **OAuth Error**: Check redirect URI matches exactly
2. **Session Issues**: Verify NEXTAUTH_SECRET is set
3. **API Errors**: Ensure Clio scopes are correct
4. **Type Errors**: Restart TypeScript server after adding types
5. **React Context Error**: Fixed with ClientSessionProvider wrapper

### Debug Mode

Add this to your `.env.local` for detailed NextAuth logs:

```env
NEXTAUTH_DEBUG=true
```

## 📚 Next Enhancements

Consider implementing:

- Database session storage with Prisma
- Token refresh handling
- Webhook integration for real-time sync
- Error monitoring and logging
- Advanced Clio API features (practice areas, custom fields) 