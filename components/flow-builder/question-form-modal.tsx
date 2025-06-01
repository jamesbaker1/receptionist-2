"use client";
import React, { useEffect } from 'react';
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
import { PlusCircleIcon, Trash2Icon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

export const answerTypes = [
  "Text", 
  "Yes/No", 
  "Radio", 
  "Numeric", 
  "Range", 
  "MultiSelect"
] as const;

export type AnswerType = typeof answerTypes[number];

export const questionSchema = z.object({
  id: z.string().optional(),
  questionText: z.string().min(1, "Question text is required.").max(500, "Question text must be 500 characters or less."),
  answerType: z.enum(answerTypes, { required_error: "Answer type is required." }),
  radioOptions: z.array(z.object({ value: z.string().min(1, "Option cannot be empty.") })).optional(),
  // Numeric question validation
  numericValidation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    allowDecimals: z.boolean().optional(),
  }).optional(),
  // Range question options
  rangeOptions: z.array(z.object({
    min: z.number(),
    max: z.number(),
    label: z.string(),
  })).optional(),
  // Multi-select options
  multiSelectOptions: z.array(z.object({
    value: z.string().min(1, "Option cannot be empty."),
    label: z.string(),
  })).optional(),
}).refine(data => {
  if (data.answerType === "Radio") {
    return data.radioOptions && data.radioOptions.length >= 2;
  }
  if (data.answerType === "Range") {
    return data.rangeOptions && data.rangeOptions.length >= 2;
  }
  if (data.answerType === "MultiSelect") {
    return data.multiSelectOptions && data.multiSelectOptions.length >= 2;
  }
  if (data.answerType === "Numeric") {
    if (data.numericValidation?.min !== undefined && data.numericValidation?.max !== undefined) {
      return data.numericValidation.min < data.numericValidation.max;
    }
  }
  return true;
}, { 
  message: "Please check the validation rules for your question type.",
  path: ["answerType"]
});

export type QuestionFormValues = z.infer<typeof questionSchema>;

interface QuestionFormModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: QuestionFormValues) => void;
  initialData?: Partial<QuestionFormValues>;
  existingQuestionIds?: string[];
}

export default function QuestionFormModal({ isOpen, onOpenChange, onSubmit, initialData, existingQuestionIds = [] }: QuestionFormModalProps) {
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      id: initialData?.id || `q_${Date.now()}`,
      questionText: initialData?.questionText || "",
      answerType: initialData?.answerType || "Text",
      radioOptions: initialData?.radioOptions || [{ value: "" }, { value: "" }],
      numericValidation: initialData?.numericValidation || { allowDecimals: false },
      rangeOptions: initialData?.rangeOptions || [
        { min: 0, max: 25000, label: "Under $25,000" },
        { min: 25000, max: 50000, label: "$25,000 - $50,000" },
        { min: 50000, max: 100000, label: "$50,000 - $100,000" },
        { min: 100000, max: Infinity, label: "Over $100,000" }
      ],
      multiSelectOptions: initialData?.multiSelectOptions || [{ value: "", label: "" }],
    },
  });

  const { fields: radioFields, append: appendRadio, remove: removeRadio } = useFieldArray({
    control: form.control,
    name: "radioOptions",
  });

  const { fields: rangeFields, append: appendRange, remove: removeRange } = useFieldArray({
    control: form.control,
    name: "rangeOptions",
  });

  const { fields: multiSelectFields, append: appendMultiSelect, remove: removeMultiSelect } = useFieldArray({
    control: form.control,
    name: "multiSelectOptions",
  });

  const currentAnswerType = form.watch("answerType");

  React.useEffect(() => {
    // Reset form if initialData changes (e.g. opening modal for new vs edit)
    form.reset({
      id: initialData?.id || `q_${Date.now()}`,
      questionText: initialData?.questionText || "",
      answerType: initialData?.answerType || "Text",
      radioOptions: initialData?.answerType === "Radio" 
        ? (initialData?.radioOptions && initialData.radioOptions.length >= 2 ? initialData.radioOptions : [{value: ""}, {value:""}]) 
        : [],
      numericValidation: initialData?.numericValidation || { allowDecimals: false },
      rangeOptions: initialData?.rangeOptions || [
        { min: 0, max: 25000, label: "Under $25,000" },
        { min: 25000, max: 50000, label: "$25,000 - $50,000" },
        { min: 50000, max: 100000, label: "$50,000 - $100,000" },
        { min: 100000, max: Infinity, label: "Over $100,000" }
      ],
      multiSelectOptions: initialData?.multiSelectOptions || [{ value: "", label: "" }],
    });
  }, [initialData, form.reset]);

  const handleSubmit = (values: QuestionFormValues) => {
    const dataToSubmit = {
      ...values,
      radioOptions: values.answerType === "Radio" ? values.radioOptions : undefined,
      rangeOptions: values.answerType === "Range" ? values.rangeOptions : undefined,
      multiSelectOptions: values.answerType === "MultiSelect" ? values.multiSelectOptions : undefined,
      numericValidation: values.answerType === "Numeric" ? values.numericValidation : undefined,
    };
    onSubmit(dataToSubmit);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { 
      if (!open) form.reset(); 
      onOpenChange(open); 
    }}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl p-0 flex flex-col max-h-[90vh]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full">
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="text-2xl">
                {initialData?.id ? "Edit Question" : "Add New Question"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="px-6 space-y-4 flex-1 overflow-y-auto pb-8">
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

              {currentAnswerType === "Numeric" && (
                <div className="space-y-3 pt-2">
                  <FormLabel>Numeric Validation</FormLabel>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="numericValidation.min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Value</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="numericValidation.max"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Value</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="numericValidation.allowDecimals"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Allow decimal values</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {currentAnswerType === "Range" && (
                <div className="space-y-3 pt-2">
                  <FormLabel>Range Options</FormLabel>
                  {rangeFields.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-3 gap-2">
                      <FormField
                        control={form.control}
                        name={`rangeOptions.${index}.min`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Min" 
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`rangeOptions.${index}.max`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Max" 
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`rangeOptions.${index}.label`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Label" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendRange({ min: 0, max: 0, label: "" })}
                    className="mt-2"
                  >
                    <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Range
                  </Button>
                </div>
              )}

              {currentAnswerType === "MultiSelect" && (
                <div className="space-y-3 pt-2">
                  <FormLabel>Multi-select Options</FormLabel>
                  {multiSelectFields.map((item, index) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name={`multiSelectOptions.${index}.label`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input placeholder={`Option ${index + 1}`} {...field} />
                            </FormControl>
                            {multiSelectFields.length > 2 && (
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeMultiSelect(index)} className="text-destructive hover:text-destructive">
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
                    onClick={() => appendMultiSelect({ value: "", label: "" })}
                    className="mt-2"
                  >
                    <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Option
                  </Button>
                </div>
              )}

              {currentAnswerType === "Radio" && (
                <div className="space-y-3 pt-2">
                  <FormLabel>Radio Options</FormLabel>
                  {radioFields.map((item, index) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name={`radioOptions.${index}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input placeholder={`Option ${index + 1}`} {...field} />
                            </FormControl>
                            {radioFields.length > 2 && (
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeRadio(index)} className="text-destructive hover:text-destructive">
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
                    onClick={() => appendRadio({ value: "" })}
                    className="mt-2"
                  >
                    <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Option
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter className="p-6 pt-8 border-t bg-background">
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