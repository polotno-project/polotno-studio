import React from 'react';
import { Button } from '@blueprintjs/core';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth0 } from '@auth0/auth0-react';
// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  'pk_test_51LyF03L21WSvCFCy37g8aQ2foBaL8hvGAMO9eK6W6fwdSS7PQTpri1dnHata8aJFN9OTynU6L1ak0svNQNmgCMlL00qCp0K7DJ'
);

export const PRICE = 10;

export const SubscribeButton = (props) => {
  const { isAuthenticated, loginWithPopup, user } = useAuth0();

  const emailRef = React.useRef(null);
  emailRef.current = user?.email;

  const subscribe = async () => {
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({
      lineItems: [
        {
          price: 'price_1M0o6tL21WSvCFCyrnLZw7fC',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      successUrl: window.location.href,
      cancelUrl: window.location.href,
      customerEmail: emailRef.current,
    });
    if (error) {
      alert('Something went wrong');
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
      Subscribe for {PRICE} USD/month
    </Button>
  );
};
