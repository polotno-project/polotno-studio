import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Button,
  Card,
  Menu,
  MenuItem,
  Position,
  Spinner,
} from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';

import { SectionTab } from 'polotno/side-panel';
import FaFolder from '@meronex/icons/fa/FaFolder';
import * as api from '../api';

import { useProject } from '../project';

import { SubscribeButton } from '../subscribe-button';

import { useSubscription } from '../subscription-context';

const DesignCard = observer(({ design, project, onDelete }) => {
  const [loading, setLoading] = React.useState(false);
  const handleSelect = async () => {
    setLoading(true);
    await project.loadById(design.id);
    project.store.openSidePanel('photos');
    setLoading(false);
  };
  const handleCopy = async () => {
    setLoading(true);
    if (project.id !== design.id) {
      await project.loadById(design.id);
    }
    await project.duplicate();
    project.store.openSidePanel('photos');
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
      <img src={design.preview} style={{ width: '100%' }} />
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
        <Popover2
          content={
            <Menu>
              <MenuItem
                icon="document-open"
                text="Open"
                onClick={() => {
                  handleSelect();
                }}
              />
              <MenuItem
                icon="duplicate"
                text="Copy"
                onClick={async () => {
                  handleCopy();
                }}
              />
              <MenuItem
                icon="trash"
                text="Delete"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete it?')) {
                    api.deleteDesign({
                      id: design.design_id,
                      authToken: project.authToken,
                    });
                    onDelete(design.design_id);
                  }
                }}
              />
            </Menu>
          }
          position={Position.BOTTOM}
        >
          <Button icon="more" />
        </Popover2>
      </div>
    </Card>
  );
});

export const MyDesignsPanel = observer(({ store }) => {
  const {
    isAuthenticated,
    isLoading,
    loginWithPopup,
    getAccessTokenSilently,
    user,
    logout,
  } = useAuth0();

  const project = useProject();

  const [designsLoadings, setDesignsLoading] = React.useState(false);
  const [designs, setDesigns] = React.useState([]);
  const { subscription, subscriptionLoading } = useSubscription();

  const loadProjects = async () => {
    setDesignsLoading(true);
    const accessToken = await getAccessTokenSilently({});

    const res = await api.listDesigns({ accessToken });
    setDesigns(res.data);
    setDesignsLoading(false);
  };

  const handleProjectDelete = (id) => {
    setDesigns(designs.filter((design) => design.design_id !== id));
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated, isLoading]);

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
    <div style={{ height: '100%' }}>
      {!subscriptionLoading && !subscription && (
        <div>
          <div style={{ paddingBottom: '10px' }}>
            Cloud storage is experimental and available only for Polotno Studio
            supporters.
          </div>
          <SubscribeButton fill />
        </div>
      )}

      {designsLoadings || (isLoading && <div>Loading...</div>)}
      {isAuthenticated &&
        !designsLoadings &&
        !designs.length &&
        subscription && <div>No designs yet</div>}
      {designsLoadings && (
        <div style={{ padding: '30px' }}>
          <Spinner />
        </div>
      )}
      {!isLoading && isAuthenticated && (
        <div style={{ display: 'flex', paddingTop: '5px' }}>
          <div style={{ width: '50%' }}>
            {half1.map((design) => (
              <DesignCard
                design={design}
                key={design.design_id}
                store={store}
                project={project}
                onDelete={handleProjectDelete}
              />
            ))}
          </div>
          <div style={{ width: '50%' }}>
            {half2.map((design) => (
              <DesignCard
                design={design}
                key={design.design_id}
                store={store}
                project={project}
                onDelete={handleProjectDelete}
              />
            ))}
          </div>
        </div>
      )}
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
  visibleInList: false,
  // we need observer to update component automatically on any store changes
  Panel: MyDesignsPanel,
};
