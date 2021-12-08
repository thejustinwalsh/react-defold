import React, { memo, useEffect, useRef, useState } from "react";
import { useEmbedScript} from "../../hooks/useEmbedScript";

declare global {
  interface Window {
    FileLoader?: any;
    EngineLoader?: EngineLoader;
    GameArchiveLoader?: any;
    Progress?: any;
    CanvasInput?: any;
    Module?: Module;
  }

  interface EngineLoader {
    load: (id: string, root: string) => void;
  }

  interface Module {
    calledRun: boolean;
    pauseMainLoop: () => void;
    runApp: (id: string, params: unknown) => void;
    [key: string]: any;
  }
}

interface DefoldAppProps {
  /** The id of the application (unique) */
  id?: string;
  /** The root path to the compiled defold app (parent directory) */
  root: string;
  /** The name od the defold app */
  app: string;
  /** Width in pixels of the defold app canvas */
  width: number;
  /** Height in pixels of the defold app canvas */
  height: number;
  /** Toggle fullscreen */
  fullscreen?: boolean;
}

let UniqueCanvasId = 0;

const DefoldApp: React.FC<DefoldAppProps> = memo(
  function DefoldApp({ root, app, width, height, id = "canvas", fullscreen = false }) {
    const canvas = useRef<HTMLCanvasElement>(null);
    const parent = useRef<HTMLDivElement>(null);
    const { loading, error, complete } = useEmbedScript(`${root}/dmloader.js`);

    useEffect(() => {
      if (!complete) return;

      // Load the engine and loop until the engine is ready
      function loadApp() {
        const Module = window.Module;
        if (Module && window.EngineLoader) {
          const extra_params = {
              archive_location_filter: function( path: string ) {
                  return (`${root}/archive/${path}`);
              },
              engine_arguments: [],
              custom_heap_size: 268435456,
              disable_context_menu: true
          }

          Module['onRuntimeInitialized'] = function() {
              Module.runApp(id, extra_params);
          };

          Module["locateFile"] = function(path: string, scriptDirectory: string)
          {
              // dmengine*.wasm is hardcoded in the built JS loader for WASM,
              // we need to replace it here with the correct project name.
              if (path == "dmengine.wasm" || path == "dmengine_release.wasm" || path == "dmengine_headless.wasm") {
                  path = `${app}.wasm`;
              }
              return scriptDirectory + path;
          };
          window.EngineLoader?.load(id, `${root}/${app}`);
        } else {
          setTimeout(loadApp, 100);
        }
      }

      // Inject Styles for progress loader
      const styles = document.createElement("style");
      styles.innerHTML = `
        canvas:focus, canvas:active {
          outline: none;
          border: 0;
          ie-dummy: expression(this.hideFocus=true);
          -moz-outline-style: none;
        }
      
        #${id}-container, #defold-progress {
          -webkit-tap-highlight-color: rgba(0,0,0,0);
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      
        .canvas-app-progress {
          position: absolute;
          background-color: #d1dbeb;
          height: 6px;
          margin-top: -6px;
          width: 100%;
        }
      
        .canvas-app-progress-bar {
          font-size: 12px;
          height: 6px;
          color: rgb(255, 255, 255);
          background-color: #1a72eb;
          text-align: center;
          line-height: 20px;
        }
      `;
      parent.current?.appendChild(styles);

      // Load the app
      loadApp();

      return((): void => {
        if (!window.Module) return;
      });
    }, [id, complete]);
    
    return (
      <div ref={parent} id={`${id}-container`} style={{ position: 'relative', width: `${width}px`, height: `${height}px` }}>
        <canvas ref={canvas} id={id} width={width} height={height} style={{
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
          backgroundSize: '70%',
          backgroundImage: `url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='300px' height='64px' viewBox='-2467.5 2469 300 64' style='enable-background:new -2467.5 2469 300 64;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%2315244A;%7D .st1%7Bfill:url(%23SVGID_1_);%7D .st2%7Bfill:url(%23SVGID_2_);%7D%0A%3C/style%3E%3Ctitle%3Edefold-logo-html5-splash%3C/title%3E%3Cpolygon class='st0' points='-2177,2482.9 -2175.5,2482.9 -2175.5,2486.7 -2174.4,2486.7 -2174.4,2482.9 -2173.2,2482.9 -2173.2,2481.9 -2177,2481.9 '/%3E%3Cpolygon class='st0' points='-2169.8,2484.1 -2171,2482.1 -2172.1,2482.1 -2172.1,2486.7 -2171,2486.7 -2171,2483.5 -2169.7,2485.6 -2169.7,2485.6 -2168.5,2483.5 -2168.5,2486.7 -2167.5,2486.7 -2167.5,2482.1 -2168.6,2482.1 '/%3E%3Cpath class='st0' d='M-2376,2482h-13.8v38h13.6c6.6,0,12.2-1.9,16.1-5.5c3.8-3.5,5.8-8.5,5.7-13.7v-0.1 C-2354.5,2489.3-2362.9,2482-2376,2482z M-2364,2501.2c0,6.7-4.5,10.9-11.8,10.9h-4.7v-22h4.7c7.3,0,11.8,4.2,11.8,10.9 L-2364,2501.2z'/%3E%3Cpolygon class='st0' points='-2340.9,2505 -2325.1,2505 -2325.1,2497.4 -2340.9,2497.4 -2340.9,2489.6 -2322.4,2489.6 -2322.4,2481.9 -2350.1,2481.9 -2350.1,2520 -2322.2,2520 -2322.2,2512.4 -2340.9,2512.4 '/%3E%3Cpolygon class='st0' points='-2317.1,2481.9 -2317.1,2520 -2307.9,2520 -2307.9,2505.9 -2293,2505.9 -2293,2498.4 -2307.9,2498.4 -2307.9,2489.9 -2289.6,2489.9 -2289.6,2481.9 '/%3E%3Cpolygon class='st0' points='-2233,2482.1 -2242.2,2482.1 -2242.2,2520 -2216.3,2520 -2216.3,2512.2 -2233,2512.2 '/%3E%3Cpath class='st0' d='M-2197.1,2482h-13.7v38h13.5c6.7,0,12.2-1.9,16.1-5.5c3.8-3.5,5.8-8.5,5.7-13.7v-0.1 C-2175.5,2489.3-2184,2482-2197.1,2482z M-2185.1,2501.2c0,6.7-4.5,10.9-11.8,10.9h-4.7v-22h4.7c7.3,0,11.8,4.2,11.8,10.9V2501.2z' /%3E%3Cpath class='st0' d='M-2267.5,2481.7c-10.8,0-19.6,8.8-19.6,19.7c0,10.8,8.8,19.6,19.7,19.6c10.8,0,19.6-8.8,19.6-19.6l0,0 C-2247.8,2490.5-2256.6,2481.7-2267.5,2481.7C-2267.5,2481.7-2267.5,2481.7-2267.5,2481.7z M-2258,2507.9l-8.8,5.1 c-0.5,0.3-1.2,0.3-1.8,0l-8.8-5.1c-0.5-0.3-0.9-0.9-0.9-1.5v-10.2c0-0.6,0.3-1.2,0.9-1.5l8.8-5.1c0.5-0.3,1.2-0.3,1.8,0l8.8,5.1 c0.5,0.3,0.9,0.9,0.9,1.5v10.2C-2257.1,2507-2257.4,2507.6-2258,2507.9z'/%3E%3Cpath class='st0' d='M-2423.2,2494.6l-11.1,6.4l-11.1-6.4l11.1-6.4L-2423.2,2494.6z M-2412.1,2501v12.8l11.1-6.4L-2412.1,2501z M-2467.5,2507.4l11.1,6.4V2501L-2467.5,2507.4z M-2434.3,2526.6l11.1,6.4l11.1-6.4l-11.1-6.4l11.1-6.4l-11.1-6.4l-11.1,6.4 l-11.1-6.4l-11.1,6.4l11.1,6.4l-11.1,6.4l11.1,6.4L-2434.3,2526.6z'/%3E%3ClinearGradient id='SVGID_1_' gradientUnits='userSpaceOnUse' x1='-2451.2178' y1='2525.4604' x2='-2406.2178' y2='2499.6304' gradientTransform='matrix(1 0 0 -1 0 5004)'%3E%3Cstop offset='0' style='stop-color:%231C68EC'/%3E%3Cstop offset='1' style='stop-color:%2300E9DF'/%3E%3C/linearGradient%3E%3Cpath class='st1' d='M-2412.1,2513.8v12.8l-11.1-6.4L-2412.1,2513.8z M-2434.3,2513.8V2501l-11.1-6.4v12.8L-2434.3,2513.8z M-2445.4,2469v12.8l11.1-6.4L-2445.4,2469z M-2412.1,2488.2L-2412.1,2488.2 M-2423.2,2507.4l11.1,6.4V2501l11.1,6.4v-12.8 l-11.1-6.4v-12.8l0,0l-11.1-6.4v12.8l-11.1-6.4v12.8l11.1,6.4V2507.4z'/%3E%3ClinearGradient id='SVGID_2_' gradientUnits='userSpaceOnUse' x1='-2465.9385' y1='2521.2493' x2='-2423.5085' y2='2496.7893' gradientTransform='matrix(1 0 0 -1 0 5004)'%3E%3Cstop offset='0' style='stop-color:%23FF3C2A'/%3E%3Cstop offset='1' style='stop-color:%23FFD215'/%3E%3C/linearGradient%3E%3Cpath class='st2' d='M-2434.3,2513.8V2501l11.1-6.4v12.8L-2434.3,2513.8z M-2434.3,2475.4l11.1,6.4V2469L-2434.3,2475.4z M-2456.5,2488.2L-2456.5,2488.2 M-2445.4,2494.6l11.1-6.4v-12.8l-11.1,6.4V2469l-11.1,6.4l0,0v12.8l-11.1,6.4v12.8l11.1-6.4v12.8 l11.1-6.4V2494.6z M-2456.5,2513.8v12.8l11.1-6.4L-2456.5,2513.8z'/%3E%3C/svg%3E%0A")`,
        }}></canvas>
      </div>
    )
  }
);

export { DefoldApp };
export type { DefoldAppProps };
