import React from 'react';
import { observer } from 'mobx-react-lite';
import { InputGroup, Button } from '@blueprintjs/core';
import { Tab, Tabs } from '@blueprintjs/core';
import { Clean } from '@blueprintjs/icons';

import { SectionTab } from 'polotno/side-panel';
import { getKey } from 'polotno/utils/validate-key';
import { getImageSize } from 'polotno/utils/image';
import { t } from 'polotno/utils/l10n';

import { ImagesGrid } from 'polotno/side-panel/images-grid';
import { useCredits } from '../credits';
import { getCrop } from 'polotno/utils/image';
import { useProject } from '../project';
import { getAPI } from 'polotno/utils/api';

const GenerateTab = observer(({ store }) => {
  const project = useProject();
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
      `${getAPI()}/get-stable-diffusion?KEY=${getKey()}&prompt=${
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
        {!!credits && <span>You have ({credits}) credits.</span>}
        {!credits && (
          <span>You have no credits. They will renew tomorrow.</span>
        )}
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

const StableDiffusionPanel = observer(({ store }) => {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <GenerateTab store={store} />
    </div>
  );
});

// define the new custom section
export const StableDiffusionSection = {
  name: 'stable-diffusion',
  Tab: (props) => (
    <SectionTab name="AI Img" {...props}>
      <Clean />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: StableDiffusionPanel,
};
