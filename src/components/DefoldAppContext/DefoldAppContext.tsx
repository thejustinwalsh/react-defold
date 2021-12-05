import React, { useCallback, useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    [key: string]: {
      inbound: Array<{
        command: string, payload: Record<string, unknown>
      }>,
      outbound: Array<{
        command: string, payload: Record<string, unknown>
      }>,
      data: Record<string, unknown>,
    }
  }
}

interface DefoldAppContext {
  namespace: string,
  inbound: Array<{
    command: string, payload: Record<string, unknown>
  }>,
  outbound: Array<{
    command: string, payload: Record<string, unknown>
  }>,
  data: React.MutableRefObject<Record<string, unknown>>,
  onReceive: (command: string, payload: Record<string, unknown>) => void;
}

const DefoldAppContext = React.createContext<DefoldAppContext | undefined>(undefined);

function DefoldAppContextProvider({namespace, data, onReceive, children}: React.PropsWithChildren<{ 
  namespace: string,
  data: Record<string, unknown>
  onReceive?: (command: string, payload: Record<string, unknown>) => void;
}>) {
  const ref = useRef(data)
  const [context] = useState<DefoldAppContext>({
    namespace,
    inbound: [],
    outbound: [],
    data: ref,
    onReceive: onReceive ?? (() => {}),
  });

  // Receive messages from the Defold app
  useEffect(() => {
    let timer = -1;
    function messagePump() {
      context.inbound.forEach(({ command, payload }) => {
        context.onReceive(command, payload);
      });
      timer = window.requestAnimationFrame(messagePump)
    };
    messagePump();

    return() => window.cancelAnimationFrame(timer);
  }, []);

   // Store the context in the window object for access from Defold
   useEffect(() => {
    window[context.namespace] = {
      inbound: context.inbound,
      outbound: context.outbound,
      data: context.data.current,
    };
  }, [context]);
  
  return <DefoldAppContext.Provider value={context}>{children}</DefoldAppContext.Provider>;
}

function useDefoldAppContext() {
  const context = React.useContext(DefoldAppContext);

  // Send a command to the Defold app
  const send = useCallback((command: string, payload: Record<string, unknown>) => {
    if (context) context.outbound.push({ command, payload });
  }, [context]);
  
  if (context === undefined) throw new Error('useDefoldAppContext must be used within a useDefoldAppContext')
  return { data: context.data.current, send };
}

export { DefoldAppContextProvider, useDefoldAppContext };