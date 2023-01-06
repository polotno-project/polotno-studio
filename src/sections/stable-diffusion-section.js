import React from 'react';
import { observer } from 'mobx-react-lite';
import { InputGroup, Button } from '@blueprintjs/core';
import { Tab, Tabs } from '@blueprintjs/core';

import { SectionTab } from 'polotno/side-panel';
import { getKey } from 'polotno/utils/validate-key';
import { getImageSize } from 'polotno/utils/image';
import FaBrain from '@meronex/icons/fa/FaBrain';
import { t } from 'polotno/utils/l10n';

import { ImagesGrid } from 'polotno/side-panel/images-grid';
import { useCredits } from '../credits';
import { useInfiniteAPI } from 'polotno/utils/use-api';
import { getCrop } from 'polotno/utils/image';

const API = 'https://api.polotno.dev/api';

const GenerateTab = observer(({ store }) => {
  const inputRef = React.useRef(null);
  const [image, setImage] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const { credits, consumeCredits } = useCredits('stableDiffusionCredits', 10);

  const handleGenerate = async () => {
    if (credits <= 0) {
      alert('You have no credits left');
      return;
    }
    setLoading(true);
    setImage(null);

    const req = await fetch(
      `${API}/get-stable-diffusion?KEY=${getKey()}&prompt=${
        inputRef.current.value
      }`
    );
    setLoading(false);
    if (!req.ok) {
      alert('Something went wrong, please try again later...');
      return;
    }
    consumeCredits();
    const data = await req.json();
    setImage(data.output[0]);
  };

  return (
    <>
      <div style={{ height: '40px', paddingTop: '5px' }}>
        Generate image with Stable Diffusion AI (BETA)
      </div>
      <div style={{ padding: '15px 0' }}>
        Stable Diffusion is a latent text-to-image diffusion model capable of
        generating photo-realistic images given any text input
      </div>
      <InputGroup
        placeholder="Type your image generation prompt here..."
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleGenerate();
          }
        }}
        style={{
          marginBottom: '20px',
        }}
        inputRef={inputRef}
      />
      <p style={{ textAlign: 'center' }}>
        {!!credits && <div>You have ({credits}) credits.</div>}
        {!credits && <div>You have no credits. They will renew tomorrow.</div>}
      </p>
      <Button
        onClick={handleGenerate}
        intent="primary"
        loading={loading}
        style={{ marginBottom: '40px' }}
        disabled={credits <= 0}
      >
        Generate
      </Button>
      {image && (
        <ImagesGrid
          shadowEnabled={false}
          images={image ? [image] : []}
          getPreview={(item) => item}
          isLoading={loading}
          onSelect={async (item, pos, element) => {
            const src = item;
            if (element && element.type === 'svg' && element.contentEditable) {
              element.set({ maskSrc: src });
              return;
            }

            if (
              element &&
              element.type === 'image' &&
              element.contentEditable
            ) {
              element.set({ src: src });
              return;
            }

            const { width, height } = await getImageSize(src);
            const x = (pos?.x || store.width / 2) - width / 2;
            const y = (pos?.y || store.height / 2) - height / 2;
            store.activePage?.addElement({
              type: 'image',
              src: src,
              width,
              height,
              x,
              y,
            });
          }}
          rowsNumber={1}
        />
      )}
    </>
  );
});

const RANDOM_QUERIES = [
  'Magic mad scientist, inside cosmic labratory, radiating a glowing aura stuff, loot legends, stylized, digital illustration, video game icon, artstation, ilya kuvshinov, rossdraws',
  'cute duckling sitting in a teacup, photography, minimalistic, 8 k ',
  'anime girl',
  'an mascot robot, smiling, modern robot, round robot, cartoon, flying, fist up, crypto coins background',
];

const SearchTab = observer(({ store }) => {
  // load data
  const [query, setQuery] = React.useState('');
  const [data, setData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const [delayedQuery, setDelayedQuery] = React.useState(
    RANDOM_QUERIES[(RANDOM_QUERIES.length * Math.random()) | 0]
  );

  const requestTimeout = React.useRef();
  React.useEffect(() => {
    requestTimeout.current = setTimeout(() => {
      setDelayedQuery(query);
    }, 1000);
    return () => {
      clearTimeout(requestTimeout.current);
    };
  }, [query]);

  React.useEffect(() => {
    if (!delayedQuery) {
      return;
    }
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const req = await fetch(
          `https://lexica.art/api/v1/search?q=${delayedQuery}`
        );
        const data = await req.json();
        setData(data.images);
      } catch (e) {
        setError(e);
      }
      setIsLoading(false);
    }
    load();
  }, [delayedQuery]);

  return (
    <>
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
      <p>
        Search AI images with{' '}
        <a href="https://lexica.art/" target="_blank">
          https://lexica.art/
        </a>
      </p>
      <ImagesGrid
        shadowEnabled={false}
        images={data}
        getPreview={(item) => item.srcSmall}
        isLoading={isLoading}
        error={error}
        onSelect={async (item, pos, element) => {
          if (element && element.type === 'svg' && element.contentEditable) {
            element.set({ maskSrc: item.src });
            return;
          }

          const { width, height } = await getImageSize(item.srcSmall);

          if (element && element.type === 'image' && element.contentEditable) {
            const crop = getCrop(element, {
              width,
              height,
            });
            element.set({ src: item.src, ...crop });
            return;
          }

          const x = (pos?.x || store.width / 2) - width / 2;
          const y = (pos?.y || store.height / 2) - height / 2;
          store.activePage?.addElement({
            type: 'image',
            src: item.src,
            width,
            height,
            x,
            y,
          });
        }}
        rowsNumber={2}
      />
    </>
  );
});

const StableDiffusionPanel = observer(({ store }) => {
  const [selectedTabId, setSelectedTabId] = React.useState('search');
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Tabs
        id="TabsExample"
        defaultSelectedTabId="search"
        onChange={(tabId) => {
          setSelectedTabId(tabId);
        }}
      >
        <Tab id="search" title="Search" />
        <Tab id="generate" title="Generate" />
      </Tabs>
      <div
        style={{
          height: 'calc(100% - 20px)',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '20px',
        }}
      >
        {selectedTabId === 'search' && <SearchTab store={store} />}
        {selectedTabId === 'generate' && <GenerateTab store={store} />}
      </div>
    </div>
  );
});

// define the new custom section
export const StableDiffusionSection = {
  name: 'stable-diffusion',
  Tab: (props) => (
    <SectionTab name="AI Generated" {...props}>
      <FaBrain />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: StableDiffusionPanel,
};
