'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// import { type FlowData } from 'app/flows/new/page'; // Path will be removed or defined locally
import { ArrowRightIcon, ListChecksIcon, MilestoneIcon, Settings2Icon, WorkflowIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { type QuestionFormValues } from "./question-form-modal"; // Assuming this is correct
import { type LogicRule } from "./step-3-conditional-logic"; // Assuming this is correct
import { flowTemplates } from "@/mocks/templates";

// Define FlowData and related types locally for now
// TODO: Consider moving to a shared types file (e.g., types/flow.ts)
interface Step1Data {
    flowName: string;
    templateId?: string;
}

interface StepIntroductionData {
    introductionGreeting: string;
}

interface Step2Data {
    questions: QuestionFormValues[];
}

interface Step3Data {
    logicRules: LogicRule[];
}

interface Step4Data {
    toolsConfig?: {
        [key: string]: {
            enabled: boolean;
            config?: {
                transferNumber?: string;
                triggerQuestion?: string;
                triggerResponse?: string;
            };
        };
    };
}

interface StepGoodbyeData {
    goodbyeGreeting: string;
}

export interface FlowData { // Export if it might be used by parent through props typing
    step1Data?: Step1Data;
    stepIntroductionData?: StepIntroductionData;
    step2Data?: Step2Data;
    step3Data?: Step3Data;
    step4Data?: Step4Data;
    stepGoodbyeData?: StepGoodbyeData;
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
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Review Your Intake Flow</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Review how your intake flow will work. Make sure the questions and flow make sense for your clients.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        {/* Step 1: Name & Template */}
        {step1Data && (
          <AccordionItem value="item-1">
            <AccordionTrigger className='text-lg font-medium'>
              <Settings2Icon className="h-5 w-5 mr-2 text-custom-primary" /> Basic Information
            </AccordionTrigger>
            <AccordionContent className="pt-2 pl-2">
              <Card className='p-4 bg-white dark:bg-gray-800 shadow-sm'>
                <p className="font-medium text-gray-800 dark:text-gray-100">Flow Name</p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{step1Data.flowName}</p>
                {step1Data.templateId && (
                  <>
                    <p className="font-medium text-gray-800 dark:text-gray-100 mt-4">Template</p>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {flowTemplates.find(t => t.id === step1Data.templateId)?.name || "Custom Template"}
                    </p>
                  </>
                )}
              </Card>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Step 2: Questions */}
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

                  {/* Display options based on question type */}
                  {q.answerType === "Radio" && q.radioOptions && q.radioOptions.length > 0 && (
                    <div className="mt-1.5 space-y-0.5 pl-3 text-xs text-gray-600 dark:text-gray-400">
                      <p className='font-medium'>Options:</p>
                      {q.radioOptions.map((opt: { value: string }, optIndex: number) => (
                        <p key={optIndex} className="break-words">- {opt.value}</p>
                      ))}
                    </div>
                  )}

                  {q.answerType === "Range" && q.rangeOptions && q.rangeOptions.length > 0 && (
                    <div className="mt-1.5 space-y-0.5 pl-3 text-xs text-gray-600 dark:text-gray-400">
                      <p className='font-medium'>Ranges:</p>
                      {q.rangeOptions.map((opt: { min: number; max: number; label: string }, optIndex: number) => (
                        <p key={optIndex} className="break-words">
                          - {opt.label} ({opt.min} - {opt.max === Infinity ? '∞' : opt.max})
                        </p>
                      ))}
                    </div>
                  )}

                  {q.answerType === "MultiSelect" && q.multiSelectOptions && q.multiSelectOptions.length > 0 && (
                    <div className="mt-1.5 space-y-0.5 pl-3 text-xs text-gray-600 dark:text-gray-400">
                      <p className='font-medium'>Options:</p>
                      {q.multiSelectOptions.map((opt: { value: string; label: string }, optIndex: number) => (
                        <p key={optIndex} className="break-words">- {opt.label}</p>
                      ))}
                    </div>
                  )}

                  {q.answerType === "Numeric" && q.numericValidation && (
                    <div className="mt-1.5 space-y-0.5 pl-3 text-xs text-gray-600 dark:text-gray-400">
                      <p className='font-medium'>Validation:</p>
                      <p>Min: {q.numericValidation.min ?? 'No minimum'}</p>
                      <p>Max: {q.numericValidation.max ?? 'No maximum'}</p>
                      <p>Allow decimals: {q.numericValidation.allowDecimals ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                </Card>
              ))}
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Step 3: Question Flow */}
        {step3Data?.logicRules && step3Data.logicRules.length > 0 && (
          <AccordionItem value="item-3">
            <AccordionTrigger className='text-lg font-medium'>
              <MilestoneIcon className="h-5 w-5 mr-2 text-custom-primary" /> Question Flow ({step3Data.logicRules.length})
            </AccordionTrigger>
            <AccordionContent className="pt-2 pl-2 space-y-2">
              {step3Data.logicRules.map((rule: LogicRule, index: number) => (
                <Card key={rule.id} className='p-3 bg-white dark:bg-gray-800 shadow-sm text-sm'>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">Flow {index + 1}: </span>
                    <span>When client answers <strong>&quot;{getQuestionTextById(rule.sourceQuestionId)}&quot;</strong></span>
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
                    <ArrowRightIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mx-1.5" />
                    <span>then ask them <strong>&quot;{getQuestionTextById(rule.targetQuestionId)}&quot;</strong></span>
                    {rule.isDefault && <Badge variant="secondary">Default Path</Badge>}
                  </div>
                </Card>
              ))}
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Step 4: Tool Calls */}
        {step4Data?.toolsConfig && Object.keys(step4Data.toolsConfig).length > 0 && (
          <AccordionItem value="item-4">
            <AccordionTrigger className='text-lg font-medium'>
              <WorkflowIcon className="h-5 w-5 mr-2 text-custom-primary" /> Automated Actions ({Object.keys(step4Data.toolsConfig).length})
            </AccordionTrigger>
            <AccordionContent className="pt-2 pl-2 space-y-2">
              {Object.entries(step4Data.toolsConfig).map(([toolId, toolConfig]) => (
                <Card key={toolId} className='p-3 bg-white dark:bg-gray-800 shadow-sm'>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{toolId}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {toolConfig.enabled ? 'Enabled' : 'Disabled'}
                  </p>
                  {toolConfig.config && (
                    <>
                      {toolConfig.config.transferNumber && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Transfer Number: {toolConfig.config.transferNumber}
                        </p>
                      )}
                      {toolConfig.config.triggerQuestion && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Trigger Question: {toolConfig.config.triggerQuestion}
                        </p>
                      )}
                      {toolConfig.config.triggerResponse && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Trigger Response: {toolConfig.config.triggerResponse}
                        </p>
                      )}
                    </>
                  )}
                </Card>
              ))}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      <div className="flex justify-between items-center mt-8">
        <Button variant="outline" onClick={onBack}>Back to Tool Calls</Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleTestFlow}>
            Test Flow
          </Button>
          <Button onClick={onPublish}>
            Publish Flow
          </Button>
        </div>
      </div>
    </div>
  );
} 