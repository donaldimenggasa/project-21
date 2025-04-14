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
import { DateField } from '~/components/form/fields/DateField';
import { DateTimeField } from '~/components/form/fields/DateTimeField';
import { FileField } from '~/components/form/fields/FileField';
import { ImageField } from '~/components/form/fields/ImageField';
import { MonetaryField } from '~/components/form/fields/MonetaryField';
import { NumberField } from '~/components/form/fields/NumberField';
import { TagsField } from '~/components/form/fields/TagsField';
import { SignatureField } from '~/components/form/fields/SignatureField';
import { RelatedField } from '~/components/form/fields/RelatedField';
import { PriorityField } from '~/components/form/fields/PriorityField';
import { LinesField } from '~/components/form/fields/LinesField';
import { One2ManyField } from '~/components/form/fields/One2ManyField';
import { Many2OneField } from '~/components/form/fields/Many2OneField';
import { Many2ManyField } from '~/components/form/fields/Many2ManyField';
import { X, Save, ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react';
import { cn } from '~/lib/utils';

interface FieldBase {
  name: string;
  title: string;
  description?: string;
  required?: boolean;
  readonly?: boolean;
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
  defaultValue?: string;
  placeholder?: string;
  maxLength?: number;
}

interface TextField extends FieldBase {
  type: 'text';
  defaultValue?: string;
  placeholder?: string;
  rows?: number;
}

interface IntegerField extends FieldBase {
  type: 'integer';
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
}

interface FloatField extends FieldBase {
  type: 'float';
  defaultValue?: number;
  precision?: number;
  min?: number;
  max?: number;
  step?: number;
}

interface MonetaryField extends FieldBase {
  type: 'monetary';
  defaultValue?: number;
  currency_field?: string;
  precision?: number;
}

interface BooleanField extends FieldBase {
  type: 'boolean';
  defaultValue?: boolean;
}

interface SelectionField extends FieldBase {
  type: 'selection';
  options: { value: string; label: string }[];
  defaultValue?: string;
}

interface DateField extends FieldBase {
  type: 'date';
  defaultValue?: string;
  minDate?: string;
  maxDate?: string;
}

interface DateTimeField extends FieldBase {
  type: 'datetime';
  defaultValue?: string;
  minDate?: string;
  maxDate?: string;
}

interface BinaryField extends FieldBase {
  type: 'binary';
  accept?: string;
  maxSize?: number;
}

interface ImageField extends FieldBase {
  type: 'image';
  accept?: string;
  maxSize?: number;
  width?: number;
  height?: number;
}

interface HTMLField extends FieldBase {
  type: 'html';
  defaultValue?: string;
  sanitize?: boolean;
}

interface One2ManyField extends FieldBase {
  type: 'one2many';
  relation: string;
  inverse_field: string;
  domain?: any[];
  context?: Record<string, any>;
}

interface Many2OneField extends FieldBase {
  type: 'many2one';
  relation: string;
  domain?: any[];
  context?: Record<string, any>;
  optionsUrl?: string;
  renderOptions?: (option: any) => React.ReactNode;
}

interface Many2ManyField extends FieldBase {
  type: 'many2many';
  relation: string;
  domain?: any[];
  context?: Record<string, any>;
}

interface TagsField extends FieldBase {
  type: 'tags';
  options: string[];
  defaultValue?: string[];
}

interface PriorityField extends FieldBase {
  type: 'priority';
  defaultValue?: number;
  levels?: number;
}

interface SignatureField extends FieldBase {
  type: 'signature';
  defaultValue?: string;
  width?: number;
  height?: number;
}

interface RelatedField extends FieldBase {
  type: 'related';
  relation: string;
  path: string[];
  readonly?: boolean;
}

interface LinesField extends FieldBase {
  type: 'lines';
  defaultValue?: string[];
}

type Field = CharField | TextField | IntegerField | FloatField | MonetaryField |
  BooleanField | SelectionField | DateField | DateTimeField | BinaryField |
  ImageField | HTMLField | One2ManyField | Many2OneField | Many2ManyField |
  TagsField | PriorityField | SignatureField | RelatedField | LinesField;

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

  const generateSchema = () => {
    const schemaFields = fields.flat().reduce((acc, field) => {
      let fieldSchema: any;

      switch (field.type) {
        case 'many2one':
          fieldSchema = z.number();
          break;

        case 'many2many':
        case 'tags':
          fieldSchema = z.array(z.string());
          break;

        case 'char':
        case 'text':
        case 'html': {
          let schema = z.string();
          if (field.rules?.required) {
            schema = schema.min(1, field.rules.required);
          }
          if (field.rules?.min !== undefined) {
            schema = schema.min(field.rules.min, `Minimum length is ${field.rules.min}`);
          }
          if (field.rules?.max !== undefined) {
            schema = schema.max(field.rules.max, `Maximum length is ${field.rules.max}`);
          }
          fieldSchema = schema;
          break;
        }

        case 'integer': {
          let schema = z.number().int();
          if (field.rules?.min !== undefined) {
            schema = schema.min(field.rules.min, `Minimum value is ${field.rules.min}`);
          }
          if (field.rules?.max !== undefined) {
            schema = schema.max(field.rules.max, `Maximum value is ${field.rules.max}`);
          }
          fieldSchema = z.preprocess((val) => {
            if (typeof val === 'string') return parseInt(val, 10);
            return val;
          }, schema);
          break;
        }

        case 'float':
        case 'monetary': {
          let schema = z.number();
          if (field.rules?.min !== undefined) {
            schema = schema.min(field.rules.min, `Minimum value is ${field.rules.min}`);
          }
          if (field.rules?.max !== undefined) {
            schema = schema.max(field.rules.max, `Maximum value is ${field.rules.max}`);
          }
          fieldSchema = z.preprocess((val) => {
            if (typeof val === 'string') return parseFloat(val);
            return val;
          }, schema);
          break;
        }

        case 'boolean':
          fieldSchema = z.boolean();
          break;

        case 'selection':
          fieldSchema = z.string();
          break;

        case 'date': {
          fieldSchema = z.string().refine(
            (val) => {
              if (!val) return true;
              const date = new Date(val);
              return !isNaN(date.getTime());
            },
            { message: "Invalid date format" }
          );
          break;
        }

        case 'datetime': {
          fieldSchema = z.string().refine(
            (val) => {
              if (!val) return true;
              const date = new Date(val);
              return !isNaN(date.getTime());
            },
            { message: "Invalid datetime format" }
          );
          break;
        }

        case 'binary':
        case 'image':
          fieldSchema = z.any();
          break;

        case 'one2many':
        case 'many2many':
          fieldSchema = z.array(z.string());
          break;

        case 'priority':
          fieldSchema = z.number();
          break;

        case 'signature':
          fieldSchema = z.string();
          break;

        case 'related':
          fieldSchema = z.any();
          break;

        case 'lines':
          fieldSchema = z.array(z.string());
          break;

        default:
          fieldSchema = z.any();
      }

      if (field.rules?.pattern && 'regex' in fieldSchema) {
        fieldSchema = fieldSchema.regex(field.rules.pattern.value, field.rules.pattern.message);
      }

      if (field.rules?.custom) {
        fieldSchema = fieldSchema.refine(
          (value) => field.rules?.custom?.(value) === true,
          (value) => ({ message: field.rules?.custom?.(value) as string })
        );
      }

      return {
        ...acc,
        [field.name]: field.required ? fieldSchema : fieldSchema.optional(),
      };
    }, {});

    return z.object(schemaFields);
  };

  const form = useForm({
    resolver: zodResolver(generateSchema()),
    defaultValues: initialData,
    mode: 'onChange',
  });

  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          form.setValue(key, [...value], { shouldValidate: true });
        } 
        else if (typeof value === 'object' && value !== null) {
          form.setValue(key, value, { shouldValidate: true });
        }
        else {
          form.setValue(key, value, { shouldValidate: true });
        }
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
    e.preventDefault();
    const isValid = await validateCurrentStep();
    if (isValid) {
      const currentValues = form.getValues();
      setCurrentStep(prev => prev + 1);
      
      Object.entries(currentValues).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          form.setValue(key, [...value], { shouldValidate: false });
        } else if (typeof value === 'object' && value !== null) {
          form.setValue(key, { ...value }, { shouldValidate: false });
        } else {
          form.setValue(key, value, { shouldValidate: false });
        }
      });
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentValues = form.getValues();
    setCurrentStep(prev => prev - 1);
    
    Object.entries(currentValues).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        form.setValue(key, [...value], { shouldValidate: false });
      } else if (typeof value === 'object' && value !== null) {
        form.setValue(key, { ...value }, { shouldValidate: false });
      } else {
        form.setValue(key, value, { shouldValidate: false });
      }
    });
  };

  const handleSubmit = async (data: any) => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      onSubmit(data);
    }
  };

  const renderField = (field: Field) => {
    const commonProps = {
      key: field.name,
      name: field.name,
      label: field.title,
      description: field.description,
      required: field.required,
      readonly: field.readonly,
    };

    switch (field.type) {
      case 'char':
        return <TextField {...commonProps} type="text" />;
      case 'text':
        return <TextareaField {...commonProps} />;
      case 'integer':
        return <NumberField {...commonProps} step={1} />;
      case 'float':
        return <NumberField {...commonProps} step={0.01} />;
      case 'monetary':
        return <MonetaryField {...commonProps} />;
      case 'boolean':
        return <CheckboxField {...commonProps} />;
      case 'selection':
        return <SelectField {...commonProps} options={field.options} />;
      case 'date':
        return <DateField {...commonProps} />;
      case 'datetime':
        return <DateTimeField {...commonProps} />;
      case 'binary':
        return <FileField {...commonProps} />;
      case 'image':
        return <ImageField {...commonProps} />;
      case 'html':
        return <TextareaField {...commonProps} />;
      case 'one2many':
        return <One2ManyField {...commonProps} relation={field.relation} inverse_field={field.inverse_field} />;
      case 'many2one':
        return <Many2OneField {...commonProps} relation={field.relation} optionsUrl={field.optionsUrl} renderOptions={field.renderOptions} />;
      case 'many2many':
        return <Many2ManyField {...commonProps} relation={field.relation} />;
      case 'tags':
        return <TagsField {...commonProps} options={field.options} />;
      case 'priority':
        return <PriorityField {...commonProps} levels={field.levels} />;
      case 'signature':
        return <SignatureField {...commonProps} />;
      case 'related':
        return <RelatedField {...commonProps} relation={field.relation} path={field.path} />;
      case 'lines':
        return <LinesField {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-auto relative transform transition-all">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">
              Complete all required information
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const hasValues = Object.values(form.getValues()).some(Boolean);
              hasValues ? setShowConfirmModal(true) : onCancel();
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {totalSteps > 1 && (
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span className="text-sm font-medium text-blue-600">
                {Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6">
            <div className="space-y-6">
              {fields[currentStep].map((field, index) => (
                <div
                  key={field.name}
                  className="transform transition-all duration-300 ease-out"
                  style={{
                    opacity: 1,
                    transform: 'translateY(0)',
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  {renderField(field)}
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              {isFirstStep ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </button>
              )}

              {isLastStep ? (
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4 transform transition-all">
            <div className="flex items-center space-x-4 text-amber-500 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Confirm Cancel</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel? All entered data will be lost and cannot be recovered.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}