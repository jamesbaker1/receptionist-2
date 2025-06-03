"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Zap, Settings } from 'lucide-react';
import { Question, /* LogicRule, */ AnswerType as FlowAnswerTypeEnum } from '@/types/flow';

// Enhanced schema to support both simple and complex conditions
export const logicRuleSchema = z.object({
  id: z.string().optional(),
  // sourceQuestionId is managed by the parent component
  condition: z.string().min(1, 'Condition is required.'),
  targetQuestionId: z.string().min(1, 'Target destination is required.'),
  // Advanced fields for complex conditions
  conditionType: z.enum(['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'CONTAINS', 'NOT_CONTAINS', 'IN_RANGE']).optional(),
  customValue: z.string().optional(),
  isDefault: z.boolean().optional(),
  priority: z.number().optional(),
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

// Quick template configurations for common rule types
const QUICK_TEMPLATES = {
  YES_NO: [
    { label: "If Yes → End Call", condition: "Yes", target: END_CALL_VALUE },
    { label: "If No → Next Question", condition: "No", target: "NEXT_QUESTION" },
  ],
  RADIO: [
    { label: "If specific option → End Call", condition: "PLACEHOLDER", target: END_CALL_VALUE },
    { label: "If specific option → Jump to question", condition: "PLACEHOLDER", target: "NEXT_QUESTION" },
  ],
  TEXT: [
    { label: "If answered → Continue", condition: "Is Answered", target: "NEXT_QUESTION" },
    { label: "If contains keyword → Special flow", condition: "Contains", target: "NEXT_QUESTION" },
  ]
};

export default function LogicRuleForm({ 
    isOpen, 
    onOpenChange, 
    onSubmit, 
    initialData, 
    sourceQuestion, 
    allQuestions 
}: LogicRuleFormProps) {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  const form = useForm<LogicRuleFormValues>({
    resolver: zodResolver(logicRuleSchema),
    defaultValues: {
        id: initialData?.id,
        condition: initialData?.condition || "",
        targetQuestionId: initialData?.targetQuestionId || "",
        conditionType: initialData?.conditionType || 'EQUALS',
        customValue: initialData?.customValue || "",
        isDefault: initialData?.isDefault || false,
        priority: initialData?.priority || 1,
    },
  });

  useEffect(() => {
    form.reset({
        id: initialData?.id,
        condition: initialData?.condition || "",
        targetQuestionId: initialData?.targetQuestionId || "",
        conditionType: initialData?.conditionType || 'EQUALS',
        customValue: initialData?.customValue || "",
        isDefault: initialData?.isDefault || false,
        priority: initialData?.priority || 1,
    });
    // Set advanced mode if editing an existing complex rule
    setIsAdvancedMode(!!initialData?.conditionType && initialData.conditionType !== 'EQUALS');
  }, [initialData, form]);

  const getAvailableConditions = () => {
    switch (sourceQuestion.type) {
        case FlowAnswerTypeEnum.YES_NO:
            return [{ value: "Yes" }, { value: "No" }];
        case FlowAnswerTypeEnum.RADIO:
            return sourceQuestion.options.map(opt => ({ value: opt }));
        case FlowAnswerTypeEnum.TEXT:
            return isAdvancedMode 
              ? [{ value: "Is Answered" }, { value: "CUSTOM" }]
              : [{ value: "Is Answered" }];
        default:
            return [];
    }
  };

  const availableConditions = getAvailableConditions();
  // Filter out the sourceQuestion itself from target options, prevent self-looping on the same condition for some types.
  const availableTargetQuestions = allQuestions.filter(q => q.id !== sourceQuestion.id);

  const applyTemplate = (template: typeof QUICK_TEMPLATES.YES_NO[0]) => {
    if (template.condition === "PLACEHOLDER" && sourceQuestion.type === FlowAnswerTypeEnum.RADIO && sourceQuestion.options.length > 0) {
      form.setValue('condition', sourceQuestion.options[0]);
    } else {
      form.setValue('condition', template.condition);
    }
    
    if (template.target === "NEXT_QUESTION" && availableTargetQuestions.length > 0) {
      form.setValue('targetQuestionId', availableTargetQuestions[0].id);
    } else {
      form.setValue('targetQuestionId', template.target);
    }
  };

  const handleSubmit = (values: LogicRuleFormValues) => {
    onSubmit(values);
    onOpenChange(false);
    form.reset();
  };

  const resetForm = () => {
    form.reset();
    setIsAdvancedMode(false);
  };

  const templates = QUICK_TEMPLATES[sourceQuestion.type as keyof typeof QUICK_TEMPLATES] || [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) resetForm(); onOpenChange(open);}}>
      <DialogContent className="sm:max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {initialData?.id ? 'Edit Logic Rule' : 'Add New Logic Rule'}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Create conditional logic to control the flow based on user responses</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </DialogTitle>
              <p className='text-sm text-muted-foreground'>For question: &quot;{sourceQuestion.text}&quot;</p>
            </DialogHeader>

            <Tabs defaultValue="simple" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="simple" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Quick Setup
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Custom Rule
                </TabsTrigger>
              </TabsList>

              <TabsContent value="simple" className="space-y-4 mt-6">
                {templates.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Choose a template to get started:</Label>
                    <div className="grid gap-2">
                      {templates.map((template, index) => (
                        <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => applyTemplate(template)}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{template.label}</span>
                              <Badge variant="outline" className="text-xs">Template</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IF this question is answered...</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select condition" />
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="conditionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Condition Type
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Choose how to compare the user&apos;s answer</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="EQUALS">Equals</SelectItem>
                            <SelectItem value="NOT_EQUALS">Not Equals</SelectItem>
                            <SelectItem value="CONTAINS">Contains</SelectItem>
                            <SelectItem value="NOT_CONTAINS">Does Not Contain</SelectItem>
                            {sourceQuestion.type === FlowAnswerTypeEnum.TEXT && (
                              <>
                                <SelectItem value="GREATER_THAN">Greater Than</SelectItem>
                                <SelectItem value="LESS_THAN">Less Than</SelectItem>
                                <SelectItem value="IN_RANGE">In Range</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Compare Against</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select value" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableConditions.map(cond => (
                              <SelectItem key={cond.value} value={cond.value}>{cond.value}</SelectItem>
                            ))}
                            <SelectItem value="CUSTOM">Custom Value</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch('condition') === 'CUSTOM' && (
                  <FormField
                    control={form.control}
                    name="customValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Value</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter custom value to compare against" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="targetQuestionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>THEN go to...</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Advanced Settings Accordion */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="advanced-settings">
                    <AccordionTrigger>Advanced Settings</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="isDefault"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Default Rule</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Apply this rule when no other conditions match
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Rule Priority
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Lower numbers = higher priority (1 is highest)</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                placeholder="1"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </DialogClose>
              <Button type="submit">{initialData?.id ? 'Save Changes' : 'Add Rule'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 