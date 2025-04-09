import { useStore } from '~/store/zustand/store';
import { DynamicComponent } from './DynamicComponent';
import { ComponentOverlay } from './ComponentOverlay';



const MainContent = () => {
  const selectedPage = useStore(state => state.selectedPage);
  const allComponent = useStore.getState().component;
  const rootComponent = Object.values(allComponent).find(
    c => c.parentId === null && c.pageId === selectedPage
  );

  if (!rootComponent) {
    return ( <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Content</h2>
        <p className="text-gray-500 dark:text-gray-400">
          This page has no content. Add components to get started.
        </p>
      </div>
    </div>);
  }

  return (
    <div id="main-content-container" className="flex-1 h-full overflow-hidden bg-slate-100 relative custom-scrollbar">
      <DynamicComponent component={rootComponent} />
      <ComponentOverlay />
    </div>
  );
};


export default MainContent;