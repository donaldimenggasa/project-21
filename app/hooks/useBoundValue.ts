import { useMemo } from 'react';
import { interpolateCode, helperFuncs } from '~/lib/evaluate';
import { useStore } from '~/store/zustand/store';
import { useShallow } from 'zustand/react/shallow';






export const useBoundValue = (componentId : string, propsName : string) => {
const currentPropsValue = useStore(useShallow((state) => state.component[componentId].props[propsName]));

  return useMemo(()=>{
    if (!currentPropsValue) return;
    if (typeof currentPropsValue === 'object' && !currentPropsValue.bindable) {
        return currentPropsValue.value !== null ? currentPropsValue.value : currentPropsValue.defaultValue;
    }else{
      const bindValue = typeof currentPropsValue === 'object' ? currentPropsValue.bindValue || '' : '';
      if (!bindValue.match(/{{.*}}/)) {
        return bindValue;
      }else{

        const scope = {
          ...helperFuncs
        };
        const result = interpolateCode(bindValue, scope);

        console.log(result);
        return result
      }
    }


   // console.log('useBoundValue', itemProps);
    return null
  },[currentPropsValue, componentId, propsName])


};