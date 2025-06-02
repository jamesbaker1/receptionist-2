import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Workflow, ArrowRight, Zap, Users, Shield, CheckCircle, Sparkles, Globe } from "lucide-react";
import Link from "next/link";

export default function Home() {
  // For now, let's create a simple landing page
  // In the future, you might want to redirect to dashboard if user is authenticated
  // redirect('/dashboard');

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-background to-blue-50 dark:from-violet-950/20 dark:via-background dark:to-blue-950/20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/20 via-transparent to-transparent blur-3xl" />
      
      <div className="container relative mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 space-y-4 animate-in">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-12 rounded-2xl bg-gradient-to-br from-primary to-violet-600 text-white shadow-lg shadow-primary/25">
                <Workflow className="size-6" />
              </div>
              <h1 className="text-4xl font-bold gradient-text">Lua</h1>
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground max-w-3xl mx-auto leading-tight">
            AI Voice Intake Assistant
            <span className="block text-2xl md:text-3xl mt-2 text-muted-foreground font-medium">
              For Legal Professionals
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Automate client intake calls with our voice assistant. 
            Manage communications and grow your practice.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="group">
              <Link href="/dashboard">
                Get Started Free
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="group">
              <Link href="/templates">
                <Sparkles className="mr-2 size-4" />
                Browse Templates
              </Link>
            </Button>
          </div>
          
          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-green-500" />
              <span>ABA Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-green-500" />
              <span>SOC2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-green-500" />
              <span>GDPR Ready</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <Card className="group hover:shadow-lg transition-all duration-300 border-muted/50 hover:border-primary/20">
            <CardHeader className="pb-3">
              <div className="size-10 rounded-lg bg-gradient-to-br from-primary/10 to-violet-600/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Zap className="size-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Visual Flow Builder</CardTitle>
              <CardDescription className="text-sm">
                Create complex intake flows with our intuitive drag-and-drop interface.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-3 text-primary mt-1 shrink-0" />
                  <span>Multi-step forms with conditional logic</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-3 text-primary mt-1 shrink-0" />
                  <span>Branching paths & dynamic responses</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-3 text-primary mt-1 shrink-0" />
                  <span>Real-time preview & testing</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-muted/50 hover:border-primary/20">
            <CardHeader className="pb-3">
              <div className="size-10 rounded-lg bg-gradient-to-br from-primary/10 to-violet-600/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Users className="size-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Client Management</CardTitle>
              <CardDescription className="text-sm">
                Streamline client intake and automate follow-up communications.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-3 text-primary mt-1 shrink-0" />
                  <span>Automated email & SMS notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-3 text-primary mt-1 shrink-0" />
                  <span>Client portal with progress tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-3 text-primary mt-1 shrink-0" />
                  <span>Integrated CRM capabilities</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-muted/50 hover:border-primary/20">
            <CardHeader className="pb-3">
              <div className="size-10 rounded-lg bg-gradient-to-br from-primary/10 to-violet-600/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Shield className="size-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Enterprise Security</CardTitle>
              <CardDescription className="text-sm">
                Bank-level security with compliance features built-in.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-3 text-primary mt-1 shrink-0" />
                  <span>256-bit SSL encryption</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-3 text-primary mt-1 shrink-0" />
                  <span>HIPAA & GDPR compliant</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="size-3 text-primary mt-1 shrink-0" />
                  <span>Regular security audits</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
