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
import { getAPI } from 'polotno/utils/api';

const IconsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <path
        d="M3.75 12H2.25V20.25C2.25 21.0784 2.92155 21.75 3.75 21.75H9.75V20.25H3.75V12Z"
        fill="white"
      />
      <path
        d="M21 21.75H12.75C12.4849 21.75 12.2393 21.6101 12.1044 21.3817C12.0349 21.2641 12 21.1321 12 21C12 20.8757 12.0309 20.7512 12.0929 20.6386L16.2179 13.1386C16.3602 12.8798 16.6178 12.7502 16.875 12.75C17.1326 12.7498 17.3896 12.8793 17.5321 13.1386L21.6572 20.6386C21.7191 20.7512 21.75 20.8757 21.75 21C21.75 21.1321 21.7151 21.2641 21.6456 21.3817C21.5107 21.61 21.2651 21.75 21 21.75ZM14.0184 20.25H19.7317L16.8751 15.0563L14.0184 20.25Z"
        fill="white"
      />
      <path
        d="M20.25 2.25H12V3.75H20.25V14.2442H21.75V3.75C21.75 2.92162 21.0785 2.25 20.25 2.25Z"
        fill="white"
      />
      <path
        d="M8.25 2.25H3.75C2.92155 2.25 2.25 2.92162 2.25 3.75V8.25C2.25 9.07837 2.92155 9.75 3.75 9.75H8.25C9.07845 9.75 9.75 9.07837 9.75 8.25V3.75C9.75 2.92162 9.07845 2.25 8.25 2.25ZM8.25 8.25H3.75V3.75H8.25V8.25Z"
        fill="white"
      />
    </g>
  </svg>
);

import { ImagesGrid } from 'polotno/side-panel/images-grid';

const iconToSrc = async (id) => {
  const req = await fetch(
    `${getAPI()}/download-nounproject?id=${id}&KEY=${getKey()}`
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
  const { data, isLoading, loadMore, setQuery, hasMore } = useInfiniteAPI({
    defaultQuery: query,
    getAPI: ({ page, query }) =>
      `${getAPI()}/get-nounproject?query=${query}&page=${page}&limit=${limit}&KEY=${getKey()}`,
    getSize: (res) => {
      return res.pagesNumber;
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
        loadMore={hasMore && loadMore}
      />
    </NounContainer>
  );
});

export const FlatIconPanel = observer(({ store, query }) => {
  // load data
  const { data, isLoading, loadMore, setQuery } = useInfiniteAPI({
    getAPI: ({ page, query }) =>
      `${getAPI()}/get-flaticon?q=${query}&page=${page}&KEY=${getKey()}`,
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
            `${getAPI()}/download-flaticon?id=${item.id}&KEY=${getKey()}`
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
            `${getAPI()}/download-flaticon?id=${item.id}&KEY=${getKey()}`
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
  const { data, isLoading, loadMore, setQuery, error, hasMore } =
    useInfiniteAPI({
      getAPI: ({ page, query }) =>
        `${getAPI()}/get-iconfinder?query=${query}&offset=${
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
            `${getAPI()}/download-iconfinder?download_url=${download_url}&KEY=${getKey()}`
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
            `${getAPI()}/download-iconfinder?download_url=${download_url}&KEY=${getKey()}`
          );
          const json = await req.json();
          const base64 = await svgToURL(json.content);
          if (isAlive(svg)) {
            await svg.set({ src: base64 });
          }
        });
      }}
      rowsNumber={4}
      error={error}
      loadMore={hasMore && loadMore}
    />
  );
});

export const IconsPanel = ({ store }) => {
  const requestTimeout = React.useRef();
  const [query, setQuery] = React.useState('');
  const [delayedQuery, setDelayedQuery] = React.useState(query);
  const [service, setService] = React.useState('nounproject');

  React.useEffect(() => {
    requestTimeout.current = setTimeout(() => {
      setDelayedQuery(query);
    }, 800);
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
      {/* <div
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
      </div> */}
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
  Tab: observer((props) => (
    <SectionTab name={t('sidePanel.icons')} {...props}>
      <IconsIcon />
    </SectionTab>
  )),
  // we need observer to update component automatically on any store changes
  Panel: IconsPanel,
};
