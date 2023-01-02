import React from 'react';
import { observer } from 'mobx-react-lite';

import { Button, Position, Menu, MenuItem } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import { useAuth0 } from '@auth0/auth0-react';
import * as api from '../api';
import { SubscriptionModal } from './subscription-modal';

export const UserMenu = observer(({ store }) => {
  const {
    loginWithPopup,
    isLoading,
    getAccessTokenSilently,
    isAuthenticated,
    logout,
  } = useAuth0();
  const [subscriptionLoading, setSubscriptionLoading] = React.useState(true);
  const [subscription, setSubscription] = React.useState(null);
  const [subModalOpen, toggleSubModal] = React.useState(false);

  const loadSubscription = async () => {
    setSubscriptionLoading(true);
    const accessToken = await getAccessTokenSilently({});
    const res = await api.getUserSubscription({ accessToken });
    setSubscription(res.subscription);
    setSubscriptionLoading(false);
  };

  React.useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isAuthenticated) {
      return;
    }
    loadSubscription();
  }, [isLoading, isAuthenticated, getAccessTokenSilently]);

  return (
    <>
      <Popover2
        content={
          <Menu style={{ width: '80px !important' }}>
            {!isAuthenticated && (
              <MenuItem text="Login" icon="log-in" onClick={loginWithPopup} />
            )}
            {isAuthenticated && (
              <MenuItem
                text="Subscription"
                icon={'thumbs-up'}
                onClick={() => {
                  toggleSubModal(true);
                }}
              />
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
      <SubscriptionModal
        store={store}
        isOpen={subModalOpen}
        onClose={() => toggleSubModal(false)}
      />
    </>
  );
});
