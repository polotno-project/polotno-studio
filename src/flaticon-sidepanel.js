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

export const FlatIconPanel = observer(({ store }) => {
  // load data
  const { data, isLoading, loadMore, setQuery } = useInfiniteAPI({
    getAPI: ({ page, query }) =>
      `http://localhost:3001/api/get-flaticon?q=${query}&page=${page}&KEY=${getKey()}`,
    getSize: (res) => Math.floor(res.metadata.total / res.metadata.count),
  });

  console.log(data);

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
        images={data?.map((data) => data.data).flat()}
        getPreview={(item) => item.images['64']}
        isLoading={isLoading}
        onSelect={async (item, pos, element) => {
          // const req = await fetch(
          //   `https://api.polotno.dev/api/download-svgapi?key=${getKey()}&path=${
          //     item.path
          //   }`
          // );
          // const json = await req.json();
          // const base64 = await svgToURL(json.content);
          // if (element && element.type === 'image') {
          //   element.set({ clipSrc: base64 });
          //   return;
          // }
          const url = item.images['256'];
          const { width, height } = await getImageSize(url);
          const x = (pos?.x || store.width / 2) - width / 2;
          const y = (pos?.y || store.height / 2) - height / 2;
          store.activePage?.addElement({
            type: 'svg',
            width,
            height,
            x,
            y,
            src: url,
          });
        }}
        rowsNumber={4}
        loadMore={loadMore}
      />
    </div>
  );
});

// define the new custom section
export const FlaticonSection = {
  name: 'flaticon',
  Tab: (props) => (
    <SectionTab name="Icons" {...props}>
      <FaVectorSquare />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: FlatIconPanel,
};
