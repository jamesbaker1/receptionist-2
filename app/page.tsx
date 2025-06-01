import { redirect } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Workflow, ArrowRight, Zap, Users, Shield } from "lucide-react";
import Link from "next/link";

export default function Home() {
  // For now, let's create a simple landing page
  // In the future, you might want to redirect to dashboard if user is authenticated
  // redirect('/dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-12 rounded-xl bg-custom-primary text-white">
                <Workflow className="size-6" />
              </div>
              <h1 className="text-4xl font-bold">Lua</h1>
            </div>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Build intelligent intake flows and automate client communication with our powerful flow builder platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Get Started <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/templates">
                Browse Templates
              </Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="size-5 text-custom-primary" />
                Easy Flow Builder
              </CardTitle>
              <CardDescription>
                Create complex intake flows with our intuitive wizard-based interface.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Design multi-step forms with conditional logic, branching paths, and dynamic responses.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5 text-custom-primary" />
                Client Management
              </CardTitle>
              <CardDescription>
                Streamline client intake and automate follow-up communications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Collect, organize, and manage client information with integrated tools and workflows.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-5 text-custom-primary" />
                Secure & Reliable
              </CardTitle>
              <CardDescription>
                Enterprise-grade security with data protection and compliance features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your data is protected with industry-standard encryption and security protocols.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        {/*
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Ready to get started?</CardTitle>
              <CardDescription>
                Create your first intake flow in minutes with our pre-built templates or start from scratch.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link href="/flows/new">
                    Create New Flow
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">
                    View Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        */}
      </div>
    </div>
  );
}
