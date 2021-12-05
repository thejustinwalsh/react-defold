import React, { useEffect, useState } from "react";

export default function useEmbedScript(script: string, ref?: React.MutableRefObject<null>, external: boolean = true, timeout = 5000) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleReadyStateChange = () => setLoading(false);
  useEffect(() => {
    const loader = document.createElement('script') as HTMLScriptElement & { 
      onreadystatechange: () => void
    };

    loader.type = 'text/javascript';
    loader.async = true;
    loader.src = script;
    loader.onload = handleReadyStateChange;
    
    const parent = ref && ref.current ? ref.current : document.body;
    const scripts = Array.from(parent.getElementsByTagName('script'));
    const exists = scripts.find(s => s.src === script);
    if (!exists) parent.appendChild(loader);

    const errorTimer = setTimeout(() => {
      setError(true);
    }, timeout);

    return () => {
      loader.onload = null;
      loader.onreadystatechange = () => void 0;
      clearTimeout(errorTimer);
      document.body.removeChild(loader);
    };
  }, []);

  return { loading, error, complete: !loading && !error };
}