"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    ChevronDown,
    ChevronUp,
    CopyIcon,
    GripVerticalIcon,
    PlusCircleIcon,
    SaveIcon,
    UploadCloudIcon,
    Trash2Icon,
    Edit3Icon,
    Settings2Icon,
    ZapIcon,
    EyeIcon,
    ListChecksIcon,
    FileTextIcon,
    MailIcon,
    CalendarIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import QuestionFormModal, { questionSchema, QuestionFormValues } from "@/components/flow-builder/question-form-modal";
import { Flow, Question, LogicRule, ToolCall, AnswerType } from "@/types/flow";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";


// Mock data - in a real app, this would be fetched based on flowId
const mockFlows: Flow[] = [
    {
        id: "flow1",
        name: "Client Intake Flow",
        questions: [
            { id: "q1", text: "What is your full name?", type: AnswerType.TEXT, options: [] },
            { id: "q2", text: "What is your email address?", type: AnswerType.TEXT, options: [] },
            { id: "q3", text: "Are you a new client?", type: AnswerType.YES_NO, options: [] },
            { id: "q4", text: "What service are you interested in?", type: AnswerType.RADIO, options: ["Consultation", "Support", "Sales"] },
        ],
        logic: [
            { id: "l1", sourceQuestionId: "q3", condition: "Yes", targetQuestionId: "q4" },
            { id: "l2", sourceQuestionId: "q3", condition: "No", targetQuestionId: "END_CALL" },
        ],
        toolCalls: [
            { id: "tc1", name: "Clio Upload", enabled: true, details: "Upload documents to Clio case." },
            { id: "tc2", name: "Outlook Email", enabled: false, details: "Send summary email via Outlook." },
        ],
        lastEditedDate: "2024-07-28",
        status: "Draft",
    },
];

const EditFlowPage = () => {
    const params = useParams();
    const flowId = params.flowId as string;
    const [flowData, setFlowData] = useState<Flow | null>(null);
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    // Mock fetching flow data
    useEffect(() => {
        const currentFlow = mockFlows.find(f => f.id === flowId);
        if (currentFlow) {
            setFlowData(currentFlow);
            if (currentFlow.questions.length > 0) {
                setSelectedQuestionId(currentFlow.questions[0].id);
            }
        } else {
            // Handle flow not found, e.g. redirect or show error
            console.error("Flow not found!");
        }
    }, [flowId]);
    
    // Placeholder for autosave
    useEffect(() => {
        let autosaveTimeout: ReturnType<typeof setTimeout>;
        if (flowData) { // Some condition to track changes
            autosaveTimeout = setTimeout(() => {
                // console.log("Autosaving changes...");
                // toast("Changes automatically saved!", { description: "Your flow has been updated." });
            }, 30000); // 30 seconds
        }
        return () => clearTimeout(autosaveTimeout);
    }, [flowData]);


    if (!flowData) {
        return (
            <MainLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Loading Flow..." }]}>
                <div className="flex justify-center items-center h-full">
                    <p>Loading flow data...</p>
                </div>
            </MainLayout>
        );
    }
    
    const handleAddQuestion = (newQuestionData: QuestionFormValues) => {
        const newQ: Question = {
            id: `q${Date.now()}`,
            text: newQuestionData.questionText,
            type: newQuestionData.answerType as AnswerType,
            options: newQuestionData.answerType === "Radio" && newQuestionData.radioOptions ? newQuestionData.radioOptions.map(opt => opt.value) : [],
        };
        setFlowData(prev => prev ? { ...prev, questions: [...prev.questions, newQ] } : null);
        setSelectedQuestionId(newQ.id);
        toast("Question added", { description: newQ.text });
    };

    const handleUpdateQuestion = (updatedQuestionData: QuestionFormValues) => {
        if (!editingQuestion) return;

        setFlowData(prev => prev ? {
            ...prev,
            questions: prev.questions.map(q => q.id === editingQuestion.id ? {
                ...q,
                text: updatedQuestionData.questionText,
                type: updatedQuestionData.answerType as AnswerType,
                options: updatedQuestionData.answerType === "Radio" && updatedQuestionData.radioOptions ? updatedQuestionData.radioOptions.map(opt => opt.value) : [],
            } : q),
        } : null);
        toast("Question updated", { description: updatedQuestionData.questionText });
        setEditingQuestion(null); // Close modal or inline form
    };

    const handleDeleteQuestion = (questionId: string) => {
        setFlowData(prev => prev ? {
            ...prev,
            questions: prev.questions.filter(q => q.id !== questionId),
            // Also need to remove logic rules associated with this question
            logic: prev.logic.filter(rule => rule.sourceQuestionId !== questionId && rule.targetQuestionId !== questionId),
        } : null);
        if (selectedQuestionId === questionId) {
            setSelectedQuestionId(flowData.questions.length > 1 ? flowData.questions.find(q => q.id !== questionId)?.id || null : null);
        }
        toast.error("Question deleted");
    };
    
    const openEditModal = (question: Question) => {
        setEditingQuestion(question);
        setIsQuestionModalOpen(true);
    };


    return (
        <MainLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: flowData.name, href: `/flows/edit/${flowId}` }, { label: "Edit" }]}>
            <div className="flex flex-col h-[calc(100vh-var(--header-height)-var(--breadcrumb-height)-2rem)]"> {/* Adjust height based on your layout */}
                {/* Toolbar */}
                <div className="flex justify-end items-center p-4 border-b bg-background">
                    <Button variant="outline" size="sm" className="mr-2" onClick={() => alert("Duplicate action (placeholder)")}><CopyIcon className="h-4 w-4 mr-1" /> Duplicate</Button>
                    <Button variant="outline" size="sm" className="mr-2" onClick={() => toast("Draft Saved!", { description: "Your changes have been saved." })}><SaveIcon className="h-4 w-4 mr-1" /> Save Draft</Button>
                    <Button size="sm" className="bg-custom-primary hover:bg-custom-primary/90" onClick={() => toast("Flow Published!", { description: "Your flow is now live." })}><UploadCloudIcon className="h-4 w-4 mr-1" /> Publish Changes</Button>
                </div>

                {/* Main Editor Area */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Pane - Question List */}
                    <div className="w-1/4 border-r p-4 overflow-y-auto">
                        <h2 className="text-lg font-semibold mb-3">Questions</h2>
                        <Button variant="outline" className="w-full mb-4" onClick={() => { setEditingQuestion(null); setIsQuestionModalOpen(true); }}>
                            <PlusCircleIcon className="h-4 w-4 mr-2" /> Add New Question
                        </Button>
                        {/* Placeholder for DND Question List */}
                        {flowData.questions.length === 0 && (
                            <div className="text-center text-muted-foreground py-6">
                                <ListChecksIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                <p>No questions yet.</p>
                                <p>Click "Add New Question" to start.</p>
                            </div>
                        )}
                        {/* Actual list will be here */}
                         {flowData.questions.map((q, index) => (
                            <Card 
                                key={q.id} 
                                className={`mb-2 p-3 cursor-pointer ${selectedQuestionId === q.id ? 'border-custom-primary ring-2 ring-custom-primary' : 'hover:bg-muted/50'}`}
                                onClick={() => setSelectedQuestionId(q.id)}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        {/* <GripVerticalIcon className="h-5 w-5 mr-2 text-muted-foreground cursor-grab" /> */}
                                        <span className="font-medium truncate pr-2">${index + 1}. ${q.text}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEditModal(q); }}>
                                            <Edit3Icon className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id); }}>
                                            <Trash2Icon className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{q.type}</p>
                            </Card>
                        ))}
                    </div>

                    {/* Center Pane - Tabs for Details, Logic, Tool Calls */}
                    <div className="w-1/2 p-4 overflow-y-auto">
                         {selectedQuestionId && flowData.questions.find(q => q.id === selectedQuestionId) ? (
                            <Tabs defaultValue="details" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 mb-4">
                                    <TabsTrigger value="details"><Settings2Icon className="h-4 w-4 mr-1 inline-block" /> Details</TabsTrigger>
                                    <TabsTrigger value="logic"><ZapIcon className="h-4 w-4 mr-1 inline-block" /> Logic</TabsTrigger>
                                    <TabsTrigger value="tools"><ZapIcon className="h-4 w-4 mr-1 inline-block" /> Tool Calls</TabsTrigger>
                                </TabsList>
                                <TabsContent value="details">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Question Settings</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p>Edit form for the selected question will go here. Re-use or adapt <code>QuestionFormModal</code> logic.</p>
                                            {/* Placeholder content */}
                                            <div className="space-y-4 mt-4">
                                                <Label htmlFor="qText">Question Text:</Label>
                                                <Input id="qText" defaultValue={flowData.questions.find(q=>q.id === selectedQuestionId)?.text} />
                                                <p className="text-sm text-muted-foreground">Selected Question ID: {selectedQuestionId}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="logic">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Conditional Logic</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p>Logic rules for the selected question (<strong>${flowData.questions.find(q=>q.id === selectedQuestionId)?.text}</strong>) will be managed here.</p>
                                            <p className="text-sm text-muted-foreground mt-2">Interface similar to Wizard Step 3.</p>
                                            <Button variant="outline" className="mt-4 w-full">
                                                <PlusCircleIcon className="h-4 w-4 mr-2" /> Add Rule for this Question
                                            </Button>
                                             {/* Placeholder for no logic rules */}
                                            <div className="text-center text-muted-foreground py-6 mt-4">
                                                <ZapIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                                <p>No logic rules defined for this question.</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="tools">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Tool Calls & Integrations</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p>Static text: "Manage integrations here."</p>
                                            <p className="text-sm text-muted-foreground mt-2">Mock up list of "active" integrations (e.g., "Clio Upload", "Outlook Email") with "Edit" icons (non-functional) or toggle switches.</p>
                                            <div className="mt-4 space-y-3">
                                                <Card className="p-3">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center">
                                                            <FileTextIcon className="h-5 w-5 mr-2 text-blue-500"/>
                                                            <span className="font-medium">Clio Upload</span>
                                                        </div>
                                                        <Button variant="ghost" size="icon"><Edit3Icon className="h-4 w-4"/></Button>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">Active</p>
                                                </Card>
                                                <Card className="p-3">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center">
                                                            <MailIcon className="h-5 w-5 mr-2 text-red-500"/>
                                                            <span className="font-medium">Outlook Email</span>
                                                        </div>
                                                         <Button variant="ghost" size="icon"><Edit3Icon className="h-4 w-4"/></Button>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">Inactive - Click to configure</p>
                                                </Card>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <Settings2Icon className="h-16 w-16 mb-4 text-gray-300"/>
                                <p className="text-lg">Select a question from the left panel to see its details.</p>
                                <p>If there are no questions, add one to get started.</p>
                            </div>
                        )}
                    </div>

                    {/* Right Pane - Live Preview */}
                    <div className="w-1/4 border-l p-4 overflow-y-auto bg-muted/30">
                        <h2 className="text-lg font-semibold mb-3">Live Preview</h2>
                        <Card>
                            <CardContent className="p-4">
                                <div className="h-96 flex flex-col items-center justify-center text-center text-muted-foreground bg-gray-50 rounded-md p-4">
                                    <EyeIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                    <p className="font-medium">Live textual preview of the flow will appear here as you build.</p>
                                    <p className="text-sm mt-1">This is a simplified representation.</p>
                                </div>
                                <Button variant="outline" className="w-full mt-4" onClick={() => alert("Restart Preview action (placeholder)")}>Restart Preview</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            
            {isQuestionModalOpen && (
                <QuestionFormModal
                    isOpen={isQuestionModalOpen}
                    onOpenChange={setIsQuestionModalOpen}
                    onSubmit={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
                    initialData={editingQuestion ? {
                        id: editingQuestion.id,
                        questionText: editingQuestion.text,
                        answerType: editingQuestion.type,
                        radioOptions: editingQuestion.options.map(op => ({ value: op })) 
                    } : {
                      radioOptions: [{value: ""}, {value:""}]
                    }}
                />
            )}

        </MainLayout>
    );
};

export default EditFlowPage; 