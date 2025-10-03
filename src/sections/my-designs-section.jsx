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
import { DocumentOpen, Trash, More } from '@blueprintjs/icons';

import { CloudWarning } from '../cloud-warning';

import { SectionTab } from 'polotno/side-panel';
import { useProject } from '../project';
import * as api from '../api';

const FolderIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <path
        d="M19.5 21H4.5C4.1023 20.9996 3.72101 20.8414 3.4398 20.5602C3.15859 20.279 3.00042 19.8977 3 19.5V8.25C3.00042 7.8523 3.15859 7.47101 3.4398 7.1898C3.72101 6.90859 4.1023 6.75042 4.5 6.75H8.74988C9.07451 6.75053 9.39031 6.85573 9.6504 7.05L12.2501 9H19.5C19.8977 9.00042 20.279 9.15859 20.5602 9.4398C20.8414 9.72101 20.9996 10.1023 21 10.5V19.5C20.9996 19.8977 20.8414 20.279 20.5602 20.5602C20.279 20.8414 19.8977 20.9996 19.5 21ZM8.74988 8.25H4.49887L4.5 19.5H19.5V10.5H11.7499L8.74988 8.25Z"
        fill="white"
      />
      <path
        d="M21 6.75H13.2499L10.2499 4.5H4.5V3H10.2499C10.5745 3.00053 10.8903 3.10573 11.1504 3.3L13.7501 5.25H21V6.75Z"
        fill="white"
      />
    </g>
  </svg>
);

const DesignCard = observer(({ design, store, onDelete }) => {
  const [loading, setLoading] = React.useState(false);
  const [previewURL, setPreviewURL] = React.useState(design.previewURL);

  React.useEffect(() => {
    const load = async () => {
      try {
        const url = await api.getPreview({ id: design.id });
        setPreviewURL(url);
      } catch (e) {
        console.error(e);
      }
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
      <img src={previewURL} style={{ width: '100%', minHeight: '100px' }} />
      <div
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          padding: '3px',
        }}
      >
        {design.name || 'Untitled'}
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
                icon={<DocumentOpen />}
                text="Open"
                onClick={() => {
                  handleSelect();
                }}
              />
              <MenuItem
                icon={<Trash />}
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
          <Button icon={<More />} />
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
          await project.createNewDesign();
          loadDesigns();
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
      <FolderIcon />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: MyDesignsPanel,
};
