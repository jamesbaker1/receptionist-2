'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BriefcaseIcon, CalendarDaysIcon, InboxIcon, MailIcon, PhoneCallIcon, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useSession, signIn } from 'next-auth/react';

interface ToolsConfig {
  [key: string]: {
    enabled: boolean;
    config?: Tool['config'];
  };
}

interface Step4ToolCallsProps {
  onSubmit: (data: { toolsConfig?: ToolsConfig }) => void;
  onBack: () => void;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  category: 'crm' | 'communication' | 'scheduling';
  config?: {
    transferNumber?: string;
    triggerQuestion?: string;
    triggerResponse?: string;
    emailTemplate?: string;
    webhookUrl?: string;
    priority?: 'low' | 'medium' | 'high';
    syncContacts?: boolean;
    createMatters?: boolean;
    createTasks?: boolean;
    assignToUser?: string;
  };
}

const mockTools: Tool[] = [
  {
    id: 'clio',
    name: 'Clio Integration',
    description: 'Automatically sync intake data with your Clio account.',
    icon: BriefcaseIcon,
    enabled: false,
    category: 'crm',
    config: {
      syncContacts: true,
      createMatters: false,
      createTasks: true,
      assignToUser: '',
    }
  },
  {
    id: 'litify',
    name: 'Litify Sync',
    description: 'Synchronize intake data with your Litify platform.',
    icon: InboxIcon,
    enabled: false,
    category: 'crm',
  },
  {
    id: 'outlook',
    name: 'Outlook Calendar',
    description: 'Schedule appointments and reminders in Outlook.',
    icon: CalendarDaysIcon,
    enabled: false,
    category: 'scheduling',
  },
  {
    id: 'email',
    name: 'Email Integration',
    description: 'Send automated emails based on call outcomes and responses.',
    icon: MailIcon,
    enabled: false,
    category: 'communication',
    config: {
      emailTemplate: '',
      priority: 'medium'
    }
  },
  {
    id: 'hot-transfer',
    name: 'Hot Transfer',
    description: 'Transfer call to a specific number based on question responses.',
    icon: PhoneCallIcon,
    enabled: false,
    category: 'communication',
    config: {
      transferNumber: '',
      triggerQuestion: '',
      triggerResponse: '',
      priority: 'high'
    }
  },
];

const toolCategories = {
  crm: { name: 'CRM & Data Management', description: 'Integrate with your client management systems' },
  communication: { name: 'Communication & Transfer', description: 'Handle call transfers and notifications' },
  scheduling: { name: 'Scheduling & Calendar', description: 'Manage appointments and scheduling' }
};

export default function Step4ToolCalls({ onSubmit, onBack }: Step4ToolCallsProps) {
  const { data: session } = useSession()
  const [tools, setTools] = React.useState<Tool[]>(mockTools);
  const [viewMode, setViewMode] = React.useState<'simple' | 'grouped'>('simple');

  const handleToolToggle = (toolId: string) => {
    setTools(prevTools => 
      prevTools.map(tool => 
        tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool
      )
    );
  };

  const handleConfigChange = (toolId: string, config: Partial<Tool['config']>) => {
    setTools(prevTools =>
      prevTools.map(tool =>
        tool.id === toolId ? { ...tool, config: { ...tool.config, ...config } } : tool
      )
    );
  };

  const handleFormSubmit = () => {
    const toolsConfig = tools.reduce((acc, tool) => {
      acc[tool.id] = {
        enabled: tool.enabled,
        config: tool.config
      };
      return acc;
    }, {} as ToolsConfig);
    
    console.log('Step 4 Data:', { toolsConfig });
    onSubmit({ toolsConfig });
  };

  const enabledToolsCount = tools.filter(tool => tool.enabled).length;

  // Add Clio-specific configuration UI
  const renderClioConfig = (tool: Tool) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-green-600 mb-4">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">Connected to Clio as {session?.user?.name}</span>
        <span className="text-xs text-muted-foreground">({session?.user?.firmName})</span>
      </div>
      
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={tool.config?.syncContacts || false}
            onChange={(e) => handleConfigChange(tool.id, { syncContacts: e.target.checked })}
            className="rounded"
          />
          <span>Create contacts in Clio for new callers</span>
        </Label>
        
        <Label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={tool.config?.createMatters || false}
            onChange={(e) => handleConfigChange(tool.id, { createMatters: e.target.checked })}
            className="rounded"
          />
          <span>Create new matters for qualified leads</span>
        </Label>
        
        <Label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={tool.config?.createTasks || false}
            onChange={(e) => handleConfigChange(tool.id, { createTasks: e.target.checked })}
            className="rounded"
          />
          <span>Create follow-up tasks</span>
        </Label>

        {tool.config?.createTasks && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="assign-to-user">Assign tasks to</Label>
            <Input
              id="assign-to-user"
              placeholder="Enter Clio user ID or leave blank for caller"
              value={tool.config?.assignToUser || ''}
              onChange={(e) => handleConfigChange(tool.id, { assignToUser: e.target.value })}
            />
          </div>
        )}
      </div>
    </div>
  )

  const renderToolCard = (tool: Tool) => (
    <div key={tool.id} className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/30">
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
          checked={tool.enabled}
          onCheckedChange={() => handleToolToggle(tool.id)}
          aria-label={`Toggle ${tool.name}`}
          disabled={tool.id === 'clio' && !session} // Disable if not authenticated
        />
      </div>
      
      {tool.enabled && (
        <div className="ml-12 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/30 space-y-4">
          {tool.id === 'clio' && session && renderClioConfig(tool)}
          {tool.id === 'clio' && !session && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">
                Sign in with Clio to configure this integration
              </p>
              <Button onClick={() => signIn("clio")} size="sm">
                Connect Clio Account
              </Button>
            </div>
          )}

          {/* Basic Configuration */}
          {tool.id === 'hot-transfer' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="transfer-number">Transfer Number</Label>
                <Input
                  id="transfer-number"
                  placeholder="Enter phone number"
                  value={tool.config?.transferNumber || ''}
                  onChange={(e) => handleConfigChange(tool.id, { transferNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trigger-question">Trigger Question</Label>
                <Input
                  id="trigger-question"
                  placeholder="Question ID to monitor"
                  value={tool.config?.triggerQuestion || ''}
                  onChange={(e) => handleConfigChange(tool.id, { triggerQuestion: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trigger-response">Trigger Response</Label>
                <Input
                  id="trigger-response"
                  placeholder="Response that triggers transfer"
                  value={tool.config?.triggerResponse || ''}
                  onChange={(e) => handleConfigChange(tool.id, { triggerResponse: e.target.value })}
                />
              </div>
            </>
          )}

          {tool.id === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="email-template">Email Template</Label>
              <Textarea
                id="email-template"
                placeholder="Enter email template content..."
                value={tool.config?.emailTemplate || ''}
                onChange={(e) => handleConfigChange(tool.id, { emailTemplate: e.target.value })}
              />
            </div>
          )}

          {/* Priority Setting for Communication Tools */}
          {(tool.id === 'email' || tool.id === 'hot-transfer') && (
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                className="w-full p-2 border rounded-md"
                value={tool.config?.priority || 'medium'}
                onChange={(e) => handleConfigChange(tool.id, { priority: e.target.value as 'low' | 'medium' | 'high' })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderSimpleView = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Available Integrations
          {enabledToolsCount > 0 && (
            <Badge variant="secondary">{enabledToolsCount} enabled</Badge>
          )}
        </CardTitle>
        <CardDescription>Toggle and configure integrations for this flow.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {tools.map(renderToolCard)}
      </CardContent>
    </Card>
  );

  const renderGroupedView = () => (
    <div className="space-y-6">
      {Object.entries(toolCategories).map(([categoryKey, categoryInfo]) => {
        const categoryTools = tools.filter(tool => tool.category === categoryKey);
        const enabledInCategory = categoryTools.filter(tool => tool.enabled).length;
        
        return (
          <Card key={categoryKey}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {categoryInfo.name}
                {enabledInCategory > 0 && (
                  <Badge variant="secondary">{enabledInCategory} enabled</Badge>
                )}
              </CardTitle>
              <CardDescription>{categoryInfo.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {categoryTools.map(renderToolCard)}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6 p-1">
      <div className='mb-6'>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Tool Calls & Integrations</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Configure integrations and automated actions for your flow.
        </p>
      </div>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'simple' | 'grouped')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simple">Simple View</TabsTrigger>
          <TabsTrigger value="grouped">Grouped by Category</TabsTrigger>
        </TabsList>
        <TabsContent value="simple" className="mt-6">
          {renderSimpleView()}
        </TabsContent>
        <TabsContent value="grouped" className="mt-6">
          {renderGroupedView()}
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center mt-8">
        <Button variant="outline" onClick={onBack}>
          Back to Conditional Logic
        </Button>
        <Button onClick={handleFormSubmit}>Next: Review & Publish</Button>
      </div>
    </div>
  );
} 