import React, { useCallback, useEffect, useState} from 'react';
import { DefoldApp } from '../DefoldApp';
import { DefoldAppContextProvider, useDefoldAppContext } from './DefoldAppContext';

export default () => {
  function DefoldFixtureApp({ color }) {
    const [color, setColor] = useState({ r: Math.random(), g: Math.random(), b: Math.random() });
    const onReceive = useCallback((command, payload) => {
      if (command === 'touch') {
        setColor({ r: Math.random(), g: Math.random(), b: Math.random() });
      }
    }, []);

    const { send, data } = useDefoldAppContext({ onReceive });

    useEffect(() => {
      send('tint', color);
      console.log('tint', color);
    }, [send, color])

    return <DefoldApp root="./app/js-web/react-defold" app="reactdefold" width={640} height={360} />;
  }

  return (
    <DefoldAppContextProvider namespace="DefoldApp" data={{}}>
      <DefoldFixtureApp />
    </DefoldAppContextProvider>
  );
}