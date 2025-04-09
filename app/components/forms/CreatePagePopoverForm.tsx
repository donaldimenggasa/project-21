import React, { useState } from 'react';
import { useStore } from '~/store/zustand/store';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { useForm, FormProvider } from 'react-hook-form';
import { TextField } from '~/components/form/fields/TextField';
import { TextareaField } from '~/components/form/fields/TextareaField';
import { SelectField } from '~/components/form/fields/SelectField';
import { IconField } from '~/components/form/fields/IconField';
import { ColorField } from '~/components/form/fields/ColorField';
import { SwitchField } from '~/components/form/fields/SwitchField';
import { CheckboxField } from '~/components/form/fields/CheckboxField';
import { cn } from '~/lib/utils';

interface CreatePagePopoverFormProps {
  onClose: () => void;
}

const formFields = [
  [
    {
      name: "title",
      title: "Page Title",
      type: "char" as const,
      description: "Enter a descriptive title for your page",
      rules: {
        required: "Page title is required",
        min: 3,
      },
    },
    {
      name: "description",
      title: "Description",
      type: "text" as const,
      description: "Provide a brief description of the page's purpose",
      rules: {
        required: "Description is required",
        min: 10,
      },
    },
  ],
  [
    {
      name: "icon",
      title: "Page Icon",
      type: "icon" as const,
      description: "Choose an icon to represent your page",
      rules: {
        required: "Please select an icon",
      },
    },
    {
      name: "iconColor",
      title: "Icon Color",
      type: "color" as const,
      description: "Choose a color for your page icon",
      rules: {
        required: "Please select an icon color",
      },
    },
    {
      name: "layout",
      title: "Layout Template",
      type: "select" as const,
      description: "Choose a layout template for your page",
      options: [
        { value: "default", label: "Default Layout" },
        { value: "sidebar", label: "With Sidebar" },
        { value: "landing", label: "Landing Page" },
        { value: "dashboard", label: "Dashboard" },
      ],
      rules: {
        required: "Please select a layout",
      },
    },
    {
      name: "isPublic",
      title: "Make Page Public",
      type: "switch" as const,
      description: "Allow public access to this page",
    },
    {
      name: "showInNavigation",
      title: "Show in Navigation",
      type: "checkbox" as const,
      description: "Display this page in the navigation menu",
    },
  ],
];

export function CreatePagePopoverForm({ onClose }: CreatePagePopoverFormProps) {
  const { createPage } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = formFields.length;
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      icon: 'Layout',
      iconColor: '#6b7280',
      layout: 'default',
      isPublic: false,
      showInNavigation: true
    }
  });

  const validateCurrentStep = async () => {
    const currentFields = formFields[currentStep];
    const fieldNames = currentFields.map(field => field.name);
    return await form.trigger(fieldNames);
  };

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault();
    const isValid = await validateCurrentStep();
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (data: any) => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      createPage({
        id: crypto.randomUUID(),
        ...data,
        content: '',
        createdAt: new Date().toISOString(),
      });
      onClose();
    }
  };

  const renderField = (field: any) => {
    switch (field.type) {
      case 'char':
        return <TextField key={field.name} name={field.name} label={field.title} description={field.description} />;
      case 'text':
        return <TextareaField key={field.name} name={field.name} label={field.title} description={field.description} />;
      case 'icon':
        return <IconField key={field.name} name={field.name} label={field.title} description={field.description} />;
      case 'color':
        return <ColorField key={field.name} name={field.name} label={field.title} description={field.description} />;
      case 'select':
        return <SelectField key={field.name} name={field.name} label={field.title} description={field.description} options={field.options} />;
      case 'switch':
        return <SwitchField key={field.name} name={field.name} label={field.title} description={field.description} />;
      case 'checkbox':
        return <CheckboxField key={field.name} name={field.name} label={field.title} description={field.description} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-[400px] bg-gray-900 rounded-lg border border-gray-800 p-4">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-400">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-blue-400">
            {Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {formFields[currentStep].map(field => renderField(field))}

          <div className="flex justify-between pt-4">
            {isFirstStep ? (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={handleBack}
                className="px-3 py-1.5 text-sm text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors inline-flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
            )}

            {isLastStep ? (
              <button
                type="submit"
                className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors inline-flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Create Page
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors inline-flex items-center"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}