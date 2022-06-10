import React from 'react';
import { observer } from 'mobx-react-lite';
import { InputGroup } from '@blueprintjs/core';
import { isAlive } from 'mobx-state-tree';

import { urlToBase64, svgToURL } from 'polotno/utils/svg';
import { SectionTab } from 'polotno/side-panel';
import { getKey } from 'polotno/utils/validate-key';
import { getImageSize } from 'polotno/utils/image';
import useSWR from 'swr';

import { t } from 'polotno/utils/l10n';
import { useInfiniteAPI, fetcher } from 'polotno/utils/use-api';
import FaVectorSquare from '@meronex/icons/fa/FaVectorSquare';
import { polotnoShapesList } from 'polotno/utils/api';

import { ImagesGrid } from 'polotno/side-panel/images-grid';

const API = 'https://api.polotno.dev/api';

export const FlatIconPanel = observer(({ store, query }) => {
  // load data
  const { data, isLoading, loadMore, setQuery } = useInfiniteAPI({
    getAPI: ({ page, query }) =>
      `${API}/get-flaticon?q=${query}&page=${page}&KEY=${getKey()}`,
    getSize: (res) => Math.floor(res.metadata.total / res.metadata.count),
  });

  React.useEffect(() => {
    setQuery(query);
  }, [query]);

  return (
    <ImagesGrid
      shadowEnabled={false}
      images={data?.map((data) => data.data).flat()}
      getPreview={(item) => item.images['64']}
      isLoading={isLoading}
      onSelect={async (item, pos, element) => {
        if (element && element.type === 'image' && !element.locked) {
          const req = await fetch(
            `${API}/download-flaticon?id=${item.id}&KEY=${getKey()}`
          );
          const json = await req.json();
          const base64 = await svgToURL(json.svg);
          element.set({ clipSrc: base64 });
          return;
        }
        const { width, height } = await getImageSize(item.images['256']);
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
          const req = await fetch(
            `${API}/download-flaticon?id=${item.id}&KEY=${getKey()}`
          );
          const json = await req.json();
          const base64 = await svgToURL(json.svg);
          if (isAlive(svg)) {
            await svg.set({ src: base64 });
          }
        });
      }}
      rowsNumber={4}
      loadMore={loadMore}
    />
  );
});

const BasicShapes = ({ store }) => {
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

export const ElementsPanel = ({ store }) => {
  const requestTimeout = React.useRef();
  const [query, setQuery] = React.useState('');
  const [delayedQuery, setDelayedQuery] = React.useState(query);

  React.useEffect(() => {
    requestTimeout.current = setTimeout(() => {
      setDelayedQuery(query);
    }, 500);
    return () => {
      clearTimeout(requestTimeout.current);
    };
  }, [query]);

  const hasSearch = !!query;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <InputGroup
        leftIcon="search"
        placeholder={t('sidePanel.searchPlaceholder')}
        onChange={(e) => {
          setQuery(e.target.value);
        }}
        style={{
          marginBottom: '20px',
        }}
      />
      {hasSearch && <FlatIconPanel query={delayedQuery} store={store} />}
      {!hasSearch && <BasicShapes store={store} />}
    </div>
  );
};

// // define the new custom section
// export const FlaticonSection = {
//   name: 'flaticon',
//   Tab: (props) => (
//     <SectionTab name="Icons" {...props}>
//       <FaVectorSquare />
//     </SectionTab>
//   ),
//   // we need observer to update component automatically on any store changes
//   Panel: FlatIconPanel,
// };
