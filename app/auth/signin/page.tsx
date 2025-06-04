"use client"

import { signIn, getSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BriefcaseIcon, Workflow } from "lucide-react"
import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const error = searchParams.get("error")

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.push("/dashboard")
      }
    })
  }, [router])

  const handleClioSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("clio", { 
        callbackUrl: "/dashboard",
        redirect: true 
      })
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-background to-blue-50 dark:from-violet-950/20 dark:via-background dark:to-blue-950/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-12 rounded-2xl bg-gradient-to-br from-primary to-violet-600 text-white shadow-lg shadow-primary/25">
                <Workflow className="size-6" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">Lua</h1>
            </div>
          </div>
          <div>
            <CardTitle className="text-xl">Welcome to Lua</CardTitle>
            <CardDescription>
              AI Voice Intake Assistant for Legal Professionals
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
              {error === "OAuthSignin" && "Error connecting to Clio. Please try again."}
              {error === "OAuthCallback" && "Authentication failed. Please try again."}
              {error === "OAuthCreateAccount" && "Could not create account. Please contact support."}
              {error === "EmailCreateAccount" && "Could not create account with that email."}
              {error === "Callback" && "Authentication error. Please try again."}
              {error === "OAuthAccountNotLinked" && "Account already exists with different provider."}
              {error === "EmailSignin" && "Check your email for sign in link."}
              {error === "CredentialsSignin" && "Invalid credentials. Please try again."}
              {!["OAuthSignin", "OAuthCallback", "OAuthCreateAccount", "EmailCreateAccount", "Callback", "OAuthAccountNotLinked", "EmailSignin", "CredentialsSignin"].includes(error) && "An error occurred. Please try again."}
            </div>
          )}
          
          <Button 
            onClick={handleClioSignIn}
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            <BriefcaseIcon className="mr-2 h-4 w-4" />
            {isLoading ? "Connecting..." : "Continue with Clio"}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>Sign in with your Clio account to access all features</p>
            <p className="text-xs">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  )
} 