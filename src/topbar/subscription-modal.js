import React from 'react';
import { observer } from 'mobx-react-lite';

import { Button, Dialog, Classes } from '@blueprintjs/core';
import { useAuth0 } from '@auth0/auth0-react';
import * as api from '../api';
import { SubscribeButton } from '../subscribe-button';

export const SubscriptionModal = observer(({ store, onClose, isOpen }) => {
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
    <Dialog
      onClose={onClose}
      title="Show your support!"
      isOpen={isOpen}
      style={{
        width: '80%',
        maxWidth: '600px',
      }}
    >
      <div className={Classes.DIALOG_BODY}>
        {subscription && (
          <>
            <p>Thanks for your support! 😍 </p>
            <p>
              Your subscription is active. The next payment will be on{' '}
              {new Date(subscription.current_period_end * 1000).toDateString()}{' '}
            </p>
          </>
        )}
        {!subscription && (
          <>
            <p>
              ✋ Hey there! My name is Anton. I'm the developer behind this app,
              and I'm on a mission to help you create beautiful designs.
            </p>
            <p>
              But I can't do it alone. That's where you come in. By supporting
              my project, you'll be helping to fund updates, improvements, and
              all the other things that go into making this app the best it can
              be. Plus, you'll be supporting a solo developer who is dedicated
              to bringing you the best design tools out there.
            </p>
            <p>
              Don't be shy, click that button and let's create something amazing
              together!
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
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Dialog>
  );
});
