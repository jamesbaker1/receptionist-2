"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlusCircleIcon, Trash2Icon, Edit2Icon, ArrowRightIcon, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { type QuestionFormValues } from "./question-form-modal"; // Assuming this path is correct
import { nanoid } from 'nanoid';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export interface LogicRule {
  id: string;
  sourceQuestionId: string;
  conditions: Array<{
    type: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN_RANGE' | 'CONTAINS' | 'NOT_CONTAINS';
    value: string | number | number[];
    operator?: 'AND' | 'OR';
  }>;
  targetQuestionId: string;
  isDefault?: boolean;
}

interface Step3ConditionalLogicProps {
  questions: QuestionFormValues[];
  onSubmit: (data: { logicRules: LogicRule[] }) => void;
  initialData?: { logicRules?: LogicRule[] };
  onBack: () => void;
}

const END_CALL_ID = "END_CALL";
const END_CALL_TEXT = "End Call";

export default function Step3ConditionalLogic({
  questions,
  onSubmit,
  initialData,
  onBack,
}: Step3ConditionalLogicProps) {
  const [logicRules, setLogicRules] = useState<LogicRule[]>(initialData?.logicRules || []);
  const [editingRule, setEditingRule] = useState<LogicRule | null>(null);
  const [currentRule, setCurrentRule] = useState<Partial<LogicRule>>({ 
    id: nanoid(5),
    conditions: [{ type: 'EQUALS', value: '', operator: 'AND' }]
  });
  const [ruleBuilderMode, setRuleBuilderMode] = useState<'quick' | 'advanced'>('quick');

  // Update currentRule when editingRule changes
  React.useEffect(() => {
    if (editingRule) {
      setCurrentRule(editingRule);
    } else {
      setCurrentRule({ id: nanoid(5), conditions: [{ type: 'EQUALS', value: '', operator: 'AND' }] });
    }
  }, [editingRule]);

  const handleAddOrUpdateRule = (rule: LogicRule) => {
    setLogicRules(prev => {
      const existingIndex = prev.findIndex(r => r.id === rule.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = rule;
        return updated;
      }
      return [...prev, rule];
    });
    setEditingRule(null);
  };

  const startEditRule = (rule: LogicRule) => {
    setEditingRule(rule);
    // TODO: Open modal/form here, prefilled with rule data
  };

  const deleteRule = (ruleId: string) => {
    setLogicRules(prev => prev.filter(r => r.id !== ruleId));
  };
  
  const getQuestionTextById = (questionId: string): string => {
    if (questionId === END_CALL_ID) return END_CALL_TEXT;
    const question = questions.find(q => q.id === questionId);
    return question ? question.questionText : "Unknown Question";
  };

  const handleFormSubmit = () => {
    console.log("Step 3 Data:", { logicRules });
    onSubmit({ logicRules });
  };

  const renderQuickRuleForm = () => {
    const sourceQuestion = questions.find(q => q.id === currentRule.sourceQuestionId);
    const condition = currentRule.conditions?.[0];

    const handleSave = () => {
      if (!currentRule.sourceQuestionId || !currentRule.targetQuestionId) {
        alert("Please select source and target questions.");
        return;
      }
      if (currentRule.sourceQuestionId === currentRule.targetQuestionId) {
        alert("Source and target questions cannot be the same.");
        return;
      }
      if (!condition?.value) {
        alert("Please enter a condition value.");
        return;
      }

      const ruleToSave: LogicRule = {
        ...currentRule,
        conditions: [condition]
      } as LogicRule;

      handleAddOrUpdateRule(ruleToSave);
      setCurrentRule({ 
        id: nanoid(5),
        conditions: [{ type: 'EQUALS', value: '', operator: 'AND' }]
      });
      setEditingRule(null);
    };

    const availableTargetQuestions = [
        ...questions.filter(q => q.id !== currentRule.sourceQuestionId),
        { id: END_CALL_ID, questionText: END_CALL_TEXT, answerType: 'Text' as const}
    ];

    return (
      <Card className="mt-6 mb-6 p-0">
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-lg flex items-center">
            Quick Rule Builder
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create simple "if-then" rules quickly. For complex rules with multiple conditions, use Advanced mode.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Source Question */}
            <div className="space-y-2">
              <Label>When client answers</Label>
              <Select
                value={currentRule.sourceQuestionId}
                onValueChange={(val: string) => setCurrentRule({ 
                  ...currentRule, 
                  sourceQuestionId: val, 
                  conditions: [{ type: 'EQUALS', value: '', operator: 'AND' }] 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question..." />
                </SelectTrigger>
                <SelectContent>
                  {questions.map(q => <SelectItem key={q.id} value={q.id!}>{q.questionText}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Condition & Value */}
            <div className="space-y-2">
              <Label>Is</Label>
              <div className="flex gap-2">
                <Select
                  value={condition?.type || 'EQUALS'}
                  onValueChange={(val: LogicRule['conditions'][0]['type']) => {
                    const newConditions = [{ 
                      ...condition, 
                      type: val,
                      value: condition?.value || '',
                      operator: condition?.operator || 'AND'
                    }];
                    setCurrentRule(prev => ({ ...prev, conditions: newConditions }));
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EQUALS">Equals</SelectItem>
                    <SelectItem value="NOT_EQUALS">Not Equals</SelectItem>
                    <SelectItem value="GREATER_THAN">Greater Than</SelectItem>
                    <SelectItem value="LESS_THAN">Less Than</SelectItem>
                    <SelectItem value="CONTAINS">Contains</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  className="flex-1"
                  type={sourceQuestion?.answerType === 'Numeric' ? 'number' : 'text'}
                  placeholder="Value"
                  value={condition?.value as string || ''}
                  onChange={e => {
                    const newConditions = [{
                      type: condition?.type || 'EQUALS',
                      value: sourceQuestion?.answerType === 'Numeric' ? Number(e.target.value) : e.target.value,
                      operator: condition?.operator || 'AND'
                    }];
                    setCurrentRule(prev => ({ ...prev, conditions: newConditions }));
                  }}
                />
              </div>
            </div>

            {/* Target Question */}
            <div className="space-y-2">
              <Label>Then go to</Label>
              <Select
                value={currentRule.targetQuestionId}
                onValueChange={(val: string) => setCurrentRule({ ...currentRule, targetQuestionId: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select next question..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTargetQuestions.map(q => (
                    <SelectItem key={q.id} value={q.id!}>
                      {q.questionText.length > 40 ? `${q.questionText.substring(0, 40)}...` : q.questionText}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Default Rule Checkbox */}
          {currentRule.sourceQuestionId && (
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id={`default-rule-${currentRule.id}`} 
                checked={currentRule.isDefault || false}
                onCheckedChange={(checked) => setCurrentRule(prev => ({...prev, isDefault: !!checked}))}
              />
              <Label htmlFor={`default-rule-${currentRule.id}`} className="text-sm font-normal">
                Make this the default path if no other conditions are met
              </Label>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="ghost" onClick={() => { 
              setEditingRule(null); 
              setCurrentRule({ id: nanoid(5), conditions: [{ type: 'EQUALS', value: '', operator: 'AND' }] }); 
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editingRule ? "Update Rule" : "Save Rule"}</Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAdvancedRuleForm = () => {
    const sourceQuestion = questions.find(q => q.id === currentRule.sourceQuestionId);

    const handleSave = () => {
      if (!currentRule.sourceQuestionId || !currentRule.targetQuestionId) {
        alert("Please select source and target questions.");
        return;
      }
      if (currentRule.sourceQuestionId === currentRule.targetQuestionId) {
        alert("Source and target questions cannot be the same.");
        return;
      }
      if (!currentRule.conditions || currentRule.conditions.length === 0) {
        alert("Please add at least one condition.");
        return;
      }

      handleAddOrUpdateRule(currentRule as LogicRule);
      setCurrentRule({ 
        id: nanoid(5),
        conditions: [{ type: 'EQUALS', value: '', operator: 'AND' }]
      });
      setEditingRule(null);
    };

    const addCondition = () => {
      setCurrentRule(prev => ({
        ...prev,
        conditions: [
          ...(prev.conditions || []),
          { type: 'EQUALS', value: '', operator: 'AND' }
        ]
      }));
    };

    const removeCondition = (index: number) => {
      setCurrentRule(prev => ({
        ...prev,
        conditions: prev.conditions?.filter((_, i) => i !== index)
      }));
    };

    const availableTargetQuestions = [
        ...questions.filter(q => q.id !== currentRule.sourceQuestionId),
        { id: END_CALL_ID, questionText: END_CALL_TEXT, answerType: 'Text' as const}
    ];

    return (
      <Card className="mt-6 mb-6 p-0">
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-lg flex items-center">
            Advanced Rule Builder
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create complex rules with multiple conditions, ranges, and AND/OR logic.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-4">
            {/* Source Question */}
            <div className="space-y-1">
              <Label>When client answers</Label>
              <Select
                value={currentRule.sourceQuestionId}
                onValueChange={(val: string) => setCurrentRule({ ...currentRule, sourceQuestionId: val, conditions: [{ type: 'EQUALS', value: '', operator: 'AND' }] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select question..." />
                </SelectTrigger>
                <SelectContent>
                  {questions.map(q => <SelectItem key={q.id} value={q.id!}>{q.questionText}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Conditions */}
            <div className="space-y-3">
              <Label className="flex items-center">
                Conditions
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 ml-1.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add multiple conditions with AND/OR logic for complex rules.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              {currentRule.conditions?.map((condition, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 items-start">
                  {index > 0 && (
                    <Select
                      value={condition.operator}
                      onValueChange={(val: 'AND' | 'OR') => {
                        const newConditions = [...(currentRule.conditions || [])];
                        newConditions[index] = { ...condition, operator: val };
                        setCurrentRule(prev => ({ ...prev, conditions: newConditions }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="AND/OR" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Select
                    value={condition.type}
                    onValueChange={(val: LogicRule['conditions'][0]['type']) => {
                      const newConditions = [...(currentRule.conditions || [])];
                      newConditions[index] = { ...condition, type: val };
                      setCurrentRule(prev => ({ ...prev, conditions: newConditions }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EQUALS">Equals</SelectItem>
                      <SelectItem value="NOT_EQUALS">Not Equals</SelectItem>
                      <SelectItem value="GREATER_THAN">Greater Than</SelectItem>
                      <SelectItem value="LESS_THAN">Less Than</SelectItem>
                      <SelectItem value="IN_RANGE">In Range</SelectItem>
                      <SelectItem value="CONTAINS">Contains</SelectItem>
                      <SelectItem value="NOT_CONTAINS">Not Contains</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Value input based on condition type */}
                  {condition.type === 'IN_RANGE' ? (
                    <div className="col-span-2 grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={(condition.value as number[])?.[0] || ''}
                        onChange={e => {
                          const newConditions = [...(currentRule.conditions || [])];
                          const currentValue = condition.value as number[] || [0, 0];
                          newConditions[index] = {
                            ...condition,
                            value: [Number(e.target.value), currentValue[1]]
                          };
                          setCurrentRule(prev => ({ ...prev, conditions: newConditions }));
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={(condition.value as number[])?.[1] || ''}
                        onChange={e => {
                          const newConditions = [...(currentRule.conditions || [])];
                          const currentValue = condition.value as number[] || [0, 0];
                          newConditions[index] = {
                            ...condition,
                            value: [currentValue[0], Number(e.target.value)]
                          };
                          setCurrentRule(prev => ({ ...prev, conditions: newConditions }));
                        }}
                      />
                    </div>
                  ) : (
                    <div className="col-span-2 flex gap-2">
                      <Input
                        type={sourceQuestion?.answerType === 'Numeric' ? 'number' : 'text'}
                        placeholder="Value"
                        value={condition.value as string}
                        onChange={e => {
                          const newConditions = [...(currentRule.conditions || [])];
                          newConditions[index] = {
                            ...condition,
                            value: sourceQuestion?.answerType === 'Numeric' ? Number(e.target.value) : e.target.value
                          };
                          setCurrentRule(prev => ({ ...prev, conditions: newConditions }));
                        }}
                      />
                      <Button variant="ghost" size="icon" onClick={() => removeCondition(index)} className="text-destructive">
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {index === 0 && currentRule.conditions && currentRule.conditions.length === 1 && (
                     <div className="col-span-1"/> // Spacer to align remove button
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addCondition}>
                <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Condition Group
              </Button>
            </div>

            {/* Target Question */}
            <div className="space-y-1">
              <Label>Then navigate to</Label>
              <Select
                value={currentRule.targetQuestionId}
                onValueChange={(val: string) => setCurrentRule({ ...currentRule, targetQuestionId: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select next question..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTargetQuestions.map(q => (
                    <SelectItem key={q.id} value={q.id!}>
                      {q.questionText.length > 50 ? `${q.questionText.substring(0, 50)}...` : q.questionText}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Default Rule Checkbox */}
            {currentRule.sourceQuestionId && (
                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                        id={`default-rule-${currentRule.id}`} 
                        checked={currentRule.isDefault || false}
                        onCheckedChange={(checked) => setCurrentRule(prev => ({...prev, isDefault: !!checked}))}
                    />
                    <Label htmlFor={`default-rule-${currentRule.id}`} className="text-sm font-normal">
                        Make this the default path if no conditions for &quot;{getQuestionTextById(currentRule.sourceQuestionId!)}&quot; are met.
                    </Label>
                </div>
            )}

          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="ghost" onClick={() => { setEditingRule(null); setCurrentRule({ id: nanoid(5), conditions: [{ type: 'EQUALS', value: '', operator: 'AND' }] }); }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editingRule ? "Update Rule" : "Save Rule"}</Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRuleForm = () => {
    return (
      <Tabs value={ruleBuilderMode} onValueChange={(value) => setRuleBuilderMode(value as 'quick' | 'advanced')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quick">Quick Rule</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Builder</TabsTrigger>
        </TabsList>
        <TabsContent value="quick" className="mt-0">
          {renderQuickRuleForm()}
        </TabsContent>
        <TabsContent value="advanced" className="mt-0">
          {renderAdvancedRuleForm()}
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <div className="space-y-6 p-1">
      <div>
        <h2 className="text-2xl font-semibold">Conditional Logic</h2>
        <p className="text-muted-foreground mt-1">
          Create rules to guide users through the flow based on their answers. Example: IF &apos;Question A&apos; is &apos;Yes&apos; THEN go to &apos;Question C&apos;.
        </p>
      </div>

      {renderRuleForm()}

      {logicRules.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <ArrowRightIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">No logic rules yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add rules to create conditional paths in your flow.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Existing Logic Rules</h3>
          {logicRules.map(rule => (
            <Card key={rule.id} className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-grow">
                    <p className="text-sm font-semibold">
                      IF <Badge variant="secondary" className="mr-1">{getQuestionTextById(rule.sourceQuestionId)}</Badge>
                      {rule.conditions.map((cond, idx) => (
                        <React.Fragment key={idx}>
                          {idx > 0 && <span className="font-bold text-xs mx-1">{cond.operator}</span>}
                          <Badge variant="outline" className="mx-0.5">
                            {cond.type} &quot;{String(cond.value)}&quot;
                          </Badge>
                        </React.Fragment>
                      ))}
                    </p>
                    <p className="text-sm">
                      THEN go to <Badge variant="secondary">{getQuestionTextById(rule.targetQuestionId)}</Badge>
                      {rule.isDefault && <Badge variant="default" className="ml-2 text-xs">DEFAULT</Badge>}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="icon" onClick={() => startEditRule(rule)} className="h-8 w-8">
                        <Edit2Icon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)} className="h-8 w-8 text-destructive">
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-8">
        <Button variant="outline" onClick={onBack}>
          Back to Questions
        </Button>
        <Button onClick={handleFormSubmit}>
          Next: Tool Calls
        </Button>
      </div>
    </div>
  );
} 