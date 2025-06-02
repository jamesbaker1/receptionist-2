"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Input } from '@/components/ui/input'; // For potential future use with text conditions
import { Question, /* LogicRule, */ AnswerType as FlowAnswerTypeEnum } from '@/types/flow';

export const logicRuleSchema = z.object({
  id: z.string().optional(),
  // sourceQuestionId is managed by the parent component
  condition: z.string().min(1, 'Condition is required.'),
  targetQuestionId: z.string().min(1, 'Target destination is required.'),
}).refine(data => data.condition !== data.targetQuestionId, { // Basic validation, can be more specific
    message: "Source condition/value cannot lead to itself directly if it's a question ID.", // This message might need refinement
    path: ["targetQuestionId"],
});

export type LogicRuleFormValues = z.infer<typeof logicRuleSchema>;

interface LogicRuleFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: LogicRuleFormValues) => void;
  initialData?: Partial<LogicRuleFormValues>;
  sourceQuestion: Question; // The question for which the rule is being defined
  allQuestions: Question[]; // All questions in the flow, for target selection
}

const END_CALL_VALUE = "END_CALL";

export default function LogicRuleForm({ 
    isOpen, 
    onOpenChange, 
    onSubmit, 
    initialData, 
    sourceQuestion, 
    allQuestions 
}: LogicRuleFormProps) {
  const form = useForm<LogicRuleFormValues>({
    resolver: zodResolver(logicRuleSchema),
    defaultValues: {
        id: initialData?.id,
        condition: initialData?.condition || "",
        targetQuestionId: initialData?.targetQuestionId || "",
    },
  });

  useEffect(() => {
    form.reset({
        id: initialData?.id,
        condition: initialData?.condition || "",
        targetQuestionId: initialData?.targetQuestionId || "",
    });
  }, [initialData, form]);

  const getAvailableConditions = () => {
    switch (sourceQuestion.type) {
        case FlowAnswerTypeEnum.YES_NO:
            return [{ value: "Yes" }, { value: "No" }];
        case FlowAnswerTypeEnum.RADIO:
            return sourceQuestion.options.map(opt => ({ value: opt }));
        case FlowAnswerTypeEnum.TEXT:
            return [{ value: "Is Answered" }]; // Simple condition for text
        default:
            return [];
    }
  };

  const availableConditions = getAvailableConditions();
  // Filter out the sourceQuestion itself from target options, prevent self-looping on the same condition for some types.
  const availableTargetQuestions = allQuestions.filter(q => q.id !== sourceQuestion.id);

  const handleSubmit = (values: LogicRuleFormValues) => {
    onSubmit(values);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) form.reset(); onOpenChange(open);}}>
      <DialogContent className="sm:max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>{initialData?.id ? 'Edit Logic Rule' : 'Add New Logic Rule'}</DialogTitle>
              <p className='text-sm text-muted-foreground'>For question: &quot;{sourceQuestion.text}&quot;</p>
            </DialogHeader>

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IF this question is answered...</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={`Select a condition based on &quot;${sourceQuestion.type}&quot; type`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableConditions.map(cond => (
                        <SelectItem key={cond.value} value={cond.value}>{cond.value}</SelectItem>
                      ))}
                      {availableConditions.length === 0 && <p className='p-2 text-sm text-muted-foreground'>No conditions for this type.</p>}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetQuestionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>THEN go to...</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select next step" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={END_CALL_VALUE}>End Call</SelectItem>
                      {availableTargetQuestions.map(q => (
                        <SelectItem key={q.id} value={q.id}>{q.text.substring(0,50)}{q.text.length > 50 ? "..." : ""}</SelectItem>
                      ))}
                      <SelectItem value="startsWith">Starts with</SelectItem>
                      <SelectItem value="endsWith">Ends with</SelectItem>
                      <SelectItem value="isNumeric">Is numeric</SelectItem>
                      <SelectItem value="isNotNumeric">Is not numeric</SelectItem>
                      <SelectItem value="isTrue">Is &quot;True&quot;</SelectItem>
                      <SelectItem value="isFalse">Is &quot;False&quot;</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => {form.reset(); onOpenChange(false);}}>Cancel</Button>
              </DialogClose>
              <Button type="submit">{initialData?.id ? 'Save Changes' : 'Add Rule'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 