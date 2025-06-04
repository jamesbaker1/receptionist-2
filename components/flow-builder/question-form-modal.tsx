"use client";
import React/*, { useEffect }*/ from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircleIcon, Trash2Icon, HelpCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
/*
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
*/

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
  // Advanced fields
  adminNotes: z.string().optional(),
  customId: z.string().optional(),
});

export type QuestionFormValues = z.infer<typeof questionSchema>;

interface QuestionFormModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: QuestionFormValues) => void;
  initialData?: Partial<QuestionFormValues>;
  // existingQuestionIds?: string[];
}

export default function QuestionFormModal({ isOpen, onOpenChange, onSubmit, initialData /*, existingQuestionIds = []*/ }: QuestionFormModalProps) {
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
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
      multiSelectOptions: initialData?.answerType === "MultiSelect"
        ? (initialData?.multiSelectOptions && initialData.multiSelectOptions.length >= 2 ? initialData.multiSelectOptions : [{ value: "", label: "" }, { value: "", label: "" }])
        : [],
      adminNotes: initialData?.adminNotes || "",
      customId: initialData?.customId || "",
    },
  });

  const { fields: radioFields, append: appendRadio, remove: removeRadio } = useFieldArray({
    control: form.control,
    name: "radioOptions",
  });

  const { fields: rangeFields, append: appendRange/*, remove: removeRange*/ } = useFieldArray({
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
      multiSelectOptions: initialData?.answerType === "MultiSelect"
        ? (initialData?.multiSelectOptions && initialData.multiSelectOptions.length >= 2 ? initialData.multiSelectOptions : [{ value: "", label: "" }, { value: "", label: "" }])
        : [],
      adminNotes: initialData?.adminNotes || "",
      customId: initialData?.customId || "",
    });
  }, [initialData, form.reset, form]);

  React.useEffect(() => {
    // Ensure minimum fields for Radio questions
    if (currentAnswerType === "Radio" && radioFields.length < 2) {
      const fieldsToAdd = 2 - radioFields.length;
      for (let i = 0; i < fieldsToAdd; i++) {
        appendRadio({ value: "" });
      }
    }
    
    // Ensure minimum fields for MultiSelect questions
    if (currentAnswerType === "MultiSelect" && multiSelectFields.length < 2) {
      const fieldsToAdd = 2 - multiSelectFields.length;
      for (let i = 0; i < fieldsToAdd; i++) {
        appendMultiSelect({ value: "", label: "" });
      }
    }
  }, [currentAnswerType, radioFields.length, multiSelectFields.length, appendRadio, appendMultiSelect]);

  const handleSubmit = (values: QuestionFormValues) => {
    console.log("=== QUESTION FORM SUBMISSION DEBUG ===");
    console.log("Form values:", values);
    console.log("Form errors:", form.formState.errors);
    console.log("Is form valid:", form.formState.isValid);
    console.log("Form isDirty:", form.formState.isDirty);
    console.log("Form isSubmitting:", form.formState.isSubmitting);
    console.log("RadioFields length:", radioFields.length);
    console.log("RadioFields data:", radioFields);
    console.log("MultiSelectFields length:", multiSelectFields.length);
    console.log("MultiSelectFields data:", multiSelectFields);
    
    // Clean up empty options before processing
    const cleanedValues = {
      ...values,
      radioOptions: values.answerType === "Radio" 
        ? values.radioOptions?.filter(opt => opt.value.trim() !== '') 
        : undefined,
      multiSelectOptions: values.answerType === "MultiSelect" 
        ? values.multiSelectOptions?.filter(opt => opt.value.trim() !== '' && opt.label.trim() !== '') 
        : undefined,
    };
    
    console.log("Cleaned values:", cleanedValues);
    
    const dataToSubmit = {
      ...cleanedValues,
      id: cleanedValues.customId || cleanedValues.id, // Use custom ID if provided, otherwise use auto-generated
      radioOptions: cleanedValues.answerType === "Radio" ? cleanedValues.radioOptions : undefined,
      rangeOptions: cleanedValues.answerType === "Range" ? cleanedValues.rangeOptions : undefined,
      multiSelectOptions: cleanedValues.answerType === "MultiSelect" ? cleanedValues.multiSelectOptions : undefined,
      numericValidation: cleanedValues.answerType === "Numeric" ? cleanedValues.numericValidation : undefined,
    };
    
    console.log("Data to submit:", dataToSubmit);
    console.log("=== END DEBUG ===");
    
    onSubmit(dataToSubmit);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { 
      if (!open) form.reset(); 
      onOpenChange(open); 
    }}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl p-0 flex flex-col max-h-[85vh]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full">
            <DialogHeader className="p-6 pb-4 flex-shrink-0">
              <DialogTitle className="text-2xl">
                {initialData?.id ? "Edit Question" : "Add New Question"}
              </DialogTitle>
              <DialogDescription>
                Configure the question text, answer type, and any additional settings.
              </DialogDescription>
            </DialogHeader>
            
            <div className="px-6 space-y-4 flex-1 overflow-y-auto min-h-0">
              {/* Primary Fields - Always Visible */}
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

              {/* Conditional Fields Based on Answer Type - Show based on current selection */}
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

              {currentAnswerType === "MultiSelect" && (
                <div className="space-y-3 pt-2">
                  <FormLabel>Multi-select Options</FormLabel>
                  {multiSelectFields.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name={`multiSelectOptions.${index}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder={`Value ${index + 1}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`multiSelectOptions.${index}.label`}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center gap-2">
                              <FormControl>
                                <Input placeholder={`Label ${index + 1}`} {...field} />
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
                    </div>
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

              {/* Advanced Settings Accordion */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="advanced-settings">
                  <AccordionTrigger>Advanced Settings</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    
                    {/* Answer Type - Moved to Advanced */}
                    <FormField
                      control={form.control}
                      name="answerType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="flex items-center">
                            Answer Type
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 ml-1.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>The AI will automatically detect the answer type, but you can override it here if needed.</p>
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-wrap gap-4"
                            >
                              {answerTypes.map(type => (
                                <FormItem key={type} className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value={type} id={`type-${type}`} />
                                  </FormControl>
                                  <FormLabel htmlFor={`type-${type}`} className="font-normal cursor-pointer text-sm">
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
                    
                    {/* Custom ID Field */}
                    <FormField
                      control={form.control}
                      name="customId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            Custom Question ID
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 ml-1.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Override the auto-generated ID with a custom identifier for this question.</p>
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., legal_concern_primary" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Admin Notes Field */}
                    <FormField
                      control={form.control}
                      name="adminNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            Admin Notes
                            <Tooltip delayDuration={300}>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 ml-1.5 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Internal notes about this question for admin reference. Not visible to users.</p>
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Internal notes about this question for admins..." 
                              {...field} 
                              rows={2} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Numeric Validation - Moved to Advanced */}
                    {currentAnswerType === "Numeric" && (
                      <div className="space-y-3 pt-2">
                        <FormLabel className="flex items-center">
                          Numeric Validation
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 ml-1.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Set constraints on what numeric values users can enter.</p>
                            </TooltipContent>
                          </Tooltip>
                        </FormLabel>
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
                              <FormLabel className="flex items-center">
                                Allow decimal values
                                <Tooltip delayDuration={300}>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 ml-1.5 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>If checked, users can enter decimal values (e.g., 10.5).</p>
                                  </TooltipContent>
                                </Tooltip>
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Range Options Configuration - Moved to Advanced */}
                    {currentAnswerType === "Range" && (
                      <div className="space-y-3 pt-2">
                        <FormLabel className="flex items-center">
                          Range Options
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 ml-1.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Define range options with minimum and maximum values and descriptive labels.</p>
                            </TooltipContent>
                          </Tooltip>
                        </FormLabel>
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

                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              {/* Add some bottom padding to ensure footer doesn't overlap content */}
              <div className="pb-4"></div>
            </div>

            <DialogFooter className="p-6 pt-4 border-t bg-background flex-shrink-0">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => { form.reset(); onOpenChange(false); }}>Cancel</Button>
              </DialogClose>
              <Button type="submit" onClick={() => {
                console.log("Save button clicked!");
                console.log("Form is valid:", form.formState.isValid);
                console.log("Form errors:", form.formState.errors);
                console.log("Current form values:", form.getValues());
              }}>Save Question</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 