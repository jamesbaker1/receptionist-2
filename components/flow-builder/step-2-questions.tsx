"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import QuestionFormModal, { type QuestionFormValues, answerTypes } from "./question-form-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Edit2Icon, Trash2Icon, PlusCircleIcon, ListChecksIcon, MessageSquareTextIcon, AlertTriangleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Step2QuestionsProps {
  onSubmit: (data: { questions: QuestionFormValues[] }) => void;
  initialData?: { questions?: QuestionFormValues[] };
  onBack?: () => void;
}

export default function Step2Questions({ onSubmit, initialData, onBack }: Step2QuestionsProps) {
  const [questions, setQuestions] = useState<QuestionFormValues[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionFormValues | undefined>(undefined);
  const [questionCounter, setQuestionCounter] = useState(0);

  // Generate unique ID for questions
  const generateQuestionId = () => {
    const id = `q_${Date.now()}_${questionCounter}`;
    setQuestionCounter(prev => prev + 1);
    return id;
  };

  useEffect(() => {
    if (initialData?.questions) {
      setQuestions(initialData.questions.map(q => ({...q})));
    } else {
      setQuestions([]);
    }
  }, [initialData?.questions]);

  const handleAddQuestion = (data: QuestionFormValues) => {
    console.log("=== HANDLE ADD QUESTION DEBUG ===");
    console.log("Received data:", data);
    console.log("Current editing question:", editingQuestion);
    console.log("Current questions before update:", questions);
    
    if (editingQuestion && editingQuestion.id) {
      console.log("Updating existing question with ID:", editingQuestion.id);
      setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? { ...data, id: editingQuestion.id } : q));
    } else {
      console.log("Adding new question");
      const newQuestion = { ...data, id: data.id || generateQuestionId() };
      console.log("New question to add:", newQuestion);
      setQuestions(prev => {
        const updated = [...prev, newQuestion];
        console.log("Updated questions array:", updated);
        return updated;
      });
    }
    setEditingQuestion(undefined);
    console.log("=== END HANDLE ADD QUESTION DEBUG ===");
  };

  const openEditModal = (question: QuestionFormValues) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  const openNewQuestionModal = () => {
    setEditingQuestion(undefined);
    setIsModalOpen(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handleFormSubmit = () => {
    console.log("Step 2 Data:", { questions });
    onSubmit({ questions });
  };

  const getAnswerTypeIcon = (answerType: typeof answerTypes[number]) => {
    switch (answerType) {
      case "Text": return <MessageSquareTextIcon className="h-4 w-4 mr-1.5" />;
      case "Yes/No": return <AlertTriangleIcon className="h-4 w-4 mr-1.5" />;
      case "Radio": return <ListChecksIcon className="h-4 w-4 mr-1.5" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 p-1">
      <QuestionFormModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleAddQuestion}
        initialData={editingQuestion}
      />
      
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Configure Questions</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Add and manage the questions for your intake flow.</p>
        </div>
        <Button onClick={openNewQuestionModal}>
          <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <ListChecksIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">No questions yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Click &quot;Add Question&quot; to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, index) => (
            <Card key={q.id || index} className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex justify-between items-start">
                <div className="flex-grow">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Question {index + 1}</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100 mt-1 break-words">
                    {q.questionText}
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs inline-flex items-center">
                    {getAnswerTypeIcon(q.answerType)} {q.answerType}
                  </Badge>
                  {q.answerType === "Radio" && q.radioOptions && q.radioOptions.length > 0 && (
                    <div className="mt-2 space-y-1 pl-2 text-xs text-gray-600 dark:text-gray-400">
                      {q.radioOptions.map((opt, optIndex) => (
                        <p key={optIndex} className="break-words">- {opt.value}</p>
                      ))}
                    </div>
                  )}
                  {q.answerType === "MultiSelect" && q.multiSelectOptions && q.multiSelectOptions.length > 0 && (
                    <div className="mt-2 space-y-1 pl-2 text-xs text-gray-600 dark:text-gray-400">
                      {q.multiSelectOptions.map((opt, optIndex) => (
                        <p key={optIndex} className="break-words">- {opt.label || opt.value}</p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEditModal(q)} className="h-8 w-8 text-gray-500 hover:text-custom-primary">
                    <Edit2Icon className="h-4 w-4" />
                    <span className="sr-only">Edit question</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(q.id!)} className="h-8 w-8 text-gray-500 hover:text-destructive">
                    <Trash2Icon className="h-4 w-4" />
                    <span className="sr-only">Delete question</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-8"> 
        <Button variant="outline" onClick={onBack} disabled={!onBack}>Back to Name & Template</Button>
        <Button onClick={handleFormSubmit} disabled={questions.length === 0}>
          Next: Conditional Logic
        </Button>
      </div>
    </div>
  );
} 