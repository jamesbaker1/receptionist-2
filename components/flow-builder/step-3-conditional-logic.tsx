"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
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
    setIsRuleModalOpen(false);
  };

  const openEditRuleModal = (rule: LogicRule) => {
    setEditingRule(rule);
    setIsRuleModalOpen(true);
  };

  const openNewRuleModal = () => {
    setEditingRule(null);
    setCurrentRule({ 
      id: nanoid(5),
      conditions: [{ type: 'EQUALS', value: '', operator: 'AND' }]
    });
    setIsRuleModalOpen(true);
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
    };

    const availableTargetQuestions = [
        ...questions.filter(q => q.id !== currentRule.sourceQuestionId),
        { id: END_CALL_ID, questionText: END_CALL_TEXT, answerType: 'Text' as const}
    ];

    return (
      <div className="space-y-4">
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
          <Button variant="ghost" onClick={() => setIsRuleModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{editingRule ? "Update Rule" : "Save Rule"}</Button>
        </div>
      </div>
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
              {index === 0 && <div></div>}
              <Select
                value={condition.type}
                onValueChange={(val: LogicRule['conditions'][0]['type']) => {
                  const newConditions = [...(currentRule.conditions || [])];
                  newConditions[index] = { ...condition, type: val };
                  setCurrentRule(prev => ({ ...prev, conditions: newConditions }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EQUALS">Equals</SelectItem>
                  <SelectItem value="NOT_EQUALS">Not Equals</SelectItem>
                  <SelectItem value="GREATER_THAN">Greater Than</SelectItem>
                  <SelectItem value="LESS_THAN">Less Than</SelectItem>
                  <SelectItem value="CONTAINS">Contains</SelectItem>
                  <SelectItem value="NOT_CONTAINS">Does Not Contain</SelectItem>
                  {sourceQuestion?.answerType === 'Numeric' && (
                    <SelectItem value="IN_RANGE">In Range</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                {condition.type === 'IN_RANGE' ? (
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={Array.isArray(condition.value) ? condition.value[0] : ''}
                      onChange={e => {
                        const newConditions = [...(currentRule.conditions || [])];
                        const currentValue = Array.isArray(condition.value) ? condition.value : [0, 0];
                        newConditions[index] = { ...condition, value: [Number(e.target.value), currentValue[1]] };
                        setCurrentRule(prev => ({ ...prev, conditions: newConditions }));
                      }}
                      className="w-20"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={Array.isArray(condition.value) ? condition.value[1] : ''}
                      onChange={e => {
                        const newConditions = [...(currentRule.conditions || [])];
                        const currentValue = Array.isArray(condition.value) ? condition.value : [0, 0];
                        newConditions[index] = { ...condition, value: [currentValue[0], Number(e.target.value)] };
                        setCurrentRule(prev => ({ ...prev, conditions: newConditions }));
                      }}
                      className="w-20"
                    />
                  </div>
                ) : (
                  <Input
                    type={sourceQuestion?.answerType === 'Numeric' ? 'number' : 'text'}
                    placeholder="Value"
                    value={Array.isArray(condition.value) ? '' : condition.value || ''}
                    onChange={e => {
                      const newConditions = [...(currentRule.conditions || [])];
                      newConditions[index] = { 
                        ...condition, 
                        value: sourceQuestion?.answerType === 'Numeric' ? Number(e.target.value) : e.target.value 
                      };
                      setCurrentRule(prev => ({ ...prev, conditions: newConditions }));
                    }}
                  />
                )}
                {currentRule.conditions && currentRule.conditions.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeCondition(index)} className="h-8 w-8 text-destructive">
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCondition}
            className="mt-2"
          >
            <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Condition
          </Button>
        </div>

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

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="ghost" onClick={() => setIsRuleModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{editingRule ? "Update Rule" : "Save Rule"}</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-1">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Conditional Logic</h2>
          <p className="text-muted-foreground mt-1">
            Create rules to guide users through the flow based on their answers.
          </p>
        </div>
        <Button onClick={openNewRuleModal}>
          <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Rule
        </Button>
      </div>

      {/* Rule Modal */}
      <Dialog open={isRuleModalOpen} onOpenChange={(open) => { 
        if (!open) {
          setEditingRule(null);
          setCurrentRule({ id: nanoid(5), conditions: [{ type: 'EQUALS', value: '', operator: 'AND' }] });
        }
        setIsRuleModalOpen(open); 
      }}>
        <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl p-0 flex flex-col max-h-[85vh]">
          <DialogHeader className="p-6 pb-4 flex-shrink-0">
            <DialogTitle className="text-2xl flex items-center">
              {editingRule ? "Edit Logic Rule" : "Add New Logic Rule"}
              <TooltipProvider>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create conditional logic to control the flow based on user responses</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </DialogTitle>
            <DialogDescription>
              Configure conditional logic to route users through different paths based on their answers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-6 space-y-4 flex-1 overflow-y-auto min-h-0">
            <Tabs value={ruleBuilderMode} onValueChange={(value) => setRuleBuilderMode(value as 'quick' | 'advanced')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="quick">Quick Rule</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Builder</TabsTrigger>
              </TabsList>
              <TabsContent value="quick" className="mt-4">
                {renderQuickRuleForm()}
              </TabsContent>
              <TabsContent value="advanced" className="mt-4">
                {renderAdvancedRuleForm()}
              </TabsContent>
            </Tabs>
            
            {/* Add some bottom padding to ensure footer doesn't overlap content */}
            <div className="pb-4"></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Display existing rules or empty state */}
      {logicRules.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <ArrowRightIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No logic rules yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Click &quot;Add Rule&quot; to create conditional paths in your flow.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Current Rules</h3>
          {logicRules.map(rule => (
            <Card key={rule.id} className="border bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm">
                    <span>When <strong>&quot;{getQuestionTextById(rule.sourceQuestionId)}&quot;</strong></span>
                    <ArrowRightIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    
                    {rule.conditions.map((condition, condIndex) => (
                      <React.Fragment key={condIndex}>
                        {condIndex > 0 && <span className="font-medium">{condition.operator}</span>}
                        <span>
                          {condition.type === 'EQUALS' && 'equals'}
                          {condition.type === 'NOT_EQUALS' && 'does not equal'}
                          {condition.type === 'GREATER_THAN' && 'is greater than'}
                          {condition.type === 'LESS_THAN' && 'is less than'}
                          {condition.type === 'IN_RANGE' && 'is between'}
                          {condition.type === 'CONTAINS' && 'contains'}
                          {condition.type === 'NOT_CONTAINS' && 'does not contain'}
                          {' '}
                          <strong>
                            {Array.isArray(condition.value)
                              ? `${condition.value[0]} and ${condition.value[1]}`
                              : condition.value}
                          </strong>
                        </span>
                      </React.Fragment>
                    ))}
                    <ArrowRightIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span>then go to <strong>&quot;{getQuestionTextById(rule.targetQuestionId)}&quot;</strong></span>
                    {rule.isDefault && <Badge variant="secondary">Default</Badge>}
                  </div>

                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditRuleModal(rule)} className="h-8 w-8 text-gray-500 hover:text-blue-600">
                        <Edit2Icon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)} className="h-8 w-8 text-gray-500 hover:text-destructive">
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