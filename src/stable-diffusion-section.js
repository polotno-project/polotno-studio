import React from 'react';
import { observer } from 'mobx-react-lite';
import { InputGroup, Button } from '@blueprintjs/core';

import { SectionTab } from 'polotno/side-panel';
import { getKey } from 'polotno/utils/validate-key';
import { getImageSize } from 'polotno/utils/image';
import FaBrain from '@meronex/icons/fa/FaBrain';

import { ImagesGrid } from 'polotno/side-panel/images-grid';

const API = 'https://api.polotno.dev/api';

const StableDiffusionPanel = observer(({ store }) => {
  const inputRef = React.useRef(null);
  const [image, setImage] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setImage(null);
    fetch(
      `${API}/get-stable-diffusion?KEY=${getKey()}&prompt=${
        inputRef.current.value
      }`
    )
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        setImage(data.output[0]);
      })
      .catch((e) => {
        setLoading(false);
        console.error(e);
      });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
      <Button
        onClick={handleGenerate}
        intent="primary"
        loading={loading}
        style={{ marginBottom: '40px' }}
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
          // loadMore={loadMore}
        />
      )}
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
