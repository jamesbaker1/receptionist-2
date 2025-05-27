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

export interface LogicRule {
  id: string;
  sourceQuestionId: string; // ID of the question that triggers the logic
  condition?: {
    type: 'EQUALS' | 'NOT_EQUALS'; // More types can be added later
    value: string; // This will be the specific answer/option for Text, Yes/No, or Radio
  };
  targetQuestionId: string; // ID of the next question or a special value like "END_CALL"
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
  const [currentRule, setCurrentRule] = useState<Partial<LogicRule>>({ id: nanoid(5) });

  // Update currentRule when editingRule changes
  React.useEffect(() => {
    if (editingRule) {
      setCurrentRule(editingRule);
    } else {
      setCurrentRule({ id: nanoid(5) });
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
            // Basic validation
            alert("Please select source and target questions.");
            return;
        }
        if (currentRule.sourceQuestionId === currentRule.targetQuestionId) {
            alert("Source and target questions cannot be the same.");
            return;
        }
        // For Yes/No and Radio, ensure condition.value is set
        if (sourceQuestion && (sourceQuestion.answerType === 'Yes/No' || sourceQuestion.answerType === 'Radio')) {
            if (!currentRule.condition?.value) {
                alert(`Please select a value for the condition on "${sourceQuestion.questionText}".`);
                return;
            }
        }

      handleAddOrUpdateRule(currentRule as LogicRule);
      setCurrentRule({ id: nanoid(5) }); // Reset for next new rule
      setEditingRule(null); // Close "form"
    };

    if (!editingRule && logicRules.length > 0 && !questions.find(q => logicRules.every(r => r.sourceQuestionId !== q.id))) {
        // If there are rules, but no current editingRule, don't show a new form by default until "Add Rule" is clicked
        // unless there is at least one question not used as a source, to guide user to add logic to it.
    }
    
    const availableTargetQuestions = [
        ...questions.filter(q => q.id !== currentRule.sourceQuestionId),
        { id: END_CALL_ID, questionText: END_CALL_TEXT, answerType: 'Text' as const} // END_CALL can always be a target
    ];

    return (
      <Card className="mt-6 mb-6 p-0">
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-lg">{editingRule ? "Edit Logic Rule" : "Add New Logic Rule"}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {/* IF Question Select */}
            <div className="space-y-1">
              <Label htmlFor={`if-question-${currentRule.id}`}>If question</Label>
              <Select
                value={currentRule.sourceQuestionId}
                onValueChange={(val: string) => setCurrentRule({ ...currentRule, sourceQuestionId: val, condition: undefined })} // Reset condition if source changes
              >
                <SelectTrigger id={`if-question-${currentRule.id}`}> <SelectValue placeholder="Select question..." /> </SelectTrigger>
                <SelectContent>
                  {questions.map(q => <SelectItem key={q.id} value={q.id!}>{q.questionText}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* IS Value (Conditional) */}
            <div className="space-y-1">
            <Label htmlFor={`condition-value-${currentRule.id}`}>Is</Label>
            {sourceQuestion?.answerType === 'Yes/No' && (
                <Select
                    value={currentRule.condition?.value}
                    onValueChange={(val: string) => setCurrentRule({ ...currentRule, condition: { type: 'EQUALS', value: val }})}
                >
                    <SelectTrigger id={`condition-value-${currentRule.id}`}><SelectValue placeholder="Select value..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                </Select>
            )}
            {sourceQuestion?.answerType === 'Radio' && sourceQuestion.radioOptions && (
                 <Select
                    value={currentRule.condition?.value}
                    onValueChange={(val: string) => setCurrentRule({ ...currentRule, condition: { type: 'EQUALS', value: val }})}
                >
                    <SelectTrigger id={`condition-value-${currentRule.id}`}><SelectValue placeholder="Select option..." /></SelectTrigger>
                    <SelectContent>
                        {sourceQuestion.radioOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.value}</SelectItem>)}
                    </SelectContent>
                </Select>
            )}
            {sourceQuestion?.answerType === 'Text' && (
                // For "Text" type, typically logic might be "is answered" / "is not answered"
                // Or a more complex string match. For now, let's assume "is answered" which means any value.
                // We can represent this by not having a specific value to select here, 
                // or by having a single "Is Answered" option.
                // For simplicity, we will assume Text questions always proceed to the target if answered,
                // so no explicit condition value selection here. The rule applies if the text question is answered.
                 <Input 
                    id={`condition-value-${currentRule.id}`}
                    value="(any answer)" 
                    readOnly 
                    className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                />
            )}
            {/* If no source question selected or it's a type without specific conditions yet */}
            {!sourceQuestion && <Input value="-" readOnly className="bg-gray-100 dark:bg-gray-700"/>}
            </div>

            {/* THEN Target Question Select */}
            <div className="space-y-1">
             <Label htmlFor={`then-question-${currentRule.id}`}>Then go to</Label>
              <Select
                value={currentRule.targetQuestionId}
                onValueChange={(val: string) => setCurrentRule({ ...currentRule, targetQuestionId: val })}
              >
                <SelectTrigger id={`then-question-${currentRule.id}`}><SelectValue placeholder="Select next step..." /></SelectTrigger>
                <SelectContent>
                  {availableTargetQuestions.map(q => <SelectItem key={q.id} value={q.id!}>{q.questionText}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            {editingRule && <Button type="button" variant="outline" onClick={() => {setEditingRule(null); setCurrentRule({id: nanoid(5)})}}>Cancel Edit</Button>}
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
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Conditional Logic</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Define rules to control the flow based on answers.</p>
        </div>
        <Button onClick={() => setEditingRule({ id: nanoid(5), sourceQuestionId: '', targetQuestionId: '' })} disabled={questions.length < 1}>
          <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Rule
        </Button>
      </div>

      {editingRule && renderRuleForm()} 

      {logicRules.length === 0 && !editingRule && (
        <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <AlertTriangleIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No logic rules yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Click "Add Rule" to create conditional paths.</p>
          {questions.length < 1 && <p className="mt-1 text-xs text-orange-500">Add at least one question in Step 2 before creating rules.</p>}
        </div>
      )}

      {logicRules.length > 0 && (
        <div className="space-y-3">
          {logicRules.map((rule, index) => (
            <Card key={rule.id} className="bg-white dark:bg-gray-800 shadow-sm">
              <CardContent className="p-3 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm flex-grow flex-wrap">
                    <span className="font-semibold">Rule {index + 1}:</span>
                    <span>IF <strong>"{getQuestionTextById(rule.sourceQuestionId)}"</strong></span>
                    {rule.condition?.value && <span>is <strong>"{rule.condition.value}"</strong></span>}
                    {!rule.condition?.value && questions.find(q => q.id === rule.sourceQuestionId)?.answerType === 'Text' && <span>is answered</span>}
                    <ArrowRightIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mx-1" />
                    <span>THEN <strong>"{getQuestionTextById(rule.targetQuestionId)}"</strong></span>
                </div>
                <div className="flex gap-1 ml-2 flex-shrink-0">
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