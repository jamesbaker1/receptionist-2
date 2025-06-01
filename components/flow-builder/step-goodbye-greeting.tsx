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
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  goodbyeGreeting: z.string().min(1, { message: "Goodbye greeting is required." }).max(500, { message: "Greeting must be 500 characters or less." }),
});

interface StepGoodbyeGreetingProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  onBack: () => void;
  initialData?: Partial<z.infer<typeof formSchema>>;
}

export default function StepGoodbyeGreeting({ onSubmit, onBack, initialData }: StepGoodbyeGreetingProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goodbyeGreeting: initialData?.goodbyeGreeting || "Thank you for calling. Goodbye!",
    },
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Goodbye Greeting</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            What should the AI voice agent say before it hangs up?
          </p>
        </div>
        
        <FormField
          control={form.control}
          name="goodbyeGreeting"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goodbye Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Thanks for reaching out. Have a great day!"
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormDescription>
                This is the last thing callers will hear before the call ends.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between items-center mt-8">
          <Button variant="outline" onClick={onBack} type="button">
            Back
          </Button>
          <Button type="submit">
            Next
          </Button>
        </div>
      </form>
    </Form>
  );
} 