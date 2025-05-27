"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle } from 'lucide-react';

// Step Components
import Step1NameTemplate from "@/components/flow-builder/step-1-name-template";
import Step2Questions from "@/components/flow-builder/step-2-questions";
import Step3ConditionalLogic, { type LogicRule } from "@/components/flow-builder/step-3-conditional-logic";
import Step4ToolCalls from "@/components/flow-builder/step-4-tool-calls";
import Step5ReviewPublish from "@/components/flow-builder/step-5-review-publish";
import { type QuestionFormValues } from "@/components/flow-builder/question-form-modal";

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

// Add other step data interfaces as needed

export interface FlowData {
  step1Data?: Step1Data;
  step2Data?: Step2Data;
  step3Data?: Step3Data;
  step4Data?: Step4Data;
  step5Data?: any; // This key is more for step tracking in the array, not for data storage for review step
  [key: `step${number}Complete`]: boolean | undefined;
}

const steps = [
  { id: 1, name: "Name & Template", component: Step1NameTemplate, dataKey: "step1Data" as keyof FlowData },
  { id: 2, name: "Questions", component: Step2Questions, dataKey: "step2Data" as keyof FlowData },
  { id: 3, name: "Conditional Logic", component: Step3ConditionalLogic, dataKey: "step3Data" as keyof FlowData },
  { id: 4, name: "Tool Calls", component: Step4ToolCalls, dataKey: "step4Data" as keyof FlowData },
  { id: 5, name: "Review & Publish", component: Step5ReviewPublish, dataKey: "step5Data" as keyof FlowData },
];

export default function NewFlowPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [flowData, setFlowData] = useState<FlowData>({});

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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumbs - Conceptual: Would need to be dynamic via MainLayout props or context */}
      {/* <div className="text-sm text-gray-500">Dashboard &gt; New Flow &gt; Step {currentStep}</div> */}
      
      {/* Step Indicator */}
      <div className="flex justify-between items-center mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <button
                onClick={() => setCurrentStep(step.id)}
                disabled={step.id > currentStep && !flowData[`step${step.id-1}Complete`]} // Disable future steps until prior is 'complete'
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= step.id ? 'bg-custom-primary border-custom-primary text-white' : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'} transition-colors duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {currentStep > step.id ? <CheckCircle size={20} /> : step.id}
              </button>
              <p className={`mt-2 text-xs text-center ${currentStep >= step.id ? 'text-custom-primary font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                {step.name}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 ${currentStep > step.id ? 'bg-custom-primary' : 'bg-gray-300 dark:bg-gray-600'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: currentStep > (steps.find(s => s.component === ActiveStepComponent)?.id || 0) ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: currentStep < (steps.find(s => s.component === ActiveStepComponent)?.id || 0) ? 50 : -50 }}
          transition={{ duration: 0.3 }}
        >
          <ActiveStepComponent
            onSubmit={handleNextStep}
            onBack={handlePreviousStep}
            // @ts-ignore // initialData might not exist on all step components, also questions prop
            initialData={flowData[steps[currentStep-1].dataKey]}
            questions={flowData.step2Data?.questions || []}
            flowData={flowData}
            onPublish={handlePublish}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons - These are largely superseded by buttons within each step component now */}
      {/* <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={handlePreviousStep} disabled={currentStep === 1}>
          Previous
        </Button>
        {currentStep < steps.length ? (
          <Button onClick={() => {
            // This button is redundant as each step handles its own "Next"
          }}
          >
            // Next (This button might be better inside each step or removed)
          </Button>
        ) : null}
      </div> */}
    </div>
  );
} 