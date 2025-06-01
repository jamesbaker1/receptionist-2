import { type QuestionFormValues, type AnswerType } from "@/components/flow-builder/question-form-modal";

export interface FlowTemplate {
  id: string;
  name: string;
  description: string;
  questions: QuestionFormValues[];
  introductionGreeting?: string;
  goodbyeGreeting?: string;
}

export const flowTemplates: FlowTemplate[] = [
  {
    id: "1",
    name: "Personal Injury Intake",
    description: "Streamline client intake for personal injury cases. Gathers accident details, injuries, and insurance information.",
    questions: [
      { id: "q_pi_name", questionText: "What is your full name?", answerType: "Text" },
      { id: "q_pi_date", questionText: "When did the accident occur?", answerType: "Text" }, // Consider a date picker type later
      { id: "q_pi_location", questionText: "Where did the accident happen?", answerType: "Text" },
      { id: "q_pi_desc", questionText: "Please briefly describe how the accident occurred.", answerType: "Text" },
      { id: "q_pi_injuries", questionText: "What injuries did you sustain?", answerType: "Text" },
      { id: "q_pi_police", questionText: "Was a police report filed?", answerType: "Yes/No" },
      { id: "q_pi_insurance", questionText: "Do you have insurance information available?", answerType: "Yes/No" },
    ],
    introductionGreeting: "Hello, thank you for contacting us about your personal injury case. I'm here to gather some initial details.",
    goodbyeGreeting: "Thank you for providing this information. We will be in touch shortly. Goodbye."
  },
  {
    id: "2",
    name: "Family Law Consultation",
    description: "Initial consultation for family law matters like divorce, custody, and support.",
    questions: [
      { id: "q_fl_name", questionText: "What is your full name?", answerType: "Text" },
      { id: "q_fl_spouse_name", questionText: "What is your spouse\'s full name (if applicable)?", answerType: "Text" },
      { id: "q_fl_marriage_date", questionText: "What is the date of marriage (if applicable)?", answerType: "Text" },
      { id: "q_fl_children", questionText: "Do you have any children? If so, how many and what are their ages?", answerType: "Text" },
      { id: "q_fl_reason", questionText: "What is the primary reason for this consultation (e.g., divorce, custody, support)?", answerType: "Radio", radioOptions: [{value: "Divorce"}, {value: "Custody"}, {value: "Support"}, {value: "Other"}] },
      { id: "q_fl_separation_date", questionText: "If separated, what was the date of separation?", answerType: "Text" },
    ],
    introductionGreeting: "Welcome to our family law consultation line. I can help you get started.",
    goodbyeGreeting: "Thank you for your time. A member of our team will reach out to you soon."
  },
  {
    id: "4", // Matching ID from app/templates/page.tsx
    name: "Criminal Defense Initial Contact",
    description: "Essential questions for an initial contact in criminal defense cases.",
    questions: [
      { id: "q_cd_name", questionText: "Client\'s Full Name?", answerType: "Text" },
      { id: "q_cd_dob", questionText: "Client\'s Date of Birth?", answerType: "Text" },
      { id: "q_cd_alleged_offense_date", questionText: "Date of Alleged Offense?", answerType: "Text" },
      { id: "q_cd_charges", questionText: "What are the charges? (List all known)", answerType: "Text" },
      { id: "q_cd_arresting_agency", questionText: "Which agency made the arrest? (e.g., City Police, County Sheriff)", answerType: "Text" },
      { id: "q_cd_bail_status", questionText: "Current bail status? (e.g., Released on Bail, In Custody, Bail Amount)", answerType: "Text" },
      { id: "q_cd_prior_record", questionText: "Does the client have any prior criminal record?", answerType: "Yes/No" },
    ],
    introductionGreeting: "You've reached the criminal defense hotline. I need to ask a few questions to understand your situation.",
    goodbyeGreeting: "Thank you. Please await contact from our legal team."
  },
  {
    id: "5", // Matching ID from app/templates/page.tsx
    name: "General Legal Consultation",
    description: "A versatile template for various legal consultations.",
    questions: [
      { id: "q_gl_name", questionText: "What is your full name?", answerType: "Text" },
      { id: "q_gl_contact_email", questionText: "What is your email address?", answerType: "Text" },
      { id: "q_gl_contact_phone", questionText: "What is your phone number?", answerType: "Text" },
      { id: "q_gl_inquiry_nature", questionText: "Briefly describe the nature of your legal inquiry.", answerType: "Text" },
      { id: "q_gl_key_dates", questionText: "Are there any key dates or deadlines related to your inquiry?", answerType: "Text" },
      { id: "q_gl_desired_outcome", questionText: "What is your desired outcome?", answerType: "Text" },
    ],
    introductionGreeting: "Thank you for calling for a legal consultation. Let's begin with some basic information.",
    goodbyeGreeting: "We appreciate you reaching out. We will review your details and get back to you."
  },
  // No questions for blank template
  {
    id: "blank",
    name: "Blank Flow (No Template)",
    description: "Start with a clean slate and build your flow from scratch.",
    questions: [],
    introductionGreeting: "Hello, thank you for calling. How can I help you today?",
    goodbyeGreeting: "Thank you for calling. Goodbye!"
  }
]; 