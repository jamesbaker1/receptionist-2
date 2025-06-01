import { WizardFlow, AnswerType } from "@/types/flow";

export const mockFlows: WizardFlow[] = [
  {
    id: "flow-1",
    name: "Basic Customer Intake",
    questions: [
      {
        id: "q1",
        text: "What is your name?",
        type: AnswerType.TEXT,
        options: []
      },
      {
        id: "q2",
        text: "Are you a new or existing customer?",
        type: AnswerType.RADIO,
        options: ["New", "Existing"]
      },
      {
        id: "q3",
        text: "What is the nature of your inquiry?",
        type: AnswerType.TEXT,
        options: []
      }
    ],
    logic: [
      {
        id: "l1",
        sourceQuestionId: "q2",
        condition: "New",
        targetQuestionId: "q3"
      }
    ],
    toolCalls: [
      {
        id: "t1",
        name: "Send Welcome Email",
        enabled: true,
        details: "Sends welcome email to new customers"
      }
    ],
    lastEditedDate: "2024-03-20",
    status: "Draft",
    introductionGreeting: "Hello, welcome to our service. How can I assist you today?",
    goodbyeGreeting: "Thank you for calling. Have a great day!"
  },
  {
    id: "flow-2",
    name: "Support Ticket Creation",
    questions: [
      {
        id: "q1",
        text: "What is your support ticket number?",
        type: AnswerType.TEXT,
        options: []
      },
      {
        id: "q2",
        text: "Is this an urgent issue?",
        type: AnswerType.YES_NO,
        options: []
      },
      {
        id: "q3",
        text: "Please describe your issue in detail",
        type: AnswerType.TEXT,
        options: []
      }
    ],
    logic: [
      {
        id: "l1",
        sourceQuestionId: "q2",
        condition: "Yes",
        targetQuestionId: "q3"
      }
    ],
    toolCalls: [
      {
        id: "t1",
        name: "Create Support Ticket",
        enabled: true,
        details: "Creates a new support ticket in the system"
      }
    ],
    lastEditedDate: "2024-03-19",
    status: "Published",
    introductionGreeting: "Thank you for contacting support. How can I help you with your ticket?",
    goodbyeGreeting: "Your support ticket has been noted. Goodbye."
  }
]; 