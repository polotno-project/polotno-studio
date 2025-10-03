import React from 'react';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import QRCode from 'qrcode';
import * as svg from 'polotno/utils/svg';
import { Button, InputGroup } from '@blueprintjs/core';

const QrIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <path d="M18 19.5V21H19.5V19.5H18Z" fill="white" />
      <path d="M13.5 16.5V18H15V16.5H13.5Z" fill="white" />
      <path d="M13.5 22.5H16.5V21H15V19.5H13.5V22.5Z" fill="white" />
      <path d="M19.5 16.5V19.5H21V16.5H19.5Z" fill="white" />
      <path d="M21 19.5H22.5V22.5H19.5V21H21V19.5Z" fill="white" />
      <path d="M19.5 15V13.5H22.5V16.5H21V15H19.5Z" fill="white" />
      <path d="M18 15H16.5V18H15V19.5H18V15Z" fill="white" />
      <path d="M13.5 13.5V15H16.5V13.5H13.5Z" fill="white" />
      <path d="M7.5 16.5H4.5V19.5H7.5V16.5Z" fill="white" />
      <path d="M10.5 22.5H1.5V13.5H10.5V22.5ZM3 21H9V15H3V21Z" fill="white" />
      <path d="M19.5 4.5H16.5V7.5H19.5V4.5Z" fill="white" />
      <path d="M22.5 10.5H13.5V1.5H22.5V10.5ZM15 9H21V3H15V9Z" fill="white" />
      <path d="M7.5 4.5H4.5V7.5H7.5V4.5Z" fill="white" />
      <path d="M10.5 10.5H1.5V1.5H10.5V10.5ZM3 9H9V3H3V9Z" fill="white" />
    </g>
  </svg>
);

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
      <QrIcon />
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
