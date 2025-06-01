'use client';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EyeIcon, ZapIcon, FileTextIcon } from "lucide-react"; // Example icons

interface TemplateCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode; // Allow passing an icon component
  onPreview?: () => void; // Placeholder for actions
  onUseTemplate?: () => void; // Placeholder for actions
}

export default function TemplateCard({ title, description, icon, onPreview, onUseTemplate }: TemplateCardProps) {
  return (
    <Card className="group relative flex flex-col justify-between h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          {icon || <FileTextIcon className="h-8 w-8 text-custom-primary" />} {/* Default icon */}
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </CardContent>
      <CardFooter className="pt-4">
        {/* Empty footer or add permanent content here if needed */}
      </CardFooter>
      
      {/* Hover overlay positioned relative to the entire card */}
      <div className="absolute inset-0 bg-black/60 dark:bg-black/75 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
        <div className="flex flex-col sm:flex-row gap-3 px-4">
          <Button 
            variant="outline" 
            className="bg-white text-custom-primary hover:bg-gray-100 border-custom-primary hover:border-custom-primary/80 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement preview functionality
              if (onPreview) {
                onPreview();
              }
              console.log('Preview template:', title);
            }}
          >
            <EyeIcon className="mr-2 h-4 w-4" /> Preview
          </Button>
          <Button 
            variant="default"
            className="shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement use template functionality
              if (onUseTemplate) {
                onUseTemplate();
              }
              console.log('Use template:', title);
            }}
          >
            <ZapIcon className="mr-2 h-4 w-4" /> Use Template
          </Button>
        </div>
      </div>
    </Card>
  );
} 