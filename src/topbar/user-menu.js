import React from 'react';
import { observer } from 'mobx-react-lite';

import {
  Button,
  Position,
  Menu,
  MenuItem,
  Dialog,
  Classes,
} from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import { useAuth0 } from '@auth0/auth0-react';
import * as api from '../api';
import { SubscribeButton } from '../subscribe-button';

export const UserMenu = observer(({ store }) => {
  const {
    loginWithPopup,
    isLoading,
    getAccessTokenSilently,
    user,
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
                icon={subscription ? 'thumbs-up' : 'disable'}
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
      <Dialog
        icon={subscription ? 'thumbs-up' : 'disable'}
        onClose={() => toggleSubModal(false)}
        title="Subscription"
        isOpen={subModalOpen}
        style={{
          width: '80%',
          maxWidth: '500px',
        }}
      >
        <div className={Classes.DIALOG_BODY}>
          {subscription && (
            <>
              <p>Thanks for your support! 😍 </p>
              <p>
                Your subscription is active. The next payment will be on{' '}
                {new Date(
                  subscription.current_period_end * 1000
                ).toDateString()}{' '}
              </p>
            </>
          )}
          {!subscription && (
            <>
              <p>Do you think Polotno Studio is a cool application?</p>
              <p>
                At time of writing this, I am working on this project full time
                alone.
              </p>
              <p>
                If you want to support the project, you can subscribe to the
                Polotno Studio Fan plan.
              </p>
            </>
          )}
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div
            className={Classes.DIALOG_FOOTER_ACTIONS}
            style={{ display: 'flex', justifyContent: 'space-between' }}
          >
            {subscription ? (
              <Button
                intent="danger"
                minimal
                onClick={async () => {
                  if (window.confirm('Are you sure? 😥')) {
                    const accessToken = await getAccessTokenSilently({});
                    api.cancelUserSubscription({
                      accessToken,
                      id: subscription.id,
                    });
                    loadSubscription();
                  }
                }}
              >
                Cancel subscription
              </Button>
            ) : (
              <SubscribeButton />
            )}
            <Button onClick={() => toggleSubModal(false)}>Close</Button>
          </div>
        </div>
      </Dialog>
    </>
  );
});
