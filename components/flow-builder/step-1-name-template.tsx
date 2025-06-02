"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FileText, Sparkles, ArrowRight, Users, Shield, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock templates with better categorization
const mockTemplates = [
  { 
    id: "1", 
    name: "Personal Injury Intake",
    description: "Streamline client intake for personal injury cases",
    icon: <Scale className="h-5 w-5" />,
    category: "Legal",
    popularity: "Popular"
  },
  { 
    id: "2", 
    name: "Family Law Consultation",
    description: "Initial consultation for family law matters",
    icon: <Users className="h-5 w-5" />,
    category: "Legal"
  },
  { 
    id: "4", 
    name: "Criminal Defense Initial Contact",
    description: "Essential questions for criminal defense cases",
    icon: <Shield className="h-5 w-5" />,
    category: "Legal"
  },
  { 
    id: "5", 
    name: "General Legal Consultation",
    description: "Versatile template for various legal consultations",
    icon: <FileText className="h-5 w-5" />,
    category: "Legal"
  },
  { 
    id: "blank", 
    name: "Start from Scratch",
    description: "Build your flow from a blank canvas",
    icon: <Sparkles className="h-5 w-5" />,
    category: "Custom",
    isBlank: true
  },
];

const formSchema = z.object({
  flowName: z.string().min(1, { message: "Flow name is required." }).max(100, { message: "Flow name must be 100 characters or less." }),
  templateId: z.string().optional(),
});

interface Step1NameTemplateProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  initialData?: Partial<z.infer<typeof formSchema>>;
}

export default function Step1NameTemplate({ onSubmit, initialData }: Step1NameTemplateProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      flowName: "",
      templateId: mockTemplates.find(t => t.isBlank)?.id || "",
    },
  });

  useEffect(() => {
    const blankTemplateId = mockTemplates.find(t => t.isBlank)?.id || "";
    let newFlowName = "";
    let newTemplateId = blankTemplateId;

    if (initialData) {
      newFlowName = initialData.flowName || "";
      if (initialData.templateId && mockTemplates.some(t => t.id === initialData.templateId)) {
        newTemplateId = initialData.templateId;
      }
    }
    
    form.reset({
      flowName: newFlowName,
      templateId: newTemplateId,
    });
  }, [initialData, form]);

  function handleSubmit(values: z.infer<typeof formSchema>) {
    console.log("Step 1 Data:", values);
    onSubmit(values);
  }

  const selectedTemplate = mockTemplates.find(t => t.id === form.watch("templateId"));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">Name Your Flow</h2>
          <p className="text-muted-foreground">
            Give your intake flow a descriptive name and choose how to get started.
          </p>
        </div>
        
        <FormField
          control={form.control}
          name="flowName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Flow Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Personal Injury Client Intake" 
                  {...field} 
                  className="max-w-md"
                />
              </FormControl>
              <FormDescription>
                This name will help you identify the flow in your dashboard.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Choose a Starting Point</h3>
            <p className="text-sm text-muted-foreground">
              Select a template to get started quickly, or build from scratch.
            </p>
          </div>

          <FormField
            control={form.control}
            name="templateId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="max-w-md">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-3">
                          <div className="p-1 rounded bg-muted">
                            {template.icon}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{template.name}</span>
                              {template.popularity && (
                                <Badge variant="secondary" className="text-xs">
                                  {template.popularity}
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {template.description}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose a template that matches your use case or start from scratch.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Selected template preview */}
          {selectedTemplate && (
            <div className="max-w-md p-4 rounded-lg border bg-muted/50">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-background">
                  {selectedTemplate.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {selectedTemplate.name}
                    </p>
                    {selectedTemplate.popularity && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedTemplate.popularity}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplate.description}
                  </p>
                  {selectedTemplate.category && !selectedTemplate.isBlank && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {selectedTemplate.category}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" className="group">
            Next: Configure Greeting
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </form>
    </Form>
  );
} 