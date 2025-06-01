"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

// Step Components
import Step1NameTemplate from "@/components/flow-builder/step-1-name-template";
import StepIntroductionGreeting from "@/components/flow-builder/step-introduction-greeting";
import Step2Questions from "@/components/flow-builder/step-2-questions";
import Step3ConditionalLogic, { type LogicRule } from "@/components/flow-builder/step-3-conditional-logic";
import Step4ToolCalls from "@/components/flow-builder/step-4-tool-calls";
import StepGoodbyeGreeting from "@/components/flow-builder/step-goodbye-greeting";
import Step5ReviewPublish from "@/components/flow-builder/step-5-review-publish";
import { type QuestionFormValues } from "@/components/flow-builder/question-form-modal";
import { flowTemplates } from "@/mocks/templates"; // Import flowTemplates

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
  toolCalls: Array<{
    id: string;
    name: string;
    details: string;
  }>;
}

interface StepGoodbyeData {
  goodbyeGreeting: string;
}

// Add other step data interfaces as needed

export interface FlowData {
  step1Data?: Step1Data;
  stepIntroductionData?: StepIntroductionData;
  step2Data?: Step2Data;
  step3Data?: Step3Data;
  step4Data?: Step4Data;
  stepGoodbyeData?: StepGoodbyeData;
  step5Data?: any; // This key is more for step tracking in the array, not for data storage for review step
  [key: `step${number}Complete`]: boolean | undefined;
}

const steps = [
  { id: 1, name: "Name & Template", description: "Choose a template and name your flow", component: Step1NameTemplate, dataKey: "step1Data" as keyof FlowData },
  { id: 2, name: "Intro Greeting", description: "Set the opening message", component: StepIntroductionGreeting, dataKey: "stepIntroductionData" as keyof FlowData },
  { id: 3, name: "Questions", description: "Add questions to collect information", component: Step2Questions, dataKey: "step2Data" as keyof FlowData },
  { id: 4, name: "Conditional Logic", description: "Create branching paths", component: Step3ConditionalLogic, dataKey: "step3Data" as keyof FlowData },
  { id: 5, name: "Tool Calls", description: "Configure integrations", component: Step4ToolCalls, dataKey: "step4Data" as keyof FlowData },
  { id: 6, name: "Goodbye", description: "Set the closing message", component: StepGoodbyeGreeting, dataKey: "stepGoodbyeData" as keyof FlowData },
  { id: 7, name: "Review", description: "Review and publish your flow", component: Step5ReviewPublish, dataKey: "step5Data" as keyof FlowData },
];

export default function NewFlowPage() {
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

  const handleNextStep = (stepOutput: any) => {
    const currentStepConfig = steps[currentStep - 1];
    setFlowData(prev => ({ ...prev, [currentStepConfig.dataKey]: stepOutput }));
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
    console.log("Publishing flow:", flowData);
    // Placeholder for actual publish logic (e.g., API call, redirect)
    alert("Flow Published! (Placeholder)");
  };
  
  // Update breadcrumbs in MainLayout (this is a conceptual note, actual implementation would need context/state management)
  // For now, MainLayout's breadcrumb is static. Dynamic breadcrumbs would be a later enhancement.

  const ActiveStepComponent = steps[currentStep - 1].component;
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full space-y-8">
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
      <div className="hidden lg:flex justify-between items-center relative">
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
                left: `${(100 / (steps.length - 1)) * index + (50 / (steps.length - 1))}%`,
                width: `${100 / (steps.length - 1) - (100 / (steps.length - 1) * 0.5)}%`
              }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Indicator - Mobile */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`
                  h-2 rounded-full transition-all duration-300
                  ${currentStep === step.id 
                    ? 'w-8 bg-primary' 
                    : currentStep > step.id 
                    ? 'w-2 bg-primary/50' 
                    : 'w-2 bg-muted-foreground/20'
                  }
                `}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNextStep(flowData[steps[currentStep - 1].dataKey])}
            disabled={currentStep === steps.length}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
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
          <ActiveStepComponent
            onSubmit={handleNextStep}
            onBack={handlePreviousStep}
            // @ts-ignore
            initialData={flowData[steps[currentStep-1].dataKey]}
            questions={flowData.step2Data?.questions || []}
            flowData={flowData}
            onPublish={handlePublish}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 