"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from 'lucide-react';

// Step Components
import Step1NameTemplate from "@/components/flow-builder/step-1-name-template";
import StepIntroductionGreeting from "@/components/flow-builder/step-introduction-greeting";
import Step2Questions from "@/components/flow-builder/step-2-questions";
import Step3ConditionalLogic, { type LogicRule } from "@/components/flow-builder/step-3-conditional-logic";
import Step4ToolCalls from "@/components/flow-builder/step-4-tool-calls";
import StepGoodbyeGreeting from "@/components/flow-builder/step-goodbye-greeting";
import Step5ReviewPublish from "@/components/flow-builder/step-5-review-publish";
import { type QuestionFormValues } from "@/components/flow-builder/question-form-modal";
import { flowTemplates } from "@/mocks/templates";

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

interface Step5Data {
  reviewComplete: boolean;
}

// Union type for all possible step data structures
type StepData = Step1Data | StepIntroductionData | Step2Data | Step3Data | Step4Data | StepGoodbyeData | Step5Data;

// Add other step data interfaces as needed

export interface FlowData {
  step1Data?: Step1Data;
  stepIntroductionData?: StepIntroductionData;
  step2Data?: Step2Data;
  step3Data?: Step3Data;
  step4Data?: Step4Data;
  stepGoodbyeData?: StepGoodbyeData;
  step5Data?: Step5Data;
  [key: `step${number}Complete`]: boolean | undefined;
}

const steps = [
  { id: 1, name: "Name & Template", description: "Choose a template and name your flow", component: Step1NameTemplate, dataKey: "step1Data" as const },
  { id: 2, name: "Intro Greeting", description: "Set the opening message", component: StepIntroductionGreeting, dataKey: "stepIntroductionData" as const },
  { id: 3, name: "Questions", description: "Add questions to collect information", component: Step2Questions, dataKey: "step2Data" as const },
  { id: 4, name: "Conditional Logic", description: "Create branching paths", component: Step3ConditionalLogic, dataKey: "step3Data" as const },
  { id: 5, name: "Tool Calls", description: "Configure integrations", component: Step4ToolCalls, dataKey: "step4Data" as const },
  { id: 6, name: "Goodbye", description: "Set the closing message", component: StepGoodbyeGreeting, dataKey: "stepGoodbyeData" as const },
  { id: 7, name: "Review", description: "Review and publish your flow", component: Step5ReviewPublish, dataKey: "step5Data" as const },
];

function NewFlowPageContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [flowData, setFlowData] = useState<FlowData>({});
  const searchParams = useSearchParams();

  useEffect(() => {
    const templateIdFromUrl = searchParams.get('templateId');
    if (templateIdFromUrl) {
      const selectedTemplate = flowTemplates.find(t => t.id === templateIdFromUrl);
      if (selectedTemplate) {
        setFlowData(prev => ({
          ...prev,
          step1Data: {
            flowName: selectedTemplate.name,
            templateId: selectedTemplate.id,
          },
          stepIntroductionData: {
            introductionGreeting: selectedTemplate.introductionGreeting || "Hello, thank you for calling. How can I help you today?",
          },
          step2Data: {
            questions: selectedTemplate.questions.map(q => ({...q}))
          },
          stepGoodbyeData: {
            goodbyeGreeting: selectedTemplate.goodbyeGreeting || "Thank you for calling. Goodbye!",
          }
        }));
      } else {
        // Handle case where templateId from URL doesn't match any known template
        // Optionally, fall back to a default blank state or show an error
        setFlowData(prev => ({
          ...prev,
          step1Data: {
            ...(prev.step1Data || { flowName: '' }),
            templateId: flowTemplates.find(t => t.id === 'blank')?.id || '',
          },
          stepIntroductionData: {
            introductionGreeting: "Hello, thank you for calling. How can I help you today?",
          },
          stepGoodbyeData: {
            goodbyeGreeting: "Thank you for calling. Goodbye!",
          }
        }));
      }
    }
  }, [searchParams]);

  const handleNextStep = (stepOutput: StepData | undefined) => {
    if (!stepOutput) return;
    const currentStepConfig = steps[currentStep - 1];
    const dataKey = currentStepConfig.dataKey as keyof FlowData;
    
    // Handle the specific case for Step4ToolCalls
    if (currentStep === 5 && 'toolsConfig' in stepOutput) {
        const step4Data: Step4Data = { toolsConfig: stepOutput.toolsConfig };
        setFlowData(prev => ({ ...prev, [dataKey]: step4Data }));
    } else if (typeof stepOutput !== 'boolean') {
        setFlowData(prev => ({ ...prev, [dataKey]: stepOutput }));
    }
    
    setFlowData(prev => ({ ...prev, [`step${currentStep}Complete`]: true }));

    if (currentStep < steps.length) {
        setCurrentStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handlePublish = () => {
    // Convert the flow data to WizardFlow JSON format
    const wizardFlowJson = {
      id: `flow_${Date.now()}`,
      name: flowData.step1Data?.flowName || "Untitled Flow",
      description: `Flow created on ${new Date().toLocaleDateString()}`,
      questions: (flowData.step2Data?.questions || []).map(q => ({
        id: q.id || `q_${Date.now()}_${Math.random()}`,
        text: q.questionText,
        type: q.answerType.toUpperCase().replace('-', '_'), // Convert to match AnswerType enum
        options: q.answerType === "Radio" 
          ? (q.radioOptions?.map(opt => opt.value).filter(val => val.trim() !== '') || [])
          : q.answerType === "MultiSelect"
          ? (q.multiSelectOptions?.map(opt => opt.value).filter(val => val.trim() !== '') || [])
          : []
      })),
      logic: (flowData.step3Data?.logicRules || []).map(rule => ({
        id: rule.id,
        sourceQuestionId: rule.sourceQuestionId,
        condition: rule.conditions?.[0]?.value || '',
        targetQuestionId: rule.targetQuestionId
      })),
      toolCalls: Object.entries(flowData.step4Data?.toolsConfig || {}).map(([toolId, config]) => ({
        id: `tool_${toolId}_${Date.now()}`,
        name: toolId,
        enabled: config.enabled,
        details: config.config ? JSON.stringify(config.config) : 'No additional configuration'
      })),
      lastEditedDate: new Date().toISOString().split('T')[0],
      status: "Draft" as const,
      introductionGreeting: flowData.stepIntroductionData?.introductionGreeting || "Hello, thank you for calling. How can I help you today?",
      goodbyeGreeting: flowData.stepGoodbyeData?.goodbyeGreeting || "Thank you for calling. Have a great day!",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: "1.0.0"
    };

    console.log("=== WIZARD FLOW JSON FOR DATABASE ===");
    console.log(JSON.stringify(wizardFlowJson, null, 2));
    console.log("=== END JSON OUTPUT ===");
    
    // Also log the raw flow data for debugging
    console.log("=== RAW FLOW DATA FOR DEBUGGING ===");
    console.log("Flow Data:", flowData);
    console.log("=== END RAW DATA ===");
    
    // Placeholder for actual publish logic (e.g., API call, redirect)
    alert(`Flow "${wizardFlowJson.name}" ready for database upload! Check console for JSON.`);
  };
  
  // Update breadcrumbs in MainLayout (this is a conceptual note, actual implementation would need context/state management)
  // For now, MainLayout's breadcrumb is static. Dynamic breadcrumbs would be a later enhancement.

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;
  // const activeStepDataKey = steps[currentStep - 1].dataKey;
  // const步骤 = watch("steps");

  // const结婚 = () => {
  //   // ... existing code ...
  // };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[80%] space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Flow</h1>
            <p className="text-muted-foreground mt-1">
              {steps[currentStep - 1].description}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="h-2" />
        
        {/* Step Indicator - Desktop */}
        <div className="hidden lg:flex justify-between items-center relative px-6">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center z-10 relative">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  disabled={step.id > currentStep && !flowData[`step${step.id-1}Complete`]}
                  className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 
                    transition-all duration-300 cursor-pointer disabled:cursor-not-allowed
                    ${currentStep === step.id 
                      ? 'bg-primary border-primary text-primary-foreground shadow-lg scale-110' 
                      : currentStep > step.id 
                      ? 'bg-primary/20 border-primary text-primary hover:bg-primary/30' 
                      : 'bg-muted border-muted-foreground/20 text-muted-foreground disabled:opacity-50'
                    }
                  `}
                >
                  {currentStep > step.id ? <CheckCircle className="h-6 w-6" /> : <span className="text-sm font-semibold">{step.id}</span>}
                </button>
                <p className={`
                  mt-2 text-xs text-center max-w-[100px]
                  ${currentStep === step.id 
                    ? 'text-foreground font-semibold' 
                    : currentStep > step.id 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                  }
                `}>
                  {step.name}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  absolute top-6 h-0.5 transition-all duration-500
                  ${currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground/20'}
                `} 
                style={{
                  left: `calc(${(100 / (steps.length - 1)) * index}% + 24px + ${100 / (steps.length - 1) * 0.5}%)`,
                  width: `calc(${100 / (steps.length - 1)}% - 48px)`
                }}
              ></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-card rounded-lg border p-6 shadow-sm w-full"
          >
            {currentStep === 1 && (
              <Step1NameTemplate
                onSubmit={handleNextStep}
                initialData={flowData.step1Data}
              />
            )}
            {currentStep === 2 && (
              <StepIntroductionGreeting
                onSubmit={handleNextStep}
                onBack={handlePreviousStep}
                initialData={flowData.stepIntroductionData}
              />
            )}
            {currentStep === 3 && (
              <Step2Questions
                onSubmit={handleNextStep}
                onBack={handlePreviousStep}
                initialData={flowData.step2Data}
              />
            )}
            {currentStep === 4 && (
              <Step3ConditionalLogic
                onSubmit={handleNextStep}
                onBack={handlePreviousStep}
                initialData={flowData.step3Data}
                questions={flowData.step2Data?.questions || []}
              />
            )}
            {currentStep === 5 && (
              <Step4ToolCalls
                onSubmit={handleNextStep}
                onBack={handlePreviousStep}
              />
            )}
            {currentStep === 6 && (
              <StepGoodbyeGreeting
                onSubmit={handleNextStep}
                onBack={handlePreviousStep}
                initialData={flowData.stepGoodbyeData}
              />
            )}
            {currentStep === 7 && (
              <Step5ReviewPublish
                flowData={flowData}
                onPublish={handlePublish}
                onBack={handlePreviousStep}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function NewFlowPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewFlowPageContent />
    </Suspense>
  );
}