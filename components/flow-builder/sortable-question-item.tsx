"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Question } from '@/types/flow';
import {
    GripVerticalIcon,
    Edit3Icon,
    Trash2Icon,
    ArrowUpIcon,
    ArrowDownIcon
} from 'lucide-react';

interface SortableQuestionItemProps {
    question: Question;
    index: number;
    selectedQuestionId: string | null;
    onSelectQuestion: (id: string) => void;
    onEditQuestion: (question: Question) => void;
    onDeleteQuestion: (id: string) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
    isFirstItem: boolean;
    isLastItem: boolean;
}

export function SortableQuestionItem({
    question,
    index,
    selectedQuestionId,
    onSelectQuestion,
    onEditQuestion,
    onDeleteQuestion,
    onMoveUp,
    onMoveDown,
    isFirstItem,
    isLastItem,
}: SortableQuestionItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="mb-2 touch-manipulation">
            <Card
                className={`p-3 ${selectedQuestionId === question.id ? 'border-custom-primary ring-2 ring-custom-primary' : 'hover:bg-muted/50'} ${isDragging ? 'shadow-lg' : ''}`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center flex-grow min-w-0">
                        <Button variant="ghost" size="icon" {...listeners} className="cursor-grab h-8 w-8 mr-1 active:cursor-grabbing">
                            <GripVerticalIcon className="h-5 w-5 text-muted-foreground" />
                            <span className="sr-only">Drag to reorder</span>
                        </Button>
                        <div 
                            className="flex-grow truncate cursor-pointer" 
                            onClick={() => onSelectQuestion(question.id)}
                        >
                            <span className="font-medium truncate pr-2">
                                {`${index + 1}. ${question.text}`}
                            </span>
                            <p className="text-xs text-muted-foreground mt-0.5">{question.type}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-0.5 ml-1 flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onMoveUp(question.id); }} disabled={isFirstItem} aria-label="Move up">
                            <ArrowUpIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onMoveDown(question.id); }} disabled={isLastItem} aria-label="Move down">
                            <ArrowDownIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onEditQuestion(question); }} aria-label="Edit question">
                            <Edit3Icon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onDeleteQuestion(question.id); }} aria-label="Delete question">
                            <Trash2Icon className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
} 