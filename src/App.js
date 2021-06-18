import React from 'react';
import Toolbar from 'polotno/toolbar/toolbar';
import ZoomButtons from 'polotno/toolbar/zoom-buttons';
import SidePanel from 'polotno/side-panel/side-panel';
import Workspace from 'polotno/canvas/workspace';

import Topbar from './topbar';
import { loadJSONFile } from './file';

const App = ({ store }) => {
  return (
    <div
      style={{ width: '100vw', height: '100vh' }}
      onDrop={(ev) => {
        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault();

        if (ev.dataTransfer.items) {
          // Use DataTransferItemList interface to access the file(s)
          for (let i = 0; i < ev.dataTransfer.items.length; i++) {
            // If dropped items aren't files, reject them
            if (ev.dataTransfer.items[i].kind === 'file') {
              const file = ev.dataTransfer.items[i].getAsFile();
              loadJSONFile(file, store);
            }
          }
        } else {
          // Use DataTransfer interface to access the file(s)
          for (let i = 0; i < ev.dataTransfer.files.length; i++) {
            loadJSONFile(ev.dataTransfer.files[i], store);
          }
        }
      }}
    >
      <Topbar store={store} />
      <div
        style={{
          display: 'flex',
          height: 'calc(100% - 50px)',
          width: '100%',
          backgroundColor: '#30404d',
        }}
      >
        <div style={{ width: '400px', height: '100%', display: 'flex' }}>
          <SidePanel store={store} />
        </div>
        <div
          style={{
            display: 'flex',
            height: '100%',
            margin: 'auto',
            flex: 1,
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <Toolbar store={store} />
          <Workspace store={store} />
          <ZoomButtons store={store} />
        </div>
      </div>
    </div>
  );
};

export default App;
