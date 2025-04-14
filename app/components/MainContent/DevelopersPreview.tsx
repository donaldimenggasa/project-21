import { useStore } from '~/store/zustand/store';
import { DynamicComponentPreview } from './DynamicComponentPreview';



const DevelopersPreview = () => {
  const allComponent = useStore.getState().component;
  const rootComponent = Object.values(allComponent).find(c => c.parentId === null);

  if (!rootComponent) {
    return ( <div className="flex flex-1 h-full overflow-hidden bg-slate-100 relative custom-scrollbar items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Content</h2>
        <p className="text-gray-500 dark:text-gray-400">
          This page has no content. Add components to get started.
        </p>
      </div>
    </div>);
  }

  return (
    <div className="flex-1 h-full overflow-hidden bg-slate-100 relative custom-scrollbar">
      <DynamicComponentPreview component={rootComponent} />
    </div>
  );
};


export default DevelopersPreview;