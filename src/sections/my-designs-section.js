import React from 'react';
import { observer } from 'mobx-react-lite';
import {
  Button,
  Card,
  Menu,
  MenuItem,
  Position,
  Spinner,
  Popover,
} from '@blueprintjs/core';

import { CloudWarning } from '../cloud-warning';

import { SectionTab } from 'polotno/side-panel';
import FaFolder from '@meronex/icons/fa/FaFolder';
import { useProject } from '../project';
import * as api from '../api';

const DesignCard = observer(({ design, store, onDelete }) => {
  const [loading, setLoading] = React.useState(false);
  const [previewURL, setPreviewURL] = React.useState(design.previewURL);

  React.useEffect(() => {
    const load = async () => {
      const url = await api.getPreview({ id: design.id });
      setPreviewURL(url);
    };
    load();
  }, []);

  const handleSelect = async () => {
    setLoading(true);
    window.project.loadById(design.id);
    setLoading(false);
  };

  return (
    <Card
      style={{ margin: '3px', padding: '0px', position: 'relative' }}
      interactive
      onClick={() => {
        handleSelect();
      }}
    >
      <img src={previewURL} style={{ width: '100%' }} />
      <div
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          padding: '3px',
        }}
      >
        {design.name}
      </div>
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Spinner />
        </div>
      )}
      <div
        style={{ position: 'absolute', top: '5px', right: '5px' }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Popover
          content={
            <Menu>
              <MenuItem
                icon="document-open"
                text="Open"
                onClick={() => {
                  handleSelect();
                }}
              />
              {/* <MenuItem
                icon="duplicate"
                text="Copy"
                onClick={async () => {
                  handleCopy();
                }}
              /> */}
              <MenuItem
                icon="trash"
                text="Delete"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete it?')) {
                    onDelete({ id: design.id });
                  }
                }}
              />
            </Menu>
          }
          position={Position.BOTTOM}
        >
          <Button icon="more" />
        </Popover>
      </div>
    </Card>
  );
});

export const MyDesignsPanel = observer(({ store }) => {
  const project = useProject();
  const [designsLoadings, setDesignsLoading] = React.useState(false);
  const [designs, setDesigns] = React.useState([]);

  const loadDesigns = async () => {
    setDesignsLoading(true);
    const list = await api.listDesigns();
    setDesigns(list);
    setDesignsLoading(false);
  };

  const handleProjectDelete = ({ id }) => {
    setDesigns(designs.filter((design) => design.id !== id));
    api.deleteDesign({ id });
  };

  React.useEffect(() => {
    loadDesigns();
  }, [project.cloudEnabled, project.designsLength]);

  const half1 = [];
  const half2 = [];

  designs.forEach((design, index) => {
    if (index % 2 === 0) {
      half1.push(design);
    } else {
      half2.push(design);
    }
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Button
        fill
        intent="primary"
        onClick={async () => {
          project.createNewDesign();
        }}
      >
        Create new design
      </Button>
      {!designsLoadings && !designs.length && (
        <div style={{ paddingTop: '20px', textAlign: 'center', opacity: 0.6 }}>
          You have no saved designs yet...
        </div>
      )}
      {!project.cloudEnabled && (
        <div style={{ padding: '15px' }}>
          <CloudWarning />
        </div>
      )}
      {project.cloudEnabled && (
        <div style={{ padding: '10px', textAlign: 'center' }}>
          Cloud data saving powered by{' '}
          <a href="https://puter.com" target="_blank">
            Puter.com
          </a>
        </div>
      )}
      {designsLoadings && (
        <div style={{ padding: '30px' }}>
          <Spinner />
        </div>
      )}
      <div
        style={{
          display: 'flex',
          paddingTop: '5px',
          height: '100%',
          overflow: 'auto',
        }}
      >
        <div style={{ width: '50%' }}>
          {half1.map((design) => (
            <DesignCard
              design={design}
              key={design.id}
              store={store}
              onDelete={handleProjectDelete}
            />
          ))}
        </div>
        <div style={{ width: '50%' }}>
          {half2.map((design) => (
            <DesignCard
              design={design}
              key={design.id}
              store={store}
              onDelete={handleProjectDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

// define the new custom section
export const MyDesignsSection = {
  name: 'my-designs',
  Tab: (props) => (
    <SectionTab name="My Designs" {...props}>
      <FaFolder />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: MyDesignsPanel,
};
