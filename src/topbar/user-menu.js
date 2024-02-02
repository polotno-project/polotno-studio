import React from 'react';
import { observer } from 'mobx-react-lite';

import { Button, Position, Menu, MenuItem, Popover } from '@blueprintjs/core';
import { useProject } from '../project';

export const UserMenu = observer(({ store }) => {
  const project = useProject();
  const [user, setUser] = React.useState(null);
  React.useEffect(() => {
    if (project.cloudEnabled) {
      window.puter.auth.getUser().then((user) => {
        setUser(user);
      });
    }
  }, [project.cloudEnabled]);
  return (
    <>
      <Popover
        content={
          <Menu style={{ width: '80px !important' }}>
            {project.cloudEnabled && (
              <div style={{ padding: '5px' }}>Logged as {user?.username}</div>
            )}
            {!project.cloudEnabled && (
              <MenuItem
                text="Login"
                icon="log-in"
                onClick={() => {
                  project.signIn();
                }}
              />
            )}
            {/* {project.cloudEnabled && (
              <MenuItem
                text="Subscription"
                icon={'thumbs-up'}
                onClick={() => {
                  // toggleSubModal(true);
                }}
              />
            )} */}
            {project.cloudEnabled && (
              <MenuItem
                text="Logout"
                icon="log-out"
                onClick={() => {
                  window.puter.auth.signOut();
                  // logout({ returnTo: window.location.origin, localOnly: true });
                }}
              />
            )}
          </Menu>
        }
        position={Position.BOTTOM_RIGHT}
      >
        <Button
          icon="user"
          minimal
          intent={project.cloudEnabled ? 'none' : 'warning'}
        ></Button>
      </Popover>
    </>
  );
});
