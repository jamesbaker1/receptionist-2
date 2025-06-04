"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from 'react';
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
import { FileText, Sparkles, ArrowRight, ChevronDown, ChevronUp, Layout, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Mock templates with better categorization
const mockTemplates = [
  { 
    id: "1", 
    name: "Personal Injury Intake",
    description: "Streamline client intake for personal injury cases",
    category: "Legal",
    popularity: "Popular"
  },
  { 
    id: "2", 
    name: "Family Law Consultation",
    description: "Initial consultation for family law matters",
    category: "Legal"
  },
  { 
    id: "4", 
    name: "Criminal Defense Initial Contact",
    description: "Essential questions for criminal defense cases",
    category: "Legal"
  },
  { 
    id: "5", 
    name: "General Legal Consultation",
    description: "Versatile template for various legal consultations",
    category: "Legal"
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
  const [isTemplatesSectionOpen, setIsTemplatesSectionOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("blank");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      flowName: "",
      templateId: "blank",
    },
  });

  useEffect(() => {
    let newFlowName = "";
    let newTemplateId = "blank";

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
    setSelectedTemplateId(newTemplateId);
  }, [initialData, form]);

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values);
  }

  function handleTemplateSelect(templateId: string) {
    setSelectedTemplateId(templateId);
    form.setValue("templateId", templateId);
    
    // Auto-suggest flow name based on template
    if (templateId !== "blank" && !form.getValues("flowName")) {
      const template = mockTemplates.find(t => t.id === templateId);
      if (template) {
        form.setValue("flowName", template.name);
      }
    }
  }

  const selectedTemplate = mockTemplates.find(t => t.id === selectedTemplateId);

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Create New Flow</h2>
            <p className="text-lg text-muted-foreground">
              Give your intake flow a name to get started.
            </p>
          </div>
          
          <FormField
            control={form.control}
            name="flowName"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base font-medium">Flow Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Personal Injury Client Intake" 
                    {...field} 
                    className="text-base h-12 max-w-lg"
                  />
                </FormControl>
                <FormDescription className="text-sm">
                  This name will help you identify the flow in your dashboard.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Subtle Collapsible Templates Section */}
          <div className="space-y-4">
            <Collapsible open={isTemplatesSectionOpen} onOpenChange={setIsTemplatesSectionOpen}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between h-auto p-4 border border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors max-w-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Layout className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Choose a Starting Template</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedTemplate && selectedTemplate.id !== "blank" 
                          ? `Using: ${selectedTemplate.name}`
                          : "Starting from scratch"
                        }
                      </p>
                    </div>
                  </div>
                  {isTemplatesSectionOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-4 max-w-2xl">
                <div className="text-sm text-muted-foreground">
                  Select a template to get started quickly, or continue with a blank flow.
                </div>
                
                {/* Start from Scratch Option */}
                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedTemplateId === "blank" 
                      ? "ring-2 ring-primary bg-primary/5 shadow-md" 
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleTemplateSelect("blank")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">Start from Scratch</p>
                          {selectedTemplateId === "blank" && (
                            <div className="flex items-center gap-1 text-primary">
                              <Check className="h-3 w-3" />
                              <span className="text-xs font-medium">Selected</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Build your flow from a blank canvas with complete customization
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or choose a template
                    </span>
                  </div>
                </div>

                {/* Template Options */}
                <div className="space-y-3">
                  {mockTemplates.map((template) => (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedTemplateId === template.id 
                          ? "ring-2 ring-primary bg-primary/5 shadow-md" 
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-muted">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{template.name}</span>
                              {template.popularity && (
                                <Badge variant="secondary" className="text-xs">
                                  {template.popularity}
                                </Badge>
                              )}
                              {selectedTemplateId === template.id && (
                                <div className="flex items-center gap-1 text-primary">
                                  <Check className="h-3 w-3" />
                                  <span className="text-xs font-medium">Selected</span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="flex justify-end pt-6">
            <Button type="submit" size="lg" className="group">
              Next: Configure Greeting
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 