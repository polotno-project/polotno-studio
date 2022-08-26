import React from 'react';

import { urlToBase64 } from 'polotno/utils/svg';
import { SectionTab } from 'polotno/side-panel';
import { getImageSize } from 'polotno/utils/image';
import useSWR from 'swr';

import { fetcher } from 'polotno/utils/use-api';
import FaShapes from '@meronex/icons/fa/FaShapes';
import { polotnoShapesList } from 'polotno/utils/api';

import { ImagesGrid } from 'polotno/side-panel/images-grid';

export const ShapesPanel = ({ store }) => {
  const { data } = useSWR(polotnoShapesList(), fetcher);

  return (
    <ImagesGrid
      shadowEnabled={false}
      rowsNumber={3}
      images={data?.items}
      getPreview={(image) => image.url}
      isLoading={!data}
      itemHeight={100}
      onSelect={async (image, pos, element) => {
        const { width, height } = await getImageSize(image.url);
        const base64 = await urlToBase64(image.url);
        if (element && element.type === 'image') {
          element.set({ clipSrc: base64 });
          return;
        }
        const x = (pos?.x || store.width / 2) - width / 2;
        const y = (pos?.y || store.height / 2) - height / 2;
        const svg = store.activePage?.addElement({
          type: 'svg',
          width,
          height,
          x,
          y,
          src: base64,
          keepRatio: false,
        });
      }}
    />
  );
};

// // define the new custom section
export const ShapesSection = {
  name: 'shapes',
  Tab: (props) => (
    <SectionTab name="Shapes" {...props}>
      <FaShapes />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: ShapesPanel,
};
