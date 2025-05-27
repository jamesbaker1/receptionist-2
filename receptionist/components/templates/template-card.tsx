import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EyeIcon, ZapIcon, FileTextIcon } from "lucide-react"; // Example icons

interface TemplateCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode; // Allow passing an icon component
  // onPreview?: () => void; // Placeholder for actions
  // onUseTemplate?: () => void; // Placeholder for actions
}

export default function TemplateCard({ title, description, icon }: TemplateCardProps) {
  return (
    <Card className="group relative flex flex-col justify-between h-full overflow-hidden">
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
        {/* Initially hidden, shown on group hover */}
        <div className="absolute inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="bg-white text-custom-primary hover:bg-gray-100 border-custom-primary hover:border-custom-primary/80">
              <EyeIcon className="mr-2 h-4 w-4" /> Preview
            </Button>
            <Button variant="default"> {/* Uses bg-custom-primary by default */}
              <ZapIcon className="mr-2 h-4 w-4" /> Use Template
            </Button>
          </div>
        </div>
        {/* Fallback visible content for non-hover state if needed, or can be empty */}
        {/* For this design, the hover overlay covers everything in the footer */}
        {/* If you want something visible always in footer, add it here outside the group-hover div */}
      </CardFooter>
    </Card>
  );
} 