import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Dialog, Classes } from '@blueprintjs/core';

import { t } from 'polotno/utils/l10n';
import { getKey } from 'polotno/utils/validate-key';

let removeBackgroundFunc = async (url) => {
  const req = await fetch(
    'http://localhost:3001/api/remove-image-background?KEY=' + getKey(),
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
    React.useEffect(() => {
      setSrc(element.src);
    }, [element.src]);

    const [removing, setRemoving] = React.useState(false);

    const handleRemove = async () => {
      setRemoving(true);
      try {
        setSrc(await removeBackgroundFunc(element.src));
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
          <a
            href="https://predis.ai"
            style={{
              display: 'inline-block',
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
            target="_blank"
          >
            Powered by predis.ai
          </a>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            {!finished && (
              <Button onClick={handleRemove} loading={removing}>
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
  console.log(111);
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
