import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreVerticalIcon } from "lucide-react"; // Placeholder icon
import Link from "next/link";

export type FlowStatus = "Draft" | "Published";

interface FlowCardProps {
  id: string;
  title: string;
  lastEdited: string; // Or Date object, consider formatting
  status: FlowStatus;
  // onEdit?: () => void; // Placeholder for actions
  // onDelete?: () => void; // Placeholder for actions
}

export default function FlowCard({ id, title, lastEdited, status }: FlowCardProps) {
  return (
    <Card className="flex flex-col justify-between h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
            {title}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="-mr-2 -mt-2 h-8 w-8">
                <MoreVerticalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/flows/edit/${id}`}>
                <DropdownMenuItem>Edit</DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="text-destructive hover:!text-destructive-foreground hover:!bg-destructive/90 dark:hover:!bg-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Last edited: {lastEdited}
        </p>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* Placeholder for potential additional content like a brief description or stats */}
      </CardContent>
      <CardFooter className="pt-4">
        <Badge variant={status === "Published" ? "default" : "secondary"}
          className={status === "Published" ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100"}
        >
          {status}
        </Badge>
      </CardFooter>
    </Card>
  );
} 