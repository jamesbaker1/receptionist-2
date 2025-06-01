'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: {
    id: string;
    title: string;
    description: string;
    contentPreview?: string[];
  } | null;
}

export default function TemplatePreviewModal({ isOpen, onClose, template }: TemplatePreviewModalProps) {
  if (!template) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{template.title}</DialogTitle>
          <DialogDescription className="mt-1">
            {template.description}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <h3 className="text-lg font-semibold">Template Content Preview:</h3>
          <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800 min-h-[200px]">
            {template.contentPreview && template.contentPreview.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                {template.contentPreview.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No content preview available for this template.
              </p>
            )}
            <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
              <strong>ID:</strong> {template.id}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          {/* You might want a "Use this template" button here as well */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 