"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Search, Filter, Plus, Sparkles, FileText, SlidersHorizontal, X } from "lucide-react";
import FlowCard, { type FlowStatus } from "@/components/dashboard/flow-card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
}[] = [
  { 
    id: "flow-1", 
    title: "Client Intake Flow - Personal Injury", 
    lastEdited: "2024-07-28", 
    status: "Published", 
    responses: 124,
    author: "John Doe",
    tags: ["intake", "personal-injury", "client"],
    createdDate: "2024-07-01"
  },
  { 
    id: "flow-2", 
    title: "Internal QA Flow", 
    lastEdited: "2024-07-25", 
    status: "Draft",
    author: "Jane Smith",
    tags: ["internal", "qa", "quality"],
    createdDate: "2024-07-15"
  },
  { 
    id: "flow-3", 
    title: "New Employee Onboarding", 
    lastEdited: "2024-06-15", 
    status: "Published", 
    responses: 89,
    author: "Mike Johnson",
    tags: ["onboarding", "hr", "employee"],
    createdDate: "2024-06-01"
  },
  { 
    id: "flow-4", 
    title: "Lead Follow-up Automation", 
    lastEdited: "2024-07-29", 
    status: "Draft",
    author: "Sarah Wilson",
    tags: ["lead", "automation", "follow-up"],
    createdDate: "2024-07-20"
  },
  { 
    id: "flow-5", 
    title: "Case Update Notification", 
    lastEdited: "2024-07-20", 
    status: "Published", 
    responses: 342,
    author: "John Doe",
    tags: ["notification", "case", "update"],
    createdDate: "2024-07-10"
  },
];

// const mockFlows: any[] = []; // Test empty state

interface AdvancedFilters {
  dateRange: {
    from: string;
    to: string;
  };
  authors: string[];
  tags: string[];
  minResponses: string;
  maxResponses: string;
}

export default function DashboardPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    dateRange: {
      from: "",
      to: ""
    },
    authors: [],
    tags: [],
    minResponses: "",
    maxResponses: ""
  });

  // Get unique authors and tags for filter options
  const uniqueAuthors = Array.from(new Set(mockFlows.map(flow => flow.author).filter((author): author is string => Boolean(author))));
  const uniqueTags = Array.from(new Set(mockFlows.flatMap(flow => flow.tags || [])));

  // Filter flows based on current filters
  const filteredFlows = mockFlows.filter(flow => {
    // Basic filter
    if (selectedFilter === "published" && flow.status !== "Published") return false;
    if (selectedFilter === "draft" && flow.status !== "Draft") return false;

    // Search filter
    if (searchQuery && !flow.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    // Advanced filters
    const hasAdvancedFilters = advancedFilters.dateRange.from || advancedFilters.dateRange.to || 
                              advancedFilters.authors.length > 0 || advancedFilters.tags.length > 0 ||
                              advancedFilters.minResponses || advancedFilters.maxResponses;

    if (hasAdvancedFilters) {
      // Date range filter
      if (advancedFilters.dateRange.from && flow.createdDate && flow.createdDate < advancedFilters.dateRange.from) return false;
      if (advancedFilters.dateRange.to && flow.createdDate && flow.createdDate > advancedFilters.dateRange.to) return false;

      // Author filter
      if (advancedFilters.authors.length > 0 && (!flow.author || !advancedFilters.authors.includes(flow.author))) return false;

      // Tags filter
      if (advancedFilters.tags.length > 0 && (!flow.tags || !advancedFilters.tags.some(tag => flow.tags?.includes(tag)))) return false;

      // Response count filters
      const responses = flow.responses || 0;
      if (advancedFilters.minResponses && responses < parseInt(advancedFilters.minResponses)) return false;
      if (advancedFilters.maxResponses && responses > parseInt(advancedFilters.maxResponses)) return false;
    }

    return true;
  });

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      dateRange: { from: "", to: "" },
      authors: [],
      tags: [],
      minResponses: "",
      maxResponses: ""
    });
  };

  const hasActiveAdvancedFilters = advancedFilters.dateRange.from || advancedFilters.dateRange.to || 
                                  advancedFilters.authors.length > 0 || advancedFilters.tags.length > 0 ||
                                  advancedFilters.minResponses || advancedFilters.maxResponses;

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
          <Sheet open={isAdvancedFiltersOpen} onOpenChange={setIsAdvancedFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className={hasActiveAdvancedFilters ? "border-primary" : ""}>
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Advanced Filters</SheetTitle>
                <SheetDescription>
                  Apply multiple filter criteria to find specific flows
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-6 py-6">
                {/* Date Range Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Date Range</Label>
                  <div className="grid gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">From</Label>
                        <Input
                          type="date"
                          value={advancedFilters.dateRange.from}
                          onChange={(e) => setAdvancedFilters(prev => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, from: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">To</Label>
                        <Input
                          type="date"
                          value={advancedFilters.dateRange.to}
                          onChange={(e) => setAdvancedFilters(prev => ({
                            ...prev,
                            dateRange: { ...prev.dateRange, to: e.target.value }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Author Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Authors</Label>
                  <div className="space-y-2">
                    {uniqueAuthors.map(author => (
                      <div key={author} className="flex items-center space-x-2">
                        <Checkbox
                          id={`author-${author}`}
                          checked={advancedFilters.authors.includes(author)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAdvancedFilters(prev => ({
                                ...prev,
                                authors: [...prev.authors, author]
                              }));
                            } else {
                              setAdvancedFilters(prev => ({
                                ...prev,
                                authors: prev.authors.filter(a => a !== author)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={`author-${author}`} className="text-sm">
                          {author}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Tags Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {uniqueTags.map(tag => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={advancedFilters.tags.includes(tag)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAdvancedFilters(prev => ({
                                ...prev,
                                tags: [...prev.tags, tag]
                              }));
                            } else {
                              setAdvancedFilters(prev => ({
                                ...prev,
                                tags: prev.tags.filter(t => t !== tag)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={`tag-${tag}`} className="text-sm">
                          {tag}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Response Count Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Response Count</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Min</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={advancedFilters.minResponses}
                        onChange={(e) => setAdvancedFilters(prev => ({
                          ...prev,
                          minResponses: e.target.value
                        }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Max</Label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={advancedFilters.maxResponses}
                        onChange={(e) => setAdvancedFilters(prev => ({
                          ...prev,
                          maxResponses: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-4">
                  <Button
                    onClick={() => setIsAdvancedFiltersOpen(false)}
                    className="w-full"
                  >
                    Apply Filters
                  </Button>
                  {hasActiveAdvancedFilters && (
                    <Button
                      variant="outline"
                      onClick={clearAdvancedFilters}
                      className="w-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Active Filters Indicator */}
        {hasActiveAdvancedFilters && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary" className="gap-1">
              Advanced filters active
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={clearAdvancedFilters}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          </div>
        )}
      </div>

      {/* Flow Cards Grid / Empty State */}
      {filteredFlows.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFlows.map((flow) => (
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
            
            {mockFlows.length === 0 ? (
              <>
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
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold">No flows match your filters</h2>
                <p className="text-muted-foreground mt-2 mb-8">
                  Try adjusting your search terms or filter criteria to find the flows you&apos;re looking for.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={() => {
                    setSearchQuery("");
                    setSelectedFilter("all");
                    clearAdvancedFilters();
                  }}>
                    Clear All Filters
                  </Button>
                  <Link href="/flows/new">
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Flow
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 