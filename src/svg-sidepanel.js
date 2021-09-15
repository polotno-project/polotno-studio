import React from 'react';
import { observer } from 'mobx-react-lite';
import { InputGroup } from '@blueprintjs/core';

import { useInfiniteAPI } from 'polotno/utils/use-api';

import { SectionTab } from 'polotno/side-panel';
import { svgToURL } from 'polotno/utils/svg';
import { getKey } from 'polotno/utils/validate-key';
import { getImageSize } from 'polotno/utils/image';
import FaVectorSquare from '@meronex/icons/fa/FaVectorSquare';

import { ImagesGrid } from 'polotno/side-panel/images-grid';

export const SVGPanel = observer(({ store }) => {
  // load data
  const { data, isLoading, loadMore, setQuery } = useInfiniteAPI({
    getAPI: ({ page, query }) =>
      `https://api.polotno.dev/api/get-svgapi?query=${query}&page=${
        page - 1
      }&key=${getKey()}`,
    getSize: (res) => Math.floor(res.count / res.limit),
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <InputGroup
        leftIcon="search"
        placeholder="Search..."
        onChange={(e) => {
          setQuery(e.target.value);
        }}
        style={{
          marginBottom: '20px',
        }}
      />
      <ImagesGrid
        shadowEnabled={false}
        images={data?.map((data) => data.icons).flat()}
        getPreview={(item) => item.url}
        isLoading={isLoading}
        onSelect={async (item, pos, element) => {
          const req = await fetch(
            `https://api.polotno.dev/api/download-svgapi?key=${getKey()}&path=${
              item.path
            }`
          );
          const json = await req.json();
          const base64 = await svgToURL(json.content);
          if (element && element.type === 'image') {
            element.set({ clipSrc: base64 });
            return;
          }
          const { width, height } = await getImageSize(item.url);
          const x = (pos?.x || store.width / 2) - width / 2;
          const y = (pos?.y || store.height / 2) - height / 2;
          store.activePage?.addElement({
            type: 'svg',
            width,
            height,
            x,
            y,
            src: base64,
          });
        }}
        rowsNumber={4}
        loadMore={loadMore}
      />
    </div>
  );
});

// define the new custom section
export const VectorSection = {
  name: 'svgapi',
  Tab: (props) => (
    <SectionTab name="Icons" {...props}>
      <FaVectorSquare />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: SVGPanel,
};
