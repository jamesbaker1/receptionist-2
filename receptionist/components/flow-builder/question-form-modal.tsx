"use client";
import React from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircleIcon, Trash2Icon, XIcon } from "lucide-react";

export const answerTypes = ["Text", "Yes/No", "Radio"] as const;
export type AnswerType = typeof answerTypes[number];

export const questionSchema = z.object({
  id: z.string().optional(), // For editing existing questions
  questionText: z.string().min(1, "Question text is required.").max(500, "Question text must be 500 characters or less."),
  answerType: z.enum(answerTypes, { required_error: "Answer type is required." }),
  radioOptions: z.array(z.object({ value: z.string().min(1, "Option cannot be empty.") })).optional(),
}).refine(data => {
  if (data.answerType === "Radio") {
    return data.radioOptions && data.radioOptions.length >= 2;
  }
  return true;
}, { message: "Radio questions must have at least 2 options.", path: ["radioOptions"] });

export type QuestionFormValues = z.infer<typeof questionSchema>;

interface QuestionFormModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: QuestionFormValues) => void;
  initialData?: Partial<QuestionFormValues>;
  existingQuestionIds?: string[]; // To ensure unique IDs if needed, or manage order
}

export default function QuestionFormModal({ isOpen, onOpenChange, onSubmit, initialData }: QuestionFormModalProps) {
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      id: initialData?.id || `q_${Date.now()}`,
      questionText: initialData?.questionText || "",
      answerType: initialData?.answerType || "Text",
      radioOptions: initialData?.radioOptions || [{ value: "" }, { value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "radioOptions",
  });

  const currentAnswerType = form.watch("answerType");

  React.useEffect(() => {
    // Reset radio options if type changes from Radio
    if (currentAnswerType !== "Radio" && (form.getValues("radioOptions")?.length || 0) > 0) {
      form.setValue("radioOptions", []);
    } else if (currentAnswerType === "Radio" && (form.getValues("radioOptions")?.length || 0) < 2) {
      // Ensure at least two empty options if switching to Radio and there aren't enough
      const currentOptions = form.getValues("radioOptions") || [];
      const optionsToAdd = 2 - currentOptions.length;
      for(let i = 0; i < optionsToAdd; i++) {
        append({ value: "" });
      }
    }
  }, [currentAnswerType, form, append]);
  
  React.useEffect(() => {
    // Reset form if initialData changes (e.g. opening modal for new vs edit)
    form.reset({
      id: initialData?.id || `q_${Date.now()}`,
      questionText: initialData?.questionText || "",
      answerType: initialData?.answerType || "Text",
      radioOptions: initialData?.answerType === "Radio" 
                      ? (initialData?.radioOptions && initialData.radioOptions.length >=2 ? initialData.radioOptions : [{value: ""}, {value: ""}]) 
                      : [],
    });
  }, [initialData, form.reset, form]);

  const handleSubmit = (values: QuestionFormValues) => {
    const dataToSubmit = {
        ...values,
        radioOptions: values.answerType === "Radio" ? values.radioOptions : undefined,
    };
    onSubmit(dataToSubmit);
    onOpenChange(false); // Close modal on submit
    form.reset(); // Reset form for next use
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { 
      if (!open) form.reset(); 
      onOpenChange(open); 
    }}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="text-2xl">
                {initialData?.id ? "Edit Question" : "Add New Question"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="px-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pb-6">
              <FormField
                control={form.control}
                name="questionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., What is your primary legal concern?" {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="answerType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Answer Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                      >
                        {answerTypes.map(type => (
                          <FormItem key={type} className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={type} id={`type-${type}`} />
                            </FormControl>
                            <FormLabel htmlFor={`type-${type}`} className="font-normal cursor-pointer">
                              {type}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {currentAnswerType === "Radio" && (
                <div className="space-y-3 pt-2">
                  <FormLabel>Radio Options</FormLabel>
                  {fields.map((item, index) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name={`radioOptions.${index}.value` as const}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input placeholder={`Option ${index + 1}`} {...field} />
                            </FormControl>
                            {fields.length > 2 && (
                              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:text-destructive">
                                <Trash2Icon className="h-4 w-4" />
                                <span className="sr-only">Remove option</span>
                              </Button>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ value: "" })}
                    className="mt-2"
                  >
                    <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Option
                  </Button>
                  {form.formState.errors.radioOptions && !form.formState.errors.radioOptions.message && (
                     <p className="text-sm font-medium text-destructive">
                       {form.formState.errors.radioOptions.root?.message || form.formState.errors.radioOptions?.[0]?.value?.message || "Please correct errors in radio options."}
                     </p>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="p-6 pt-4 border-t sticky bottom-0 bg-background z-10">
              <DialogClose asChild>
                 <Button type="button" variant="outline" onClick={() => { form.reset(); onOpenChange(false); }}>Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Question</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 