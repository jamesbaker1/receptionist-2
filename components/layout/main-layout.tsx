'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { 
  LayoutDashboard, 
  FileText, 
  Workflow,
  Plus,
  ChevronRight,
  Moon,
  Sun,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface MainLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

// Navigation data
const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Templates", 
    url: "/templates",
    icon: FileText,
  },
  // {
  //   title: "Flows",
  //   url: "/dashboard",
  //   icon: Workflow,
  // },
];

const navSecondary = [
  {
    title: "Create New Flow",
    url: "/flows/new",
    icon: Plus,
  },
];

export default function MainLayout({ children, breadcrumbs }: MainLayoutProps) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const showBreadcrumbs = breadcrumbs && breadcrumbs.length > 0;

  // Don't show sidebar on homepage
  const isHomepage = pathname === '/';

  if (isHomepage) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Simple header for homepage */}
        <header className="flex h-16 items-center justify-between px-6 border-b border-border/50">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 text-white shadow-sm">
              <Workflow className="size-4" />
            </div>
            <span className="font-semibold">Lua</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/templates">Templates</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </header>
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen relative">
        <Sidebar variant="inset" className="border-r-muted/50">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild className="hover:bg-accent">
                  <Link href="/">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-600 text-white shadow-sm">
                      <Workflow className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">Lua</span>
                      <span className="truncate text-xs text-muted-foreground">Flow Builder</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navMain.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="hover:bg-accent data-[state=open]:bg-accent">
                        <Link href={item.url}>
                          <item.icon className="text-muted-foreground" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <Separator className="my-2" />
            
            <SidebarGroup>
              <SidebarGroupLabel>Actions</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navSecondary.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="hover:bg-accent">
                        <Link href={item.url}>
                          <item.icon className="text-muted-foreground" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="w-full hover:bg-accent">
                      <div className="flex items-center gap-2 w-full">
                        <div className="size-8 rounded-lg bg-gradient-to-br from-primary/10 to-violet-600/10 flex items-center justify-center">
                          <span className="text-xs font-semibold">U</span>
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">User</span>
                          <span className="truncate text-xs text-muted-foreground">Settings</span>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Settings className="mr-2 size-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <HelpCircle className="mr-2 size-4" />
                      Help
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <LogOut className="mr-2 size-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex-1 min-w-0 relative">
          {/* Header with breadcrumbs and sidebar trigger */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/50 px-4 sticky top-0 bg-background z-10">
            <div className="flex items-center gap-2 flex-1">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              
              {/* Breadcrumbs */}
              {showBreadcrumbs && (
                <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm">
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={index}>
                      {crumb.href ? (
                        <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="font-medium">{crumb.label}</span>
                      )}
                      {index < breadcrumbs.length - 1 && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              )}
            </div>
            
            {/* Theme toggle button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="ml-auto"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </header>
          
          {/* Main content */}
          <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 