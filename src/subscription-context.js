import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

import * as api from './api';

export const SubscriptionContext = React.createContext({});

export const useSubscription = () => React.useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const loadSubscription = async () => {
    setLoading(true);
    const accessToken = await getAccessTokenSilently({});
    const res = await api.getUserSubscription({ accessToken });
    setSubscription(res.subscription);
    setLoading(false);
  };
  React.useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    // timeout to wait a bit, because stripe is slow
    const timeout = setTimeout(() => {
      loadSubscription();
    }, 5000);
    return () => clearTimeout(timeout);
  }, [isAuthenticated, getAccessTokenSilently]);

  const cancelSubscription = async () => {
    const accessToken = await getAccessTokenSilently({});
    api.cancelUserSubscription({
      accessToken,
      id: subscription.id,
    });
    loadSubscription();
  };

  return (
    <SubscriptionContext.Provider
      value={{ subscription, loading, cancelSubscription }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
