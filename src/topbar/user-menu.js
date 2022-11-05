import React from 'react';
import { observer } from 'mobx-react-lite';

import { Button, Position, Menu, MenuItem } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import { useAuth0 } from '@auth0/auth0-react';

export const UserMenu = observer(({ store }) => {
  const {
    loginWithPopup,
    getAccessTokenSilently,
    user,
    isAuthenticated,
    logout,
  } = useAuth0();
  return (
    <Popover2
      content={
        <Menu>
          {!isAuthenticated && (
            <MenuItem text="Login" icon="log-in" onClick={loginWithPopup} />
          )}
          {isAuthenticated && (
            <MenuItem
              text="Logout"
              icon="log-out"
              onClick={() => {
                logout({ returnTo: window.location.origin, localOnly: true });
              }}
            />
          )}
        </Menu>
      }
      position={Position.BOTTOM_RIGHT}
    >
      <Button icon="user" minimal></Button>
    </Popover2>
  );
});
