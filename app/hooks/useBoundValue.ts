import { useMemo } from 'react';
import { createTemplateEvaluator, containInterpolation, covertPureJavaScript, helperFuncs } from '~/lib/evaluate';
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
      if (!containInterpolation(bindValue)) {
        return bindValue;
      }else{
     
        let result = null;
        try{
          const scope = {
            ...helperFuncs
          };

          const cleanCode = covertPureJavaScript(bindValue);
          const evaluator = createTemplateEvaluator(bindValue);
          result = evaluator(
            cleanCode,
            scope,
            'FunctionTemplate'
          );
        }catch(e){
          console.log('Error evaluating bindValue:', e);
        }finally{
          console.log('RESULT EXECUTE', result);
          console.log(result)
          console.log(currentPropsValue)
          return result;
        }
      }
    }


   // console.log('useBoundValue', itemProps);
    return null
  },[currentPropsValue, componentId, propsName])


};