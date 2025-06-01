'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Zap, FileText } from "lucide-react";

interface TemplateCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  category?: string;
  popularity?: string;
  onPreview?: () => void;
  onUseTemplate?: () => void;
}

export default function TemplateCard({ 
  title, 
  description, 
  icon, 
  category,
  popularity,
  onPreview, 
  onUseTemplate 
}: TemplateCardProps) {
  return (
    <Card className="group relative flex flex-col h-full overflow-hidden hover:shadow-md transition-all duration-200 border-muted/50 hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-violet-600/10 text-primary">
            {icon || <FileText className="h-8 w-8" />}
          </div>
          {popularity && (
            <Badge 
              variant="secondary" 
              className={
                popularity === "Popular" 
                  ? "bg-orange-500/10 text-orange-700 border-orange-200 dark:border-orange-800" 
                  : popularity === "New"
                  ? "bg-blue-500/10 text-blue-700 border-blue-200 dark:border-blue-800"
                  : ""
              }
            >
              {popularity}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg font-semibold line-clamp-2">
          {title}
        </CardTitle>
        {category && (
          <Badge variant="outline" className="mt-2 w-fit">
            {category}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow pb-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {description}
        </p>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              if (onPreview) {
                onPreview();
              }
            }}
          >
            <Eye className="mr-2 h-3 w-3" />
            Preview
          </Button>
          <Button 
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              if (onUseTemplate) {
                onUseTemplate();
              }
            }}
          >
            <Zap className="mr-2 h-3 w-3" />
            Use
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 