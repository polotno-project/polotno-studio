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
import { loadStripe } from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  'pk_test_51LyF03L21WSvCFCy37g8aQ2foBaL8hvGAMO9eK6W6fwdSS7PQTpri1dnHata8aJFN9OTynU6L1ak0svNQNmgCMlL00qCp0K7DJ'
);

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

const PRICE = 10;

const CheckoutForm = ({ user }) => {
  return (
    <div style={{ padding: '10px' }}>
      <p>
        Saving designs in Cloud is in early access and available for Polotno
        Studio Fan users only.
      </p>
      <Button
        intent="primary"
        onClick={async () => {
          const stripe = await stripePromise;
          const { error } = await stripe.redirectToCheckout({
            lineItems: [
              {
                price: 'price_1M0o6tL21WSvCFCyrnLZw7fC',
                quantity: 1,
              },
            ],
            mode: 'subscription',
            successUrl: `http://localhost:3000/success`,
            cancelUrl: `http://localhost:3000/cancel`,
            customerEmail: user.email,
          });
        }}
      >
        Subscribe for {PRICE} USD/month
      </Button>
    </div>
  );
};

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
  const [subscriptionLoading, setSubscriptionLoading] = React.useState(true);
  const [subscription, setSubscription] = React.useState(null);

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

  React.useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isAuthenticated) {
      return;
    }
    const run = async () => {
      setSubscriptionLoading(true);
      const accessToken = await getAccessTokenSilently({});
      const res = await api.getUserSubscription({ accessToken });
      setSubscription(res.subscription);
      setSubscriptionLoading(false);
    };
    run();
  }, [isLoading, isAuthenticated, getAccessTokenSilently]);

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
      {!isLoading && !isAuthenticated && (
        <div>
          <div style={{ paddingBottom: '10px' }}>
            Cloud storage is available only for Polotno Studio supporters and
            creators.
          </div>
          <Button fill intent="primary" onClick={loginWithPopup}>
            Login or create account for {PRICE} USD / month
          </Button>
        </div>
      )}
      {user && !subscriptionLoading && !subscription && (
        <CheckoutForm user={user} />
      )}

      {designsLoadings || (isLoading && <div>Loading...</div>)}
      {isAuthenticated && !designsLoadings && !designs.length && (
        <div>No designs yet</div>
      )}
      {designsLoadings && (
        <div style={{ padding: '30px' }}>
          <Spinner />
        </div>
      )}
      {!isLoading && isAuthenticated && (
        <div style={{ display: 'flex' }}>
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
