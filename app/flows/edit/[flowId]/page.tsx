"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
// import { DragEndEvent } from "@dnd-kit/core";
// import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { CopyIcon, SaveIcon, UploadCloudIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/main-layout";
import { mockFlows } from "@/mocks/flows";
// import { WizardFlow, Question, AnswerType, LogicRule } from "@/types/flow";
import { WizardFlow } from "@/types/flow";

// For now, create a placeholder QuestionFormValues type if the component doesn't exist
// interface QuestionFormValues {
// id: string;
// questionText: string;
// answerType: string;
// radioOptions?: { value: string }[];
// }

const EditFlowPage = () => {
    const { flowId } = useParams();
    const [flowData, setFlowData] = useState<WizardFlow | null>(null);
    // const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
    // const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // const [isLogicRuleFormOpen, setIsLogicRuleFormOpen] = useState(false);
    
    // Mock fetching flow data
    useEffect(() => {
        const formattedFlowId = `flow-${flowId}`;
        console.log("Original flowId:", flowId, "Formatted flowId:", formattedFlowId);
        console.log("Available flows:", mockFlows);
        console.log("Flow IDs in mock data:", mockFlows.map(f => f.id));
        const currentFlow = mockFlows.find(f => {
            console.log("Comparing:", f.id, formattedFlowId, "Match:", f.id === formattedFlowId);
            return f.id === formattedFlowId;
        });
        console.log("Found flow:", currentFlow);
        if (currentFlow) {
            setFlowData(currentFlow);
            // if (currentFlow.questions.length > 0) {
            // setSelectedQuestionId(currentFlow.questions[0].id);
            // }
            setHasUnsavedChanges(false); // Initial load, no unsaved changes
        } else {
            // Handle flow not found, e.g. redirect or show error
            console.error("Flow not found!");
        }
    }, [flowId]);
    
    // Autosave effect
    useEffect(() => {
        let autosaveTimeout: ReturnType<typeof setTimeout>;
        if (hasUnsavedChanges) {
            autosaveTimeout = setTimeout(() => {
                console.log("Autosaving changes...");
                toast("Changes automatically saved!", { description: "Your flow data has been updated." });
                setHasUnsavedChanges(false);
            }, 5000); // Autosave after 5 seconds of inactivity/changes
        }
        return () => clearTimeout(autosaveTimeout);
    }, [flowData, hasUnsavedChanges]); // Rerun if flowData or unsaved status changes

    const handleManualSave = () => {
        console.log("Manually saving draft...");
        toast("Draft Saved!", { description: "Your changes have been saved." });
        setHasUnsavedChanges(false);
    };

    if (!flowData) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold mb-2">Loading...</h2>
                        <p className="text-muted-foreground">Loading flow data...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: flowData.name, href: `/flows/edit/${flowId}` }, { label: "Edit" }]}>
            <div className="flex flex-col h-[calc(100vh-var(--header-height)-var(--breadcrumb-height)-2rem)]">
                {/* Toolbar */}
                <div className="flex justify-end items-center p-4 border-b bg-background">
                    <Button variant="outline" size="sm" className="mr-2" onClick={() => alert("Duplicate action (placeholder)")}><CopyIcon className="h-4 w-4 mr-1" /> Duplicate</Button>
                    <Button variant="outline" size="sm" className="mr-2" onClick={handleManualSave} disabled={!hasUnsavedChanges}>
                        <SaveIcon className="h-4 w-4 mr-1" /> Save Draft {hasUnsavedChanges && <span className="ml-1.5 h-2 w-2 bg-blue-500 rounded-full"></span>}
                    </Button>
                    <Button size="sm" className="bg-custom-primary hover:bg-custom-primary/90" onClick={() => toast("Flow Published!", { description: "Your flow is now live." })}><UploadCloudIcon className="h-4 w-4 mr-1" /> Publish Changes</Button>
                </div>

                {/* Main Editor Area */}
                <div className="flex-1 p-6">
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-semibold mb-4">Flow Editor</h2>
                        <p className="text-muted-foreground mb-6">
                            Advanced flow editing features are coming soon. For now, you can use the <strong>Create New Flow</strong> wizard to build flows.
                        </p>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Current flow: <strong>{flowData.name}</strong> ({flowData.questions.length} questions)
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Button asChild variant="outline">
                                    <a href="/flows/new">Create New Flow</a>
                                </Button>
                                <Button asChild>
                                    <a href="/dashboard">Back to Dashboard</a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default EditFlowPage;