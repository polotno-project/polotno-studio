import React from 'react';
import Toolbar from 'polotno/toolbar/toolbar';
import ZoomButtons from 'polotno/toolbar/zoom-buttons';
import SidePanel from 'polotno/side-panel/side-panel';
import Workspace from 'polotno/canvas/workspace';

import Topbar from './topbar';

const App = ({ store }) => {
  return (
    <React.Fragment>
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
    </React.Fragment>
  );
};

export default App;
