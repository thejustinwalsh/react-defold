import React, { memo, useCallback, useEffect, useRef, useState } from 'react'

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
      in: (msg: string) => void,
      out: () => string,
      tick: () => void,
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

type DefoldAppContextProviderProps = React.PropsWithChildren<{ 
  /** The namespace of the app context stored on the window object. */
  namespace: string,
  /** Data to store on the window object under the namespace */
  data: Record<string, unknown>,
}>

const DefoldAppContext = React.createContext<DefoldAppContext | undefined>(undefined);

const DefoldAppContextProvider: React.FC<DefoldAppContextProviderProps> = memo(
  function DefoldAppContextProvider({namespace, data, children}) {
    const ref = useRef(data)
    const [context] = useState<DefoldAppContext>({
      namespace,
      inbound: [],
      outbound: [],
      data: ref,
      onReceive: () => {},
    });

    // Store the context in the window object for access from Defold
    useEffect(() => {
      window[context.namespace] = {
        inbound: context.inbound,
        outbound: context.outbound,
        data: context.data.current,
        in: (msg: string) => context.inbound.push(JSON.parse(msg)),
        out: () => {
          const next = context.outbound.shift();
          return next ? JSON.stringify(next) : "";
        },
        tick: () => {
          context.inbound.forEach(({command, payload}) => context.onReceive(command, payload));
          context.inbound.splice(0, context.inbound.length);
        }
      };
    }, [context]);
    
    return <DefoldAppContext.Provider value={context}>{children}</DefoldAppContext.Provider>;
  }
);

const useDefoldAppContext = ({ onReceive }: { onReceive?: (command: string, payload: Record<string, unknown>) => void }) => {
  const context = React.useContext(DefoldAppContext);

  useEffect(() => {
    if (onReceive && context) context.onReceive = onReceive;
  }, [context, onReceive]);

  const send = useCallback((command: string, payload: Record<string, unknown>) => {
    if (context) context.outbound.push({ command, payload });
  }, [context]);

  
  if (context === undefined) throw new Error('useDefoldAppContext must be used within a useDefoldAppContext')
  return { data: context.data.current, send };
}

export { DefoldAppContextProvider, useDefoldAppContext };
export type { DefoldAppContextProviderProps };
