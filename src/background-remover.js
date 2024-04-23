import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Dialog, Classes } from '@blueprintjs/core';

import { t } from 'polotno/utils/l10n';
import { getKey } from 'polotno/utils/validate-key';
import { useCredits } from './credits';
import { useProject } from './project';
import { getAPI } from 'polotno/utils/api';

let removeBackgroundFunc = async (url) => {
  const req = await fetch(
    `${getAPI()}/remove-image-background?KEY=` + getKey(),
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
    const project = useProject();
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
      const interval = setInterval(() => {
        setProgress((progress) => {
          const left = 100 - progress;
          return Math.round(100 - left * 0.9);
        });
      }, 1000);
      return () => clearInterval(interval);
    }, [isOpen, removing]);

    const handleRemove = async () => {
      setRemoving(true);
      window.__failedImage = element.src;
      try {
        setSrc(await removeBackgroundFunc(element.src));
        window.__failedImage = null;
        consumeCredits();
      } catch (e) {
        if (window.Sentry) {
          window.Sentry.captureException(new Error('Background remove error'));
          setTimeout(() => {
            window.__failedImage = null;
          }, 1000);
        }
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
