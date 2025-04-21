import { LowcoderAppView } from "lowcoder-sdk";
import "lowcoder-sdk/dist/style.css";
import { useRef } from "react";

function LowcoderAppWrapper(props) {
  const { appId } = props;
  const ref = useRef(null);

  


  return (
      <div className=" h-full w-full" >
        
     
      <LowcoderAppView
        ref={ref}
        appId={appId}
        baseUrl={`${window.location.origin}/aplikasi/internal`}
        onModuleEventTriggered={(e) => {
          console.info("trigger:", e);
        }}
        onModuleOutputChange={(data) => {
          console.info("output:", data);
        }}
      />
         
      </div>
     
   
  )
}

export default LowcoderAppWrapper;