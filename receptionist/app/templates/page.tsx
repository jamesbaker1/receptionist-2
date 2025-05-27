import TemplateCard from "@/components/templates/template-card";
import { BriefcaseIcon, UsersIcon, ScaleIcon, ShieldCheckIcon, HandshakeIcon } from "lucide-react"; // Example icons

// Mock data for templates
const mockTemplates = [
  {
    id: "1",
    title: "Personal Injury Intake",
    description: "Streamline client intake for personal injury cases. Gathers accident details, injuries, and insurance information.",
    icon: <ScaleIcon className="h-8 w-8 text-custom-primary" />,
  },
  {
    id: "2",
    title: "Family Law Consultation",
    description: "Initial consultation for family law matters like divorce, custody, and support. Collects key personal and case information.",
    icon: <UsersIcon className="h-8 w-8 text-custom-primary" />,
  },
  {
    id: "3",
    title: "Real Estate Closing",
    description: "Guides clients through the information gathering process for property closings, covering all necessary details.",
    icon: <HandshakeIcon className="h-8 w-8 text-custom-primary" />,
  },
  {
    id: "4",
    title: "Criminal Defense Initial Contact",
    description: "Essential questions for an initial contact in criminal defense cases, ensuring all critical details are captured upfront.",
    icon: <ShieldCheckIcon className="h-8 w-8 text-custom-primary" />,
  },
  {
    id: "5",
    title: "General Legal Consultation",
    description: "A versatile template for various legal consultations, adaptable to different practice areas and client needs.",
    icon: <BriefcaseIcon className="h-8 w-8 text-custom-primary" />,
  },
];

export default function TemplatesPage() {
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
            // TODO: Implement onPreview and onUseTemplate actions
          />
        ))}
      </div>
    </div>
  );
} 