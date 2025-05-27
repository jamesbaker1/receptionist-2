'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefcaseIcon, CalendarDaysIcon, InboxIcon } from 'lucide-react'; // Placeholder icons

interface Step4ToolCallsProps {
  onSubmit: (data: { toolsConfig?: any }) => void; // Define a proper type later
  onBack: () => void;
  initialData?: { toolsConfig?: any };
}

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
}

const mockTools: Tool[] = [
  {
    id: 'clio',
    name: 'Clio Integration',
    description: 'Connect to Clio to manage contacts and matters.',
    icon: BriefcaseIcon,
    enabled: false,
  },
  {
    id: 'litify',
    name: 'Litify Sync',
    description: 'Synchronize intake data with your Litify platform.',
    icon: InboxIcon, // Example, replace with actual or better placeholder
    enabled: false,
  },
  {
    id: 'outlook',
    name: 'Outlook Calendar',
    description: 'Schedule appointments and reminders in Outlook.',
    icon: CalendarDaysIcon,
    enabled: false,
  },
];

export default function Step4ToolCalls({ onSubmit, onBack, initialData }: Step4ToolCallsProps) {
  // In a real scenario, `enabled` state would be managed here or come from `initialData`
  // For this UI placeholder, they are just visually disabled or non-interactive.

  const handleFormSubmit = () => {
    // Collect data if any tools were configurable
    const toolsConfig = mockTools.reduce((acc, tool) => {
      // @ts-ignore
      acc[tool.id] = tool.enabled; // This would be dynamic if switches were interactive
      return acc;
    }, {});
    console.log('Step 4 Data:', { toolsConfig });
    onSubmit({ toolsConfig });
  };

  return (
    <div className="space-y-6 p-1">
      <div className='mb-6'>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Tool Calls & Integrations</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Integrations (Clio, Litify, Outlook) will be configured here. This section is for UI demonstration only.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
          <CardDescription>Toggle integrations you wish to activate for this flow. (Currently non-interactive)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {mockTools.map((tool) => (
            <div key={tool.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/30">
              <div className="flex items-center space-x-3">
                <tool.icon className="h-6 w-6 text-custom-primary" />
                <div>
                  <Label htmlFor={`tool-switch-${tool.id}`} className="font-medium">
                    {tool.name}
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{tool.description}</p>
                </div>
              </div>
              <Switch
                id={`tool-switch-${tool.id}`}
                checked={tool.enabled} // Visually reflects current state
                disabled // Non-interactive for placeholder
                aria-label={`Toggle ${tool.name}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mt-8">
        <Button variant="outline" onClick={onBack}>
          Back to Conditional Logic
        </Button>
        <Button onClick={handleFormSubmit}>Next: Review & Publish</Button>
      </div>
    </div>
  );
} 