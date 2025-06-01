'use client'; // Ensure this is at the top if not already

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import TemplateCard from "@/components/templates/template-card";
import TemplatePreviewModal from "@/components/templates/template-preview-modal"; // Import the modal
import { BriefcaseIcon, UsersIcon, ScaleIcon, ShieldCheckIcon, HandshakeIcon } from "lucide-react"; // Example icons

// Mock data for templates
const mockTemplates = [
  {
    id: "1",
    title: "Personal Injury Intake",
    description: "Streamline client intake for personal injury cases. Gathers accident details, injuries, and insurance information.",
    icon: <ScaleIcon className="h-8 w-8 text-custom-primary" />,
    contentPreview: [
      "Client Name", 
      "Date of Accident", 
      "Accident Location", 
      "Brief Description of Injuries",
      "Insurance Provider"
    ]
  },
  {
    id: "2",
    title: "Family Law Consultation",
    description: "Initial consultation for family law matters like divorce, custody, and support. Collects key personal and case information.",
    icon: <UsersIcon className="h-8 w-8 text-custom-primary" />,
    contentPreview: [
      "Client Full Name", 
      "Spouse Full Name (if applicable)", 
      "Date of Marriage (if applicable)", 
      "Number of Children",
      "Reason for Consultation"
    ]
  },
  {
    id: "4",
    title: "Criminal Defense Initial Contact",
    description: "Essential questions for an initial contact in criminal defense cases, ensuring all critical details are captured upfront.",
    icon: <ShieldCheckIcon className="h-8 w-8 text-custom-primary" />,
    contentPreview: ["Client Name", "Date of Alleged Offense", "Charges", " arresting Agency"]
  },
  {
    id: "5",
    title: "General Legal Consultation",
    description: "A versatile template for various legal consultations, adaptable to different practice areas and client needs.",
    icon: <BriefcaseIcon className="h-8 w-8 text-custom-primary" />,
    contentPreview: ["Client Name", "Nature of Inquiry", "Key Dates", "Desired Outcome"]
  },
];

// Define a type for your template object if you haven't already
// This should match the structure of mockTemplates and what TemplatePreviewModal expects
interface Template {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode; // Or a more specific type if your icons are consistent
  contentPreview?: string[]; // Added contentPreview field
  // Add other fields here, e.g., content?: string;
}

export default function TemplatesPage() {
  const router = useRouter(); // Get router instance
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTemplate(null);
  };

  const handleUseTemplate = (template: Template) => {
    console.log('Using template:', template.title, template.id);
    router.push(`/flows/new?templateId=${template.id}`); // Navigate
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Templates Library</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Start a new flow quickly by using one of our pre-built templates.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            title={template.title}
            description={template.description}
            icon={template.icon}
            onPreview={() => handlePreview(template as Template)} // Pass the full template object
            onUseTemplate={() => handleUseTemplate(template as Template)} // Pass the full template object
          />
        ))}
      </div>

      <TemplatePreviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        template={selectedTemplate}
      />
    </div>
  );
} 