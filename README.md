# react-defold
> React component for Defold

## React Components

### DefoldApp
Create a canvas, load the dmloader script, and instantiate the defold application
```jsx
import { DefoldApp } from './DefoldApp';

<DefoldApp root="./app/js-web/react-defold" app="reactdefold" width={640} height={360} />
```
- `root` - The path to the bundled Defold html5 project. This path should include dmloader, the wasm, and the archive for your application.
- `app` - The name of the application to load from the `root` path. i.e. "reactdefold.wasm"
- `width` - The width of the canvas in pixels
- `height` - The height of the canvas in pixels
- `fullscreen` - Toggle fullscreen mode

### DefoldAppContext
Creates a context for datastorage and bidirectional message passing between React and Defold

#### DefoldAppContextProvider
```jsx
import { DefoldAppContextProvider } from './DefoldAppContext';

<DefoldAppContextProvider namespace="DefoldApp" data={{}}>
```
- `namespace` - The namespace to store the data in on the `window` object
- `data` - Any data that you would like to easily make available to the Defold application

#### useDefoldAppContext
```jsx
import { useDefoldAppContext } from './DefoldAppContext';

const { send, data } = useDefoldAppContext({ onReceive });
```
- `send`: `(command, payload) => void` - Send a command and custom payload to the Defold application
- `onReceive`: `(command, payload) => void` - Callback function that receives a command and payload from the Defold application
- `data` - A Ref to the data object stored in the window on the namespace provided to the context

### Example
```jsx
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

    useEffect(() => send('tint', color), [send, color]);

    return <DefoldApp root="./app/js-web/react-defold" app="reactdefold" width={640} height={360} />;
  }

  return (
    <DefoldAppContextProvider namespace="DefoldApp" data={{}}>
      <DefoldFixtureApp />
    </DefoldAppContextProvider>
  );
}
```

## Defold

### Overview
Inbound and outbound messages are stored in a queue and need to be retrieved from Defold in order to setup bidirectional communication.
Messages are passed as [JSON](https://github.com/rxi/json.lua) encoded strings, and you will need a JSON module like [rxi/json.lua](https://github.com/rxi/json.lua) in your project to decode the payload params of the commands being sent.

The basic flow of message passing:
- Check to see if the namespace is available using `html5.run("window.DefoldApp")` where `DefoldApp` is the namespace used in the React app
- Poll for a new message that is outbound from the React app with `html5.run("window.DefoldApp.out()");`
- Send any new messages in response to inputs from your Defold application with `html5.run("window.DefoldApp.in('" .. JSON.encode(command) .. "')")`
- Tick the React app message queue with a call to `html5.run("window.DefoldApp.tick()")`

### Example
```lua
local JSON = require("modules.json")

function init(self)
  self.has_context = html5 and html5.run("window.DefoldApp")
  if html5 then print("react-defold --", sys.get_sys_info().system_name, html5.run("window.DefoldApp")) end
  msg.post(".", "acquire_input_focus")
  msg.post("@render:", "use_fixed_fit_projection", { near = -1, far = 1 })
end

function update(self, dt)
  if (self.has_context) then
    local msg = {}
    local raw = html5.run("window.DefoldApp.out()");
    if raw ~= '' then msg = JSON.decode(raw) end
    if msg.command == 'tint' then
      go.set("#background", "tint", vmath.vector4(msg.payload.r, msg.payload.g, msg.payload.b, 1))
    end

    html5.run("window.DefoldApp.tick()")
  end
end

function on_input(self, action_id, action)
  if action_id == hash("touch") and action.pressed then
    if (self.has_context) then
      local command = { command = "touch", payload = { x = action.x, y = action.y } };
      html5.run("window.DefoldApp.in('" .. JSON.encode(command) .. "')")
    end
  end
end

```



