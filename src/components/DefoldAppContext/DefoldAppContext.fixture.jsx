import React from 'react';
import { DefoldApp } from '../DefoldApp';
import { DefoldAppContext, useDefoldAppContext } from '../DefoldAppContext';

export default () => {
  function DefoldFixtureApp({ color }) {
    const onReceive = useCallback((command, payload) => {
      if (command === 'touch') console.log('Touch', payload);
    }, []);

    const { send, data } = useDefoldAppContext({ onReceive });

    useEffect(() => send('tint', color), [send, color])

    return <DefoldApp root="/app/js-web/react-defold" app="reactdefold" width={640} height={360} />;
  }

  return (
    <>
      <DefoldAppContext namespace="DefoldApp" data={{}}>
        <DefoldFixtureApp color={{ r: Math.random(), g: Math.random(), b: Math.random() }} />
      </DefoldAppContext>
    </>
  );
}