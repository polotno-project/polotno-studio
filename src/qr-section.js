import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import QRCode from 'qrcode';
import * as svg from 'polotno/utils/svg';
import FaQrcode from '@meronex/icons/fa/FaQrcode';
import { Button, InputGroup } from '@blueprintjs/core';

// create svg image for QR code for input text
export async function getQR(text) {
  return new Promise((resolve) => {
    QRCode.toString(
      text || 'no-data',
      {
        type: 'svg',
        color: {
          dark: '#000', // Blue dots
          light: '#fff', // Transparent background
        },
      },
      (err, string) => {
        resolve(svg.svgToURL(string));
      }
    );
  });
}

// define the new custom section
export const QrSection = {
  name: 'qr',
  Tab: (props) => (
    <SectionTab name="QR code" {...props}>
      <FaQrcode />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: observer(({ store }) => {
    const inputRef = React.useRef();
    return (
      <div>
        <h3 style={{ marginBottom: '10px', marginTop: '5px' }}>QR code</h3>
        <p>Generate QR code with any URL you want.</p>
        <InputGroup
          placeholder="Paste URL here"
          style={{ width: '100%', marginTop: '10px', marginBottom: '10px' }}
          inputRef={inputRef}
        />

        <Button
          onClick={async () => {
            const src = await getQR(inputRef.current.value);

            store.activePage.addElement({
              type: 'svg',
              name: 'qr',
              x: 50,
              y: 50,
              width: 200,
              height: 200,
              src,
            });
          }}
          fill
          intent="primary"
        >
          Add new QR code
        </Button>
      </div>
    );
  }),
};
