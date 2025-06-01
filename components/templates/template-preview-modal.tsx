'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, CheckCircle, FileText } from "lucide-react";
import { useRouter } from 'next/navigation';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: {
    id: string;
    title: string;
    description: string;
    category?: string;
    popularity?: string;
    contentPreview?: string[];
    icon?: React.ReactNode;
  } | null;
}

export default function TemplatePreviewModal({ isOpen, onClose, template }: TemplatePreviewModalProps) {
  const router = useRouter();
  
  if (!template) {
    return null;
  }

  const handleUseTemplate = () => {
    router.push(`/flows/new?templateId=${template.id}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-violet-600/10 text-primary">
              {template.icon || <FileText className="h-8 w-8" />}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl flex items-center gap-2">
                {template.title}
                {template.popularity && (
                  <Badge variant="secondary" className="ml-2">
                    {template.popularity}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {template.description}
              </DialogDescription>
              {template.category && (
                <Badge variant="outline" className="mt-2">
                  {template.category}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">INCLUDED FIELDS</h3>
            <div className="space-y-2">
              {template.contentPreview && template.contentPreview.length > 0 ? (
                template.contentPreview.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  No content preview available for this template.
                </p>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">FEATURES</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Fully customizable</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Mobile responsive</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Professional design</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Ready to deploy</span>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleUseTemplate} className="w-full sm:w-auto">
            <Zap className="mr-2 h-4 w-4" />
            Use This Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 