"use client";

import { useAuthGuard } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Search, Filter, Plus, Sparkles, FileText, LogOut, Settings, User } from "lucide-react";
import FlowCard, { type FlowStatus } from "@/components/dashboard/flow-card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut } from "next-auth/react"
import { useState } from "react";

// Mock data for flows - replace with actual data later
const mockFlows: { 
  id: string; 
  title: string; 
  lastEdited: string; 
  status: FlowStatus; 
  responses?: number;
  author?: string;
  tags?: string[];
  createdDate?: string;
  phoneNumber?: string;
}[] = [
  { 
    id: "flow-1", 
    title: "Client Intake Flow - Personal Injury", 
    lastEdited: "2024-07-28", 
    status: "Published", 
    responses: 124,
    author: "John Doe",
    tags: ["intake", "personal-injury", "client"],
    createdDate: "2024-07-01",
    phoneNumber: "(555) 123-4567"
  },
  { 
    id: "flow-2", 
    title: "Internal QA Flow", 
    lastEdited: "2024-07-25", 
    status: "Draft",
    author: "Jane Smith",
    tags: ["internal", "qa", "quality"],
    createdDate: "2024-07-15",
    phoneNumber: "(555) 234-5678"
  },
  { 
    id: "flow-3", 
    title: "New Employee Onboarding", 
    lastEdited: "2024-06-15", 
    status: "Published", 
    responses: 89,
    author: "Mike Johnson",
    tags: ["onboarding", "hr", "employee"],
    createdDate: "2024-06-01",
    phoneNumber: "(555) 345-6789"
  },
  { 
    id: "flow-4", 
    title: "Lead Follow-up Automation", 
    lastEdited: "2024-07-29", 
    status: "Draft",
    author: "Sarah Wilson",
    tags: ["lead", "automation", "follow-up"],
    createdDate: "2024-07-20",
    phoneNumber: "(555) 456-7890"
  },
  { 
    id: "flow-5", 
    title: "Case Update Notification", 
    lastEdited: "2024-07-20", 
    status: "Published", 
    responses: 342,
    author: "John Doe",
    tags: ["notification", "case", "update"],
    createdDate: "2024-07-10",
    phoneNumber: "(555) 567-8901"
  },
];

// const mockFlows: any[] = []; // Test empty state

export default function DashboardPage() {
  const { session, isLoading } = useAuthGuard()
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect via useAuthGuard
  }

  // Filter flows based on current filters
  const filteredFlows = mockFlows.filter(flow => {
    // Basic filter
    if (selectedFilter === "published" && flow.status !== "Published") return false;
    if (selectedFilter === "draft" && flow.status !== "Draft") return false;

    // Search filter
    if (searchQuery && !flow.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    return true;
  });

  return (
    <div className="space-y-8 p-6">
      {/* Header with user info */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back, {session.user?.name?.split(' ')[0]}</h1>
              <p className="text-muted-foreground mt-1">
                {session.user?.firmName ? `${session.user.firmName} • Clio Account` : "Clio Account"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/flows/new">
              <Button className="gap-2">
                <Plus className="size-4" />
                New Flow
              </Button>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={session.user?.image || undefined} />
                    <AvatarFallback>
                      {session.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
                <p className="text-2xl font-bold">{filteredFlows.length}</p>
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
                  {filteredFlows.filter(f => f.status === "Published").length}
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
                  {filteredFlows.reduce((acc, f) => acc + (f.responses || 0), 0)}
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              <DropdownMenuItem onClick={() => setSelectedFilter("all")}>
                All Flows
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedFilter("published")}>
                <Badge variant="default" className="mr-2 h-2 w-2 p-0 rounded-full" />
                Published
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedFilter("draft")}>
                <Badge variant="secondary" className="mr-2 h-2 w-2 p-0 rounded-full" />
                Draft
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Flow Grid */}
      {filteredFlows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex items-center justify-center size-16 rounded-full bg-muted mb-4">
            <FileText className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No flows found</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {searchQuery 
              ? `No flows match your search "${searchQuery}".`
              : "Get started by creating your first intake flow."
            }
          </p>
          <Link href="/flows/new">
            <Button>
              <Plus className="mr-2 size-4" />
              Create New Flow
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFlows.map((flow) => (
            <FlowCard
              key={flow.id}
              id={flow.id}
              title={flow.title}
              lastEdited={flow.lastEdited}
              status={flow.status}
              responses={flow.responses}
              phoneNumber={flow.phoneNumber}
            />
          ))}
        </div>
      )}
    </div>
  );
} 