"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircleIcon, Trash2Icon, ArrowRightIcon, AlertTriangleIcon, Edit2Icon } from "lucide-react";
import { type QuestionFormValues, answerTypes } from "./question-form-modal"; // Assuming this path is correct
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

  const renderRuleForm = () => {
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
        { id: END_CALL_ID, questionText: END_CALL_TEXT, answerType: 'Text' as const} // END_CALL can always be a target
    ];

    return (
      <Card className="mt-6 mb-6 p-0">
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-lg">Add Question Flow Rule</CardTitle>
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
              <Label>Conditions</Label>
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
                      {currentRule.conditions && currentRule.conditions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCondition(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2Icon className="h-4 w-4" />
                          <span className="sr-only">Remove condition</span>
                        </Button>
                      )}
                    </div>
                  )}
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

            {/* Target Question */}
            <div className="space-y-1">
              <Label>Then ask them</Label>
              <Select
                value={currentRule.targetQuestionId}
                onValueChange={(val: string) => setCurrentRule({ ...currentRule, targetQuestionId: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select next question..." />
                </SelectTrigger>
                <SelectContent>
                  {availableTargetQuestions.map(q => <SelectItem key={q.id} value={q.id!}>{q.questionText}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Default Path */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="default-path"
                  checked={currentRule.isDefault}
                  onCheckedChange={(checked: boolean) => setCurrentRule(prev => ({ ...prev, isDefault: checked }))}
                />
                <Label htmlFor="default-path">This is a default path (if no other conditions match)</Label>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Tip:</strong> You can create complex conditions by combining multiple rules with AND/OR logic. For example, you might want to ask about income verification if they own a Honda Civic AND their income is less than $50,000.
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            {editingRule && <Button type="button" variant="outline" onClick={() => {setEditingRule(null); setCurrentRule({id: nanoid(5)})}}>Cancel</Button>}
            <Button type="button" onClick={handleSave} disabled={!currentRule.sourceQuestionId || !currentRule.targetQuestionId}>
              {editingRule ? "Update Rule" : "Save Rule"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 p-1">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Define Question Flow</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Create rules that determine what questions to ask next based on the client's answers.
          </p>
        </div>
        <Button onClick={() => setEditingRule({ id: nanoid(5), sourceQuestionId: '', targetQuestionId: '', conditions: [{ type: 'EQUALS', value: '', operator: 'AND' }] })} disabled={questions.length < 1}>
          <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Rule
        </Button>
      </div>

      {editingRule && renderRuleForm()}

      {logicRules.length === 0 && !editingRule && (
        <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <AlertTriangleIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No flow rules yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Click "Add Rule" to define what questions should follow each answer.</p>
          {questions.length < 1 && <p className="mt-1 text-xs text-orange-500">Add at least one question in Step 2 before creating rules.</p>}
        </div>
      )}

      {logicRules.length > 0 && (
        <div className="space-y-3">
          {logicRules.map((rule, index) => (
            <Card key={rule.id} className="bg-white dark:bg-gray-800 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-sm flex-grow flex-wrap">
                  <span className="font-semibold">Rule {index + 1}:</span>
                  <span>When client answers <strong>"{getQuestionTextById(rule.sourceQuestionId)}"</strong></span>
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
                  <ArrowRightIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mx-1" />
                  <span>then ask them <strong>"{getQuestionTextById(rule.targetQuestionId)}"</strong></span>
                  {rule.isDefault && <Badge variant="secondary">Default Path</Badge>}
                </div>
                <div className="flex gap-1 ml-2 flex-shrink-0 mt-2">
                  <Button variant="ghost" size="icon" onClick={() => startEditRule(rule)} className="h-8 w-8 text-gray-500 hover:text-custom-primary">
                    <Edit2Icon className="h-4 w-4" />
                    <span className="sr-only">Edit rule</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)} className="h-8 w-8 text-gray-500 hover:text-destructive">
                    <Trash2Icon className="h-4 w-4" />
                    <span className="sr-only">Delete rule</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-8">
        <Button variant="outline" onClick={onBack}>Back to Questions</Button>
        <Button onClick={handleFormSubmit}>
          Next: Tool Calls
        </Button>
      </div>
    </div>
  );
} 