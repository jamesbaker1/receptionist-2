import NextAuth from "next-auth"

const CLIO_REGION = process.env.CLIO_REGION || "app.clio.com"
const BASE_URL = "http://127.0.0.1:3000"

interface ClioProfile {
  data: {
    id: number;
    name: string;
    email_address: string;
    avatar_url?: string;
    role?: string;
    firm?: {
      id: number;
      name: string;
    };
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    {
      id: "clio",
      name: "Clio",
      type: "oauth",
      authorization: {
        url: `https://${CLIO_REGION}/oauth/authorize`,
        params: {
          scope: "read write",
          response_type: "code",
          redirect_uri: `${BASE_URL}/api/auth/callback/clio`,
        },
      },
      token: `https://${CLIO_REGION}/oauth/token`,
      userinfo: `https://${CLIO_REGION}/api/v4/users/who_am_i`,
      clientId: process.env.CLIO_CLIENT_ID,
      clientSecret: process.env.CLIO_CLIENT_SECRET,
      profile(profile: ClioProfile) {
        return {
          id: profile.data.id.toString(),
          name: profile.data.name,
          email: profile.data.email_address,
          image: profile.data.avatar_url,
          // Clio-specific fields
          clioId: profile.data.id.toString(),
          firmId: profile.data.firm?.id?.toString(),
          firmName: profile.data.firm?.name,
          role: profile.data.role,
        }
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Store Clio tokens and user data
      if (account?.provider === "clio") {
        const clioProfile = profile as unknown as ClioProfile;
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        token.clioId = clioProfile?.data?.id?.toString()
        token.firmId = clioProfile?.data?.firm?.id?.toString()
        token.firmName = clioProfile?.data?.firm?.name
        token.clioRegion = CLIO_REGION
      }
      return token
    },
    async session({ session, token }) {
      // Make Clio data available in session
      if (token) {
        session.accessToken = token.accessToken as string
        session.refreshToken = token.refreshToken as string
        session.user.clioId = token.clioId as string
        session.user.firmId = token.firmId as string
        session.user.firmName = token.firmName as string
        session.clioRegion = token.clioRegion as string
      }
      return session
    },
    async redirect({ url }) {
      // Force use of 127.0.0.1 instead of localhost - this is the key fix
      const correctedBaseUrl = BASE_URL
      
      // Always redirect to the corrected base URL
      if (url.startsWith("/")) return `${correctedBaseUrl}${url}`
      if (url.startsWith(correctedBaseUrl)) return url
      
      // For any external URLs or OAuth callbacks, ensure we use our base URL
      try {
        const urlObj = new URL(url)
        if (urlObj.pathname.startsWith("/auth/") || urlObj.pathname.startsWith("/api/auth/")) {
          return `${correctedBaseUrl}${urlObj.pathname}${urlObj.search}`
        }
      } catch {
        // Invalid URL, fall back to dashboard
      }
      
      return `${correctedBaseUrl}/dashboard`
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
}) 