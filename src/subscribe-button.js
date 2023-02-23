import React from 'react';
import { Button } from '@blueprintjs/core';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth0 } from '@auth0/auth0-react';

const PRICES = [
  { id: 'price_1MFMkUL21WSvCFCycTEDKu0R', price: 2.5 },
  { id: 'price_1MFMkLL21WSvCFCy1bgh9gbc', price: 4.5 },
  { id: 'price_1MFMkDL21WSvCFCy6bmXbgsi', price: 9.5 },
  { id: 'price_1LyFTZL21WSvCFCyULJEC1YU', price: 14.5 },
];

export const PRICE = PRICES[Math.floor(Math.random() * PRICES.length)];

export const SubscribeButton = (props) => {
  const { isAuthenticated, loginWithPopup, user } = useAuth0();

  const emailRef = React.useRef(null);
  emailRef.current = user?.email;

  const subscribe = async () => {
    const stripe = await loadStripe(process.env.REACT_APP_STRIPE_TOKEN);
    const { error } = await stripe.redirectToCheckout({
      lineItems: [
        {
          price: PRICE.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      successUrl: window.location.href,
      cancelUrl: window.location.href,
      customerEmail: emailRef.current,
    });
    if (error) {
      alert('Something went wrong. Tell Anton about this in Discord...');
    }
  };

  return (
    <Button
      {...props}
      intent="primary"
      onClick={async () => {
        if (!isAuthenticated) {
          await loginWithPopup();
          // wait for user state updated
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        subscribe();
      }}
    >
      Subscribe for {PRICE.price} USD/month
    </Button>
  );
};
