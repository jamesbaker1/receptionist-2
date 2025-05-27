export enum AnswerType {
    TEXT = "Text",
    YES_NO = "Yes/No",
    RADIO = "Radio",
    // Add other types as needed: CHECKBOX, DATE, NUMBER, etc.
}

export interface Question {
    id: string;
    text: string;
    type: AnswerType;
    options: string[]; // For RADIO, CHECKBOX types
    // Add any other question-specific properties, e.g., isRequired, placeholder
}

export interface LogicRule {
    id: string;
    sourceQuestionId: string;
    condition: string; // e.g., "Yes", "No", a specific radio option value, or special conditions like "answered" / "not answered"
    targetQuestionId: string; // Can be another question ID or special values like "END_CALL"
    // Add other logic properties, e.g., logical operator (AND/OR) if multiple conditions
}

export interface ToolCall {
    id: string;
    name: string; // e.g., "Clio Integration", "Send Email Notification"
    enabled: boolean;
    details?: string; // Configuration details or description
    // Add other tool-specific properties
}

export interface Flow {
    id: string;
    name: string;
    questions: Question[];
    logic: LogicRule[];
    toolCalls: ToolCall[];
    lastEditedDate: string; // Consider using Date type if performing date operations
    status: "Draft" | "Published"; // Or a more specific enum
    // Add any other flow-level properties, e.g., description, version, createdDate
} 