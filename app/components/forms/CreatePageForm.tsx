import { useStore } from '~/store/zustand/store';
import { DynamicForm } from '~/components/form/DynamicForm';
import { Layout, FileText } from 'lucide-react';
import { cn } from '~/lib/utils';

interface CreatePageFormProps {
  onClose: () => void;
  editingId?: string | null;
  initialData?: any;
}

export function CreatePageForm({ onClose, editingId, initialData }: CreatePageFormProps) {
  const { createPage, updatePage } = useStore();

  const fields = [
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
        icon: Layout,
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

  const handleSubmit = (data: any) => {
    if (editingId) {
      updatePage({
        id: editingId,
        ...data,
      });
    } else {
      createPage({
        id: crypto.randomUUID(),
        ...data,
        content: '',
        createdAt: new Date().toISOString(),
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className={cn(
        "bg-card rounded-xl shadow-xl border border-border",
        "w-full max-w-2xl overflow-hidden"
      )}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {editingId ? "Edit Page" : "Create New Page"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors text-secondary hover:text-foreground"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <DynamicForm
          id={editingId || undefined}
          fields={fields}
          onSubmit={handleSubmit}
          onCancel={onClose}
          title=""
          initialData={initialData}
        />
      </div>
    </div>
  );
}