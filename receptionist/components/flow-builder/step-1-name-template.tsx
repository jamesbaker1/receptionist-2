"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

// Mock templates - in a real app, these would come from a data source
const mockTemplates = [
  { id: "template1", name: "Personal Injury Intake" },
  { id: "template2", name: "Family Law Consultation" },
  { id: "template3", name: "Blank Flow (No Template)" },
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
      flowName: initialData?.flowName || "",
      templateId: initialData?.templateId || mockTemplates.find(t => t.name.includes("Blank"))?.id || "",
    },
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    console.log("Step 1 Data:", values);
    onSubmit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Name Your Flow</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Give your new intake flow a descriptive name.</p>
        </div>
        
        <FormField
          control={form.control}
          name="flowName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Flow Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Personal Injury Client Intake" {...field} />
              </FormControl>
              <FormDescription>
                This name will be used to identify the flow in your dashboard.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Choose a Starting Point (Optional)</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">You can start from a blank slate or use a pre-built template.</p>
        </div>

        <FormField
          control={form.control}
          name="templateId"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Select Template</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  {mockTemplates.map((template) => (
                    <FormItem key={template.id} className="flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer has-[input:checked]:border-custom-primary has-[input:checked]:bg-custom-primary/10">
                      <FormControl>
                        <RadioGroupItem value={template.id} />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer w-full">
                        {template.name}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">
            Next: Configure Questions
          </Button>
        </div>
      </form>
    </Form>
  );
} 