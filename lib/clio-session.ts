import { auth } from "@/lib/auth"
import { ClioClient } from "@/lib/clio-client"
import { Session } from "next-auth"

export async function getClioClient(): Promise<ClioClient | null> {
  const session = await auth()
  
  if (!session?.accessToken || !session?.clioRegion) {
    return null
  }

  return new ClioClient(session.accessToken, session.clioRegion)
}

// For client-side usage
export function useClioClient(session: Session | null): ClioClient | null {
  if (!session?.accessToken || !session?.clioRegion) {
    return null
  }

  return new ClioClient(session.accessToken, session.clioRegion)
} 