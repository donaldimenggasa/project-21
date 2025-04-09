import React, { useState, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField } from '~/components/form/fields/TextField';
import { TextareaField } from '~/components/form/fields/TextareaField';
import { SelectField } from '~/components/form/fields/SelectField';
import { CheckboxField } from '~/components/form/fields/CheckboxField';
import { SwitchField } from '~/components/form/fields/SwitchField';
import { IconField } from '~/components/form/fields/IconField';
import { ColorField } from '~/components/form/fields/ColorField';
import { X, Save, ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react';
import { cn } from '~/lib/utils';

interface FieldBase {
  name: string;
  title: string;
  description?: string;
  rules?: {
    required?: string;
    min?: number;
    max?: number;
    pattern?: {
      value: RegExp;
      message: string;
    };
    custom?: (value: any) => true | string;
  };
}

interface CharField extends FieldBase {
  type: 'char';
  icon?: React.ComponentType<any>;
}

interface TextAreaField extends FieldBase {
  type: 'text';
  icon?: React.ComponentType<any>;
}

interface NumberField extends FieldBase {
  type: 'number';
  icon?: React.ComponentType<any>;
}

interface SelectField extends FieldBase {
  type: 'select';
  options: { value: string; label: string }[];
  icon?: React.ComponentType<any>;
}

interface CheckboxField extends FieldBase {
  type: 'checkbox';
  icon?: React.ComponentType<any>;
}

interface SwitchField extends FieldBase {
  type: 'switch';
  icon?: React.ComponentType<any>;
}

interface IconField extends FieldBase {
  type: 'icon';
  icon?: React.ComponentType<any>;
}

interface ColorField extends FieldBase {
  type: 'color';
  icon?: React.ComponentType<any>;
}

type Field = CharField | TextAreaField | NumberField | SelectField | CheckboxField | SwitchField | IconField | ColorField;

interface DynamicFormProps {
  id?: string;
  fields: Field[][];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  title?: string;
  initialData?: any;
}

export function DynamicForm({ id, fields, onSubmit, onCancel, title = 'Form', initialData }: DynamicFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const totalSteps = fields.length;
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  // Generate Zod schema based on fields
  const generateSchema = () => {
    const schemaFields = fields.flat().reduce((acc, field) => {
      let fieldSchema = z.string();

      if (field.rules?.required) {
        fieldSchema = fieldSchema.min(1, field.rules.required);
      }

      if (field.type === 'number') {
        fieldSchema = z.string()
          .transform(Number)
          .pipe(z.number());
        
        if (field.rules?.min !== undefined) {
          fieldSchema = fieldSchema.min(field.rules.min);
        }
        if (field.rules?.max !== undefined) {
          fieldSchema = fieldSchema.max(field.rules.max);
        }
      }

      if (field.rules?.pattern) {
        fieldSchema = fieldSchema.regex(field.rules.pattern.value, field.rules.pattern.message);
      }

      if (field.rules?.custom) {
        fieldSchema = fieldSchema.refine(
          (value) => field.rules?.custom?.(value) === true,
          (value) => ({ message: field.rules?.custom?.(value) as string })
        );
      }

      if (field.type === 'checkbox' || field.type === 'switch') {
        fieldSchema = z.boolean().optional();
      }

      return {
        ...acc,
        [field.name]: fieldSchema,
      };
    }, {});

    return z.object(schemaFields);
  };

  const form = useForm({
    resolver: zodResolver(generateSchema()),
    defaultValues: initialData,
  });

  // Set initial form values when initialData changes
  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        form.setValue(key, value);
      });
    }
  }, [initialData, form]);

  const validateCurrentStep = async () => {
    const currentFields = fields[currentStep];
    const fieldNames = currentFields.map(field => field.name);
    const result = await form.trigger(fieldNames);
    return result;
  };

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    const isValid = await validateCurrentStep();
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (data: any) => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      onSubmit(data);
    }
  };

  const handleCancel = () => {
    const formValues = form.getValues();
    const hasValues = Object.values(formValues).some(value => {
      if (typeof value === 'string') return value.trim() !== '';
      return value !== undefined && value !== false;
    });

    if (hasValues) {
      setShowConfirmModal(true);
    } else {
      onCancel();
    }
  };

  const renderField = (field: Field) => {
    const commonProps = {
      key: field.name,
      name: field.name,
      label: field.title,
      description: field.description,
    };

    switch (field.type) {
      case 'char':
        return <TextField {...commonProps} />;
      case 'text':
        return <TextareaField {...commonProps} />;
      case 'number':
        return <TextField {...commonProps} type="number" />;
      case 'select':
        return <SelectField {...commonProps} options={field.options} />;
      case 'checkbox':
        return <CheckboxField {...commonProps} />;
      case 'switch':
        return <SwitchField {...commonProps} />;
      case 'icon':
        return <IconField {...commonProps} />;
      case 'color':
        return <ColorField {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-card">
        {totalSteps > 1 && (
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-secondary">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="h-1.5 bg-background rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-in-out"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6">
            <div className="space-y-6">
              {fields[currentStep].map(field => renderField(field))}
            </div>

            <div className="flex justify-between mt-8">
              {isFirstStep ? (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-sm btn-ghost"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn btn-sm btn-outline"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </button>
              )}

              {isLastStep ? (
                <button
                  type="submit"
                  className="btn btn-sm btn-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-sm btn-primary"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-lg p-6 max-w-md w-full mx-4 border border-border">
            <div className="flex items-center space-x-4 text-warning mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Confirm Cancel</h3>
            </div>
            <p className="text-foreground mb-6">
              Are you sure you want to cancel? All entered data will be lost and cannot be recovered.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="btn btn-sm btn-ghost"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-sm btn-destructive"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}