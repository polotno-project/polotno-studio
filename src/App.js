import React from 'react';
import Toolbar from 'polotno/toolbar/toolbar';
import ZoomButtons from 'polotno/toolbar/zoom-buttons';
import SidePanel from 'polotno/side-panel/side-panel';
import Workspace from 'polotno/canvas/workspace';

const App = ({ store }) => {
  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
      }}
    >
      <div style={{ width: '300px', height: '100%', display: 'flex' }}>
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
  );
};

export default App;
