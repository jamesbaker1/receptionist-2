import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react"; // Placeholder icon
import FlowCard, { type FlowStatus } from "@/components/dashboard/flow-card"; // Import FlowCard and FlowStatus
import Link from "next/link";

// TODO: Create FlowCard component
// import FlowCard from "@/components/dashboard/flow-card";

// Mock data for flows - replace with actual data later
const mockFlows: { id: string; title: string; lastEdited: string; status: FlowStatus }[] = [
  { id: "flow-1", title: "Client Intake Flow - Personal Injury", lastEdited: "2024-07-28", status: "Published" },
  { id: "flow-2", title: "Internal QA Flow", lastEdited: "2024-07-25", status: "Draft" },
  { id: "flow-3", title: "New Employee Onboarding", lastEdited: "2024-06-15", status: "Published" },
  { id: "flow-4", title: "Lead Follow-up Automation", lastEdited: "2024-07-29", status: "Draft" },
  { id: "flow-5", title: "Case Update Notification", lastEdited: "2024-07-20", status: "Published" },
];

// const mockFlows: any[] = []; // Test empty state

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Intake Flows</h1>
      </header>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Input
            type="search"
            placeholder="Search flows..."
            className="max-w-xs w-full"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto sm:ml-0">
                <span>Filter: All</span> <ChevronDownIcon className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>All</DropdownMenuItem>
              <DropdownMenuItem>Draft</DropdownMenuItem>
              <DropdownMenuItem>Published</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Link href="/flows/new">
          <Button>
            New Flow
          </Button>
        </Link>
      </div>

      {/* Flow Cards Grid / Empty State */}
      {mockFlows.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockFlows.map((flow) => (
            <FlowCard 
              key={flow.id} 
              id={flow.id}
              title={flow.title} 
              lastEdited={flow.lastEdited} 
              status={flow.status} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          {/* Placeholder for illustration */}
          <div className="mx-auto mb-4 h-24 w-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            <span>Illustration</span>
          </div>
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">Create your first flow</p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Get started by creating a new intake flow or choosing from a template.</p>
          <Link href="/flows/new">
            <Button className="mt-6">
              Create New Flow
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
} 