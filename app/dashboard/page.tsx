import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Search, Filter, Plus, Sparkles, FileText } from "lucide-react";
import FlowCard, { type FlowStatus } from "@/components/dashboard/flow-card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// Mock data for flows - replace with actual data later
const mockFlows: { id: string; title: string; lastEdited: string; status: FlowStatus; responses?: number }[] = [
  { id: "flow-1", title: "Client Intake Flow - Personal Injury", lastEdited: "2024-07-28", status: "Published", responses: 124 },
  { id: "flow-2", title: "Internal QA Flow", lastEdited: "2024-07-25", status: "Draft" },
  { id: "flow-3", title: "New Employee Onboarding", lastEdited: "2024-06-15", status: "Published", responses: 89 },
  { id: "flow-4", title: "Lead Follow-up Automation", lastEdited: "2024-07-29", status: "Draft" },
  { id: "flow-5", title: "Case Update Notification", lastEdited: "2024-07-20", status: "Published", responses: 342 },
];

// const mockFlows: any[] = []; // Test empty state

export default function DashboardPage() {
  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Intake Flows</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your automated intake workflows
            </p>
          </div>
          <Link href="/flows/new">
            <Button className="gap-2">
              <Plus className="size-4" />
              New Flow
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="size-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Total Flows</p>
                <p className="text-2xl font-bold">{mockFlows.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Sparkles className="size-4 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">
                  {mockFlows.filter(f => f.status === "Published").length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="size-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
                <p className="text-2xl font-bold">
                  {mockFlows.reduce((acc, f) => acc + (f.responses || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search flows..."
              className="pl-9 w-full sm:w-[300px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              <DropdownMenuItem>All Flows</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Badge variant="default" className="mr-2 h-2 w-2 p-0 rounded-full" />
                Published
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Badge variant="secondary" className="mr-2 h-2 w-2 p-0 rounded-full" />
                Draft
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Flow Cards Grid / Empty State */}
      {mockFlows.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mockFlows.map((flow) => (
            <FlowCard 
              key={flow.id} 
              id={flow.id}
              title={flow.title} 
              lastEdited={flow.lastEdited} 
              status={flow.status}
              responses={flow.responses}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center animate-in min-h-[400px]">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            
            <h2 className="text-xl font-semibold">Create your first flow</h2>
            <p className="text-muted-foreground mt-2 mb-8">
              Get started by creating a new intake flow from scratch or choose from our pre-built templates.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/flows/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Flow
                </Button>
              </Link>
              <Link href="/templates">
                <Button variant="outline">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Browse Templates
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 