import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@blueprintjs/core';
import {
  ImagesGrid,
  UploadSection as DefaultUploadSection,
} from 'polotno/side-panel';
import { getImageSize } from 'polotno/utils/image';

import { listAssets, uploadAsset, deleteAsset } from '../api';

export const UploadPanel = observer(({ store }) => {
  const [images, setImages] = React.useState([]);
  const [isUploading, setUploading] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);

  const load = async () => {
    setLoading(true);
    const images = await listAssets();
    setImages(images);
    setLoading(false);
  };

  const handleFileInput = async (e) => {
    const { target } = e;
    setUploading(true);
    for (const file of target.files) {
      await uploadAsset({ file });
    }
    await load();
    setUploading(false);
    target.value = null;
  };

  React.useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="input-file">
          <Button
            icon="upload"
            style={{ width: '100%' }}
            onClick={() => {
              document.querySelector('#input-file')?.click();
            }}
            loading={isUploading}
            intent="primary"
          >
            Upload
          </Button>
          <input
            type="file"
            id="input-file"
            style={{ display: 'none' }}
            onChange={handleFileInput}
            multiple
          />
        </label>
      </div>
      <ImagesGrid
        images={images}
        getPreview={(image) => image.src + '?t=1'}
        crossOrigin={undefined}
        isLoading={isLoading}
        getCredit={(image) => (
          <div>
            <Button
              icon="trash"
              onClick={async (e) => {
                e.stopPropagation();
                if (
                  window.confirm('Are you sure you want to delete the image?')
                ) {
                  await deleteAsset({ id: image.id });
                  await load();
                }
              }}
            ></Button>
          </div>
        )}
        onSelect={async (image, pos, element) => {
          const { src } = image;
          let { width, height } = await getImageSize(src);
          const isSVG = src.indexOf('svg+xml') >= 0 || src.indexOf('.svg') >= 0;

          const type = isSVG ? 'svg' : 'image';

          if (
            element &&
            element.type === 'svg' &&
            !element.locked &&
            type === 'image'
          ) {
            element.set({ maskSrc: src });
            return;
          }

          if (
            element &&
            element.type === 'image' &&
            !element.locked &&
            type === 'image'
          ) {
            element.set({ src: src });
            return;
          }

          const scale = Math.min(store.width / width, store.height / height, 1);
          width = width * scale;
          height = height * scale;

          const x = (pos?.x || store.width / 2) - width / 2;
          const y = (pos?.y || store.height / 2) - height / 2;

          store.activePage?.addElement({
            type,
            src,
            x,
            y,
            width,
            height,
          });
        }}
      />
    </div>
  );
});

DefaultUploadSection.Panel = UploadPanel;

export const UploadSection = DefaultUploadSection;
