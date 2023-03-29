import React from 'react';

import { Button, Dialog, Classes } from '@blueprintjs/core';

export const PuterModal = ({ onClose, isOpen }) => {
  return (
    <Dialog
      onClose={onClose}
      title="Ready to upgrade your experience?"
      isOpen={isOpen}
      style={{
        width: '80%',
        maxWidth: '600px',
        zIndex: 4000,
      }}
    >
      <div className={Classes.DIALOG_BODY}>
        <>
          <p>
            ✋ Attention all creative minds! We have an exciting announcement
            that will take your designs to the next level!
          </p>
          <p>
            Introducing a partnership between Polotno Studio and{' '}
            <a href="https://puter.com" target="_blank" rel="noreferrer">
              puter.com
            </a>
            ! When you use our app within puter.com, you'll have access to even
            more features that will help you create the perfect design.
          </p>
          <p>
            Not only can you{' '}
            <strong>save your designs to the cloud for safekeeping</strong>, but
            you'll also receive <strong>additional credits</strong> for two of
            our most popular features: "remove image background" and "generate
            with AI."{' '}
          </p>
          <p>
            Don't miss out on this incredible opportunity to enhance your
            creativity and streamline your design process. Try our app within{' '}
            <a href="https://puter.com" target="_blank" rel="noreferrer">
              puter.com
            </a>{' '}
            today and see the difference for yourself! Click here to get started
            now and take your designs to new heights.
          </p>
          <div style={{ textAlign: 'center' }}>
            <Button
              onClick={() => {
                window.open(
                  'https://puter.com/app/polotno?puter.fullpage=1',
                  '_blank'
                );
              }}
              intent="primary"
              className="plausible-event-name=Puter"
            >
              Open Polotno Studio in puter.com (beta)
            </Button>
          </div>
        </>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Dialog>
  );
};
