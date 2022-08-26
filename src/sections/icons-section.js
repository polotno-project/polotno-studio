import React from 'react';
import { observer } from 'mobx-react-lite';
import { InputGroup, Button } from '@blueprintjs/core';
import { isAlive } from 'mobx-state-tree';

import { svgToURL } from 'polotno/utils/svg';
import { SectionTab } from 'polotno/side-panel';
import { getKey } from 'polotno/utils/validate-key';
import { getImageSize } from 'polotno/utils/image';
import styled from 'polotno/utils/styled';
import { t } from 'polotno/utils/l10n';
import { useInfiniteAPI } from 'polotno/utils/use-api';
import FaVectorSquare from '@meronex/icons/fa/FaVectorSquare';

import { ImagesGrid } from 'polotno/side-panel/images-grid';

const API = 'https://api.polotno.dev/api';
// const API = 'http://localhost:3001/api';

const iconToSrc = async (id) => {
  const req = await fetch(
    `${API}/download-nounproject?id=${id}&KEY=${getKey()}`
  );
  const text = await req.text();
  const base64 = await svgToURL(text);
  return base64;
};

const limit = 50;

const NounContainer = styled('div')`
  height: 100%;
  overflow: hidden;

  & img {
    filter: invert(1);
  }
`;

export const NounprojectPanel = observer(({ store, query }) => {
  // load data
  const { data, isLoading, loadMore, setQuery } = useInfiniteAPI({
    getAPI: ({ page, query }) =>
      `${API}/get-nounproject?query=${query}&offset=${
        (page - 1) * limit
      }&KEY=${getKey()}`,
    getSize: (res) => {
      return 1;
    },
  });

  React.useEffect(() => {
    setQuery(query);
  }, [query]);

  return (
    <NounContainer>
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
    </NounContainer>
  );
});

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

export const IconFinderPanel = observer(({ store, query }) => {
  // load data
  const count = 50;
  const { data, isLoading, loadMore, setQuery } = useInfiniteAPI({
    getAPI: ({ page, query }) =>
      `${API}/get-iconfinder?query=${query}&offset=${
        (page - 1) * count
      }&count=${count}&KEY=${getKey()}`,
    getSize: (res) => {
      return Math.ceil(res.total_count / count);
    },
  });

  React.useEffect(() => {
    setQuery(query);
  }, [query]);

  return (
    <ImagesGrid
      shadowEnabled={false}
      images={data?.map((data) => data.icons).flat()}
      getPreview={(item) => item.raster_sizes[6].formats[0].preview_url}
      isLoading={isLoading}
      onSelect={async (item, pos, element) => {
        const { download_url } = item.vector_sizes[0].formats[0];
        if (element && element.type === 'image' && !element.locked) {
          const req = await fetch(
            `${API}/download-iconfinder?download_url=${download_url}&KEY=${getKey()}`
          );
          const json = await req.json();
          const base64 = await svgToURL(json.content);
          element.set({ clipSrc: base64 });
          return;
        }
        // const { width, height } = await getImageSize(item.images['256']);
        const width = item.vector_sizes[0].size_width;
        const height = item.vector_sizes[0].size_height;
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
            `${API}/download-iconfinder?download_url=${download_url}&KEY=${getKey()}`
          );
          const json = await req.json();
          const base64 = await svgToURL(json.content);
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

export const IconsPanel = ({ store }) => {
  const requestTimeout = React.useRef();
  const [query, setQuery] = React.useState('');
  const [delayedQuery, setDelayedQuery] = React.useState(query);
  const [service, setService] = React.useState('iconfinder');

  React.useEffect(() => {
    requestTimeout.current = setTimeout(() => {
      setDelayedQuery(query);
    }, 500);
    return () => {
      clearTimeout(requestTimeout.current);
    };
  }, [query]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <InputGroup
        leftIcon="search"
        placeholder={t('sidePanel.searchPlaceholder')}
        onChange={(e) => {
          setQuery(e.target.value);
        }}
        type="search"
        style={{
          marginBottom: '20px',
        }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingBottom: '10px',
        }}
      >
        <Button
          onClick={() => {
            setService('iconfinder');
          }}
          active={service === 'iconfinder'}
          icon={<img src="/iconfinder.svg" alt="IconFinder" width="15" />}
        >
          IconFinder
        </Button>
        <Button
          onClick={() => {
            setService('nounproject');
          }}
          active={service === 'nounproject'}
          icon={<img src="/noun-project.svg" alt="IconFinder" width="15" />}
        >
          Noun Project
        </Button>
        <Button
          onClick={() => {
            setService('flaticon');
          }}
          active={service === 'flaticon'}
          icon={
            <img
              src="/flaticon.png"
              alt="FlatIcon"
              width="15"
              style={{ filter: 'invert(1)' }}
            />
          }
        >
          FlatIcon
        </Button>
      </div>
      {service === 'flaticon' && (
        <FlatIconPanel query={delayedQuery} store={store} />
      )}
      {service === 'nounproject' && (
        <NounprojectPanel query={delayedQuery} store={store} />
      )}
      {service === 'iconfinder' && (
        <IconFinderPanel query={delayedQuery} store={store} />
      )}
    </div>
  );
};

// // define the new custom section
export const IconsSection = {
  name: 'icons',
  Tab: (props) => (
    <SectionTab name="Icons" {...props}>
      <FaVectorSquare />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: IconsPanel,
};
