"use client";

import React, { useEffect } from 'react';
import { useForm, useFieldArray /*, Controller*/ } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircleIcon, Trash2Icon } from "lucide-react";
import { Question, AnswerType as FlowAnswerTypeEnum } from "@/types/flow"; // Enum from types/flow
import { questionSchema, QuestionFormValues, answerTypes as answerTypeValues } from "./question-form-modal"; // Zod schema and string union type from modal

// Helper to convert enum to string value for form
const getFormAnswerType = (enumValue: FlowAnswerTypeEnum): QuestionFormValues['answerType'] => {
    return enumValue as string as QuestionFormValues['answerType']; // Relies on enum string values matching union values
};

// Helper to convert form string value back to enum (if needed, though onSubmit provides string union)
/*
const getEnumAnswerType = (formValue: QuestionFormValues['answerType']): FlowAnswerTypeEnum => {
    return FlowAnswerTypeEnum[formValue.toUpperCase().replace("-", "_") as keyof typeof FlowAnswerTypeEnum] || FlowAnswerTypeEnum.TEXT;
};
*/

interface QuestionEditFormProps {
  question: Question; // The question object from types/flow.ts
  onSubmit: (data: QuestionFormValues) => void;
  onCancel?: () => void; // Optional: For a cancel button if needed
  className?: string;
}

export default function QuestionEditForm({ question, onSubmit, onCancel, className }: QuestionEditFormProps) {
  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      id: question.id,
      questionText: question.text || "",
      answerType: getFormAnswerType(question.type), // Convert enum to string for form
      radioOptions: question.type === FlowAnswerTypeEnum.RADIO 
                      ? (question.options?.map(o => ({ value: o })) || [{ value: "" }, { value: "" }]) 
                      : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "radioOptions",
  });

  const currentAnswerType = form.watch("answerType");

  useEffect(() => {
    if (currentAnswerType !== "Radio" && (form.getValues("radioOptions")?.length || 0) > 0) {
      form.setValue("radioOptions", []);
    } else if (currentAnswerType === "Radio" && (form.getValues("radioOptions")?.length || 0) < 2) {
      const currentOptions = form.getValues("radioOptions") || [];
      const optionsToAdd = 2 - currentOptions.length;
      for(let i = 0; i < optionsToAdd; i++) {
        append({ value: "" });
      }
    }
  }, [currentAnswerType, form, append]);
  
  useEffect(() => {
    // Reset form if the question prop changes
    form.reset({
        id: question.id,
        questionText: question.text || "",
        answerType: getFormAnswerType(question.type), // Convert enum to string for form
        radioOptions: question.type === FlowAnswerTypeEnum.RADIO 
                        ? (question.options?.map(o => ({ value: o })) || [{ value: "" }, { value: "" }]) 
                        : [],
    });
  }, [question, form]);

  const handleSubmit = (values: QuestionFormValues) => {
    const dataToSubmit = {
        ...values,
        radioOptions: values.answerType === "Radio" ? values.radioOptions : undefined, // Compare with string literal "Radio"
    };
    onSubmit(dataToSubmit);
    // form.reset(); // Don't reset here, parent component (editor page) controls data flow
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={`space-y-6 ${className || ''}`}>
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
                  defaultValue={field.value} // field.value is already string union from form state
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  {answerTypeValues.map(type => (
                    <FormItem key={type} className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={type} id={`edit-type-${type}`} />
                      </FormControl>
                      <FormLabel htmlFor={`edit-type-${type}`} className="font-normal cursor-pointer">
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

        {currentAnswerType === "Radio" && ( // Compare with string literal "Radio"
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
        
        <div className="flex justify-end space-x-3 pt-4">
            {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
            <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
} 