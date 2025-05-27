'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// import { type FlowData } from 'app/flows/new/page'; // Path will be removed or defined locally
import { ArrowRightIcon, CheckCircle2Icon, ListChecksIcon, MilestoneIcon, Settings2Icon, WorkflowIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type QuestionFormValues } from "./question-form-modal"; // Assuming this is correct
import { type LogicRule } from "./step-3-conditional-logic"; // Assuming this is correct

// Define FlowData and related types locally for now
// TODO: Consider moving to a shared types file (e.g., types/flow.ts)
interface Step1Data {
    flowName: string;
    templateId?: string;
}

interface Step2Data {
    questions: QuestionFormValues[];
}

interface Step3Data {
    logicRules: LogicRule[];
}

interface Step4Data {
    toolsConfig?: any; // Replace with actual type later
}

export interface FlowData { // Export if it might be used by parent through props typing
    step1Data?: Step1Data;
    step2Data?: Step2Data;
    step3Data?: Step3Data;
    step4Data?: Step4Data;
    // step5Data is not really data for this step, but rather the review itself.
    [key: `step${number}Complete`]: boolean | undefined;
}


// Forward declaration for function from step-3-conditional-logic or a utility
// This is a common pattern if you don't want to create a separate utils file for one function
// or if the function is tightly coupled with logic definitions.
const END_CALL_ID = "END_CALL";
const END_CALL_TEXT = "End Call";

interface Step5ReviewPublishProps {
  flowData: FlowData;
  onPublish: () => void;
  onBack: () => void;
  // onTestFlow: () => void; // For opening the Review & Test Modal later
}

export default function Step5ReviewPublish({ flowData, onPublish, onBack }: Step5ReviewPublishProps) {
  const { step1Data, step2Data, step3Data, step4Data } = flowData;

  const getQuestionTextById = (questionId: string): string => {
    if (questionId === END_CALL_ID) return END_CALL_TEXT;
    const question = step2Data?.questions?.find((q: QuestionFormValues) => q.id === questionId);
    return question ? question.questionText : "Unknown Question";
  };
  
  const handleTestFlow = () => {
    // Placeholder for opening the Review & Test Modal
    alert("'Test Flow' clicked. This will open the Review & Test Modal. (Not yet implemented)");
  };

  return (
    <div className="space-y-6 p-1">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Review & Publish Flow</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Review your flow configuration below. Once satisfied, you can test it or publish it directly.
        </p>
      </div>

      <Card className='shadow-lg'>
        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <WorkflowIcon className="h-6 w-6 text-custom-primary" />
            Flow Summary: {step1Data?.flowName || 'Untitled Flow'}
          </CardTitle>
          <CardDescription>Final check before your flow goes live.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4']} className="w-full">
            {/* Step 1: Name & Template Summary (Implicitly covered by CardTitle) */}
            
            {/* Step 2: Questions Summary */}
            {step2Data?.questions && step2Data.questions.length > 0 && (
              <AccordionItem value="item-2">
                <AccordionTrigger className='text-lg font-medium'>
                    <ListChecksIcon className="h-5 w-5 mr-2 text-custom-primary" /> Questions ({step2Data.questions.length})
                </AccordionTrigger>
                <AccordionContent className="pt-2 pl-2 space-y-3">
                  {step2Data.questions.map((q: QuestionFormValues, index: number) => (
                    <Card key={q.id || index} className='p-3 bg-white dark:bg-gray-800 shadow-sm'>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Question {index + 1}</p>
                      <p className="font-medium text-gray-800 dark:text-gray-100 mt-0.5 break-words">
                        {q.questionText}
                      </p>
                      <Badge variant="outline" className="mt-1.5 text-xs font-normal">
                        Type: {q.answerType}
                      </Badge>
                      {q.answerType === "Radio" && q.radioOptions && q.radioOptions.length > 0 && (
                        <div className="mt-1.5 space-y-0.5 pl-3 text-xs text-gray-600 dark:text-gray-400">
                          <p className='font-medium'>Options:</p>
                          {q.radioOptions.map((opt: { value: string }, optIndex: number) => (
                            <p key={optIndex} className="break-words">- {opt.value}</p>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Step 3: Conditional Logic Summary */}
            {step3Data?.logicRules && step3Data.logicRules.length > 0 && (
              <AccordionItem value="item-3">
                <AccordionTrigger className='text-lg font-medium'>
                    <MilestoneIcon className="h-5 w-5 mr-2 text-custom-primary" /> Conditional Logic Rules ({step3Data.logicRules.length})
                </AccordionTrigger>
                <AccordionContent className="pt-2 pl-2 space-y-2">
                  {step3Data.logicRules.map((rule: LogicRule, index: number) => (
                    <Card key={rule.id} className='p-3 bg-white dark:bg-gray-800 shadow-sm text-sm'>
                      <span className="font-semibold">Rule {index + 1}: </span>
                      IF <strong>"{getQuestionTextById(rule.sourceQuestionId)}"</strong>
                      {rule.condition?.value && (
                        <span> is <strong>"{rule.condition.value}"</strong></span>
                      )}
                      {!rule.condition?.value && step2Data?.questions?.find((q: QuestionFormValues) => q.id === rule.sourceQuestionId)?.answerType === 'Text' && (
                        <span> is answered</span>
                      )}
                      <ArrowRightIcon className="inline h-4 w-4 text-gray-500 dark:text-gray-400 mx-1.5" />
                      THEN <strong>"{getQuestionTextById(rule.targetQuestionId)}"</strong>.
                    </Card>
                  ))}
                </AccordionContent>
              </AccordionItem>
            )}
            {(!step3Data?.logicRules || step3Data.logicRules.length === 0) && (
                 <AccordionItem value="item-3-empty">
                    <AccordionTrigger className='text-lg font-medium'>
                        <MilestoneIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" /> Conditional Logic Rules (0)
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pl-2 text-sm text-gray-500 dark:text-gray-400">
                        No conditional logic rules defined.
                    </AccordionContent>
                </AccordionItem>
            )}

            {/* Step 4: Tool Calls Summary */}
            <AccordionItem value="item-4">
              <AccordionTrigger className='text-lg font-medium'>
                <Settings2Icon className="h-5 w-5 mr-2 text-custom-primary" /> Tool Calls & Integrations
              </AccordionTrigger>
              <AccordionContent className="pt-2 pl-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300">
                  Tool call configurations are currently placeholders.
                </p>
                {/* You could list mock tools from step4Data if available and meaningful */}
                {step4Data?.toolsConfig && Object.keys(step4Data.toolsConfig).length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className='font-medium'>Mocked Tool States:</p>
                    {Object.entries(step4Data.toolsConfig).map(([toolId, isEnabled]: [string, any]) => (
                      <p key={toolId} className='text-xs'>
                        - {toolId}: {isEnabled ? 'Enabled (mock)' : 'Disabled (mock)'}
                      </p>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-3">
        <Button variant="outline" onClick={onBack} className='w-full sm:w-auto'>
          Back to Tool Calls
        </Button>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button variant="secondary" onClick={handleTestFlow} className='w-full sm:w-auto'>
                Test Flow
            </Button>
            <Button onClick={onPublish} className='w-full sm:w-auto bg-custom-primary hover:bg-custom-primary/90 text-white'>
                <CheckCircle2Icon className="mr-2 h-5 w-5" /> Publish Flow
            </Button>
        </div>
      </div>
    </div>
  );
} 