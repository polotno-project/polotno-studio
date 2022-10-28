import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Dialog, Classes } from '@blueprintjs/core';

import { t } from 'polotno/utils/l10n';
import { getKey } from 'polotno/utils/validate-key';
import { useCredits } from './credits';

let removeBackgroundFunc = async (url) => {
  const req = await fetch(
    'https://api.polotno.com/api/remove-image-background-hotpot?KEY=' +
      getKey(),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    }
  );
  if (req.status !== 200) {
    alert(t('error.removeBackground'));
    return url;
  }
  const res = await req.json();
  return res.url;
};

export const RemoveBackgroundDialog = observer(
  ({ isOpen, onClose, element }) => {
    const [src, setSrc] = React.useState(element.src);
    const { credits, consumeCredits } = useCredits(
      'removeBackgroundCredits',
      5
    );

    React.useEffect(() => {
      setSrc(element.src);
    }, [element.src]);

    const [removing, setRemoving] = React.useState(false);

    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
      if (!isOpen || !removing) {
        setProgress(0);
        return;
      }
      const averageTime = 30000;
      const steps = 95;
      const stepTime = averageTime / steps;
      const interval = setInterval(() => {
        setProgress((progress) => progress + 1);
      }, stepTime);
      return () => clearInterval(interval);
    }, [isOpen, removing]);

    const handleRemove = async () => {
      setRemoving(true);
      try {
        setSrc(await removeBackgroundFunc(element.src));
        consumeCredits();
      } catch (e) {
        console.error(e);
      }

      setRemoving(false);
    };

    const finished = src !== element.src;

    return (
      <Dialog
        // icon="info-sign"
        onClose={onClose}
        title="Remove background from image"
        isOpen={isOpen}
        style={{
          width: '80%',
          maxWidth: '700px',
        }}
      >
        <div className={Classes.DIALOG_BODY}>
          <img
            src={src}
            style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
          />
        </div>
        <div className={Classes.DIALOG_FOOTER} style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '5px' }}>
            Powered by{' '}
            <a href="https://hotpot.ai/" target="_blank">
              hotpot.ai
            </a>
          </div>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <div style={{ padding: '5px' }}>
              {removing && <span>{progress}%</span>}
              {!removing && !!credits && <div>You have {credits} credits.</div>}
              {!removing && !credits && (
                <div>You have no credits. They will renew tomorrow.</div>
              )}
            </div>
            {!finished && (
              <Button
                onClick={handleRemove}
                loading={removing}
                disabled={credits < 1}
              >
                {t('toolbar.removeBackground')}
              </Button>
            )}
            {finished && (
              <>
                <Button
                  onClick={() => {
                    setSrc(element.src);
                    onClose();
                  }}
                  loading={removing}
                >
                  {t('toolbar.cancelRemoveBackground')}
                </Button>
                <Button
                  onClick={() => {
                    element.set({ src });
                    onClose();
                  }}
                  loading={removing}
                  intent="primary"
                >
                  {t('toolbar.confirmRemoveBackground')}
                </Button>
              </>
            )}
          </div>
        </div>
      </Dialog>
    );
  }
);

export const ImageRemoveBackground = ({ element }) => {
  const [removeDialogOpen, toggleDialog] = React.useState(false);
  return (
    <>
      <Button
        text={t('toolbar.removeBackground')}
        minimal
        onClick={(e) => {
          toggleDialog(true);
        }}
      />
      <RemoveBackgroundDialog
        isOpen={removeDialogOpen}
        onClose={() => {
          toggleDialog(false);
        }}
        element={element}
      />
    </>
  );
};
