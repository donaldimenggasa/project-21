import { useStore } from '~/store/zustand/store';
import { DynamicForm } from '~/components/form/DynamicForm';
import { FileText } from 'lucide-react';
import { useFetcher } from '@remix-run/react';
import { cn } from '~/lib/utils';
import { useCallback } from 'react';


interface CreateProjectAplikasi {
  onClose: () => void;
  editingId?: string | null;
  initialData?: any;
}

export function CreateProjectAplikasi({ onClose, editingId, initialData }: CreateProjectAplikasi) {
  const { createPage, updatePage } = useStore();
  const fetcher = useFetcher();

  const fields = [
    [
      {
        name: "x_studio_group",
        title: "Project Group",
        type: "many2one",
        relation: "project_groups",
        description: "Select the project group for this page",
        required: true,
        optionsUrl: "/developers/api/dropdown/project-categories",
        renderOptions: (data: any) => {
          console.log(data)
          return data.map((item: any) => ({
            value: item.id,
            label: item.x_name?.en_US,
            description: null
          }));
        }
      },
      {
        name: "pathname",
        title: "Page Path",
        type: "char" as const,
        description: "Enter a unique path for the page (e.g., my-page)",
        rules: {
          required: "Page path is required",
          min: 6,
        },
      },
      {
        name: "x_name",
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
    ]
  ];



  const handleSubmit = useCallback((data: any) => {
    console.log('BABI')
    if (editingId) {
      /*updatePage({
        id: editingId,
        ...data,
      });*/
    } else {

      fetcher.submit(data,
        {
          method: "POST",
          encType: "application/json",
        }
      );
      /*createPage({
        id: crypto.randomUUID(),
        ...data,
        content: '',
        createdAt: new Date().toISOString(),
      });*/
    }
    onClose();
  }, [editingId, createPage, updatePage, onClose, fetcher]);




  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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