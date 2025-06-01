import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Copy, Trash2, BarChart3, Clock } from "lucide-react";
import Link from "next/link";

export type FlowStatus = "Draft" | "Published";

interface FlowCardProps {
  id: string;
  title: string;
  lastEdited: string;
  status: FlowStatus;
  responses?: number;
}

export default function FlowCard({ id, title, lastEdited, status, responses }: FlowCardProps) {
  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-muted/50 hover:border-primary/20 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-base font-semibold line-clamp-2 text-foreground">
            {title}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem asChild>
                <Link href={`/flows/edit/${id}`} className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow pb-3">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatDate(lastEdited)}</span>
        </div>
        
        {status === "Published" && responses !== undefined && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
            <BarChart3 className="h-3 w-3" />
            <span>{responses} responses</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-3 pb-4">
        <Badge 
          variant={status === "Published" ? "default" : "secondary"}
          className={
            status === "Published" 
              ? "bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-800" 
              : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-800"
          }
        >
          {status}
        </Badge>
      </CardFooter>
    </Card>
  );
} 