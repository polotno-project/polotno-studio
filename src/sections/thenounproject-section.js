import React from 'react';
import { observer } from 'mobx-react-lite';
import { InputGroup } from '@blueprintjs/core';
import { isAlive } from 'mobx-state-tree';
import { useInfiniteAPI } from 'polotno/utils/use-api';
import { svgToURL } from 'polotno/utils/svg';
import { getImageSize } from 'polotno/utils/image';
import { SectionTab } from 'polotno/side-panel';
import { getKey } from 'polotno/utils/validate-key';
import CgAbstract from '@meronex/icons/cg/CgAbstract';

import { ImagesGrid } from 'polotno/side-panel/images-grid';

const API = 'http://localhost:3001/api';
const limit = 20;

const iconToSrc = async (id) => {
  const req = await fetch(
    `${API}/download-thenounproject?id=${id}&KEY=${getKey()}`
  );
  const text = await req.text();
  const base64 = await svgToURL(text);
  return base64;
};

export const ThenounprojectPanel = observer(({ store }) => {
  // load data
  const { data, isLoading, loadMore, setQuery } = useInfiniteAPI({
    defaultQuery: 'cat',
    getAPI: ({ page, query }) =>
      `${API}/get-thenounproject?query=${query}&offset=${
        page * limit
      }&KEY=${getKey()}`,
    getSize: (res) => {
      return 1;
    },
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
      <div
        style={{
          filter: 'invert(1)',
          height: 'calc(100% - 40px)',
          overflow: 'hidden',
        }}
      >
        <ImagesGrid
          shadowEnabled={false}
          images={data?.map((data) => data.icons).flat()}
          getPreview={(item) => item.preview_url_84}
          isLoading={isLoading}
          onSelect={async (item, pos, element) => {
            if (element && element.type === 'image' && !element.locked) {
              const src = await iconToSrc(item.id);
              element.set({ clipSrc: src });
              return;
            }
            // const { width, height } = await getImageSize(item.images['256']);
            const width = 200;
            const height = 200;
            store.history.transaction(async () => {
              const x = (pos?.x || store.width / 2) - width / 2;
              const y = (pos?.y || store.height / 2) - height / 2;
              const svg = store.activePage?.addElement({
                type: 'svg',
                width,
                height,
                x,
                y,
              });
              const src = await iconToSrc(item.id);
              if (isAlive(svg)) {
                await svg.set({ src });
              }
            });
          }}
          rowsNumber={4}
          loadMore={loadMore}
        />
      </div>
    </div>
  );
});

// define the new custom section
export const ThenounprojectSection = {
  name: 'Thenounproject',
  Tab: (props) => (
    <SectionTab
      name={
        <div style={{ marginTop: '-5px' }}>
          <span style={{ fontSize: '10px' }}>NounProject</span>
          <br /> Icons
        </div>
      }
      {...props}
    >
      <div style={{ fontSize: '16px' }}>
        <CgAbstract />
      </div>
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: ThenounprojectPanel,
};
