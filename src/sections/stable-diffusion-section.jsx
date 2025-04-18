import React from 'react';
import { observer } from 'mobx-react-lite';
import { InputGroup, Button, HTMLSelect, ButtonGroup } from '@blueprintjs/core';
import { Clean, Plus } from '@blueprintjs/icons';

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
  const promptRef = React.useRef(null);
  const negativePromptRef = React.useRef(null);
  const [images, setImages] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const { credits, consumeCredits } = useCredits('stableDiffusionCredits', 10);
  const [model, setModel] = React.useState('stable-diffusion');
  const [aspectRatio, setAspectRatio] = React.useState('square');
  const [imageStyle, setImageStyle] = React.useState('auto');
  const [imagesCount, setImagesCount] = React.useState(1);
  const [showInputImage, setShowInputImage] = React.useState(false);
  const [showNegativePrompt, setShowNegativePrompt] = React.useState(false);

  // Style definitions with their respective prompts
  const styles = {
    auto: { emoji: '🤖', promptSuffix: '' },
    photorealistic: {
      emoji: '📷',
      promptSuffix:
        ', photorealistic, highly detailed, 8k resolution, professional photography',
    },
    painting: {
      emoji: '🎨',
      promptSuffix:
        ', digital painting, artstation, detailed, oil painting style, vibrant colors',
    },
    anime: {
      emoji: '🌸',
      promptSuffix:
        ', anime style, manga illustration, clean lines, colorful, studio ghibli inspired',
    },
  };

  const handleGenerate = async () => {
    if (credits <= 0) {
      alert('You have no credits left');
      return;
    }
    setLoading(true);
    setImages([]);

    // Get base prompt from input
    const basePrompt = promptRef.current.value;

    // Add style to the prompt if not 'auto'
    const stylizedPrompt =
      imageStyle === 'auto'
        ? basePrompt
        : basePrompt + styles[imageStyle].promptSuffix;

    // Construct API URL with all parameters
    let apiUrl = `${getAPI()}/get-stable-diffusion?KEY=${getKey()}&prompt=${encodeURIComponent(
      stylizedPrompt
    )}`;

    // Add aspect ratio parameter
    if (aspectRatio === 'landscape') {
      apiUrl += '&width=1024&height=768';
    } else if (aspectRatio === 'portrait') {
      apiUrl += '&width=768&height=1024';
    } else {
      // Square is default
      apiUrl += '&width=768&height=768';
    }

    // Add negative prompt if available
    if (
      showNegativePrompt &&
      negativePromptRef.current &&
      negativePromptRef.current.value
    ) {
      apiUrl += `&negative_prompt=${encodeURIComponent(
        negativePromptRef.current.value
      )}`;
    }

    // Add number of images
    apiUrl += `&n=${imagesCount}`;

    try {
      const req = await fetch(apiUrl);
      setLoading(false);

      if (!req.ok) {
        alert('Something went wrong, please try again later...');
        return;
      }

      consumeCredits(imagesCount); // Consume credits based on image count
      const data = await req.json();
      setImages(data.output || []);
    } catch (error) {
      setLoading(false);
      alert('Error generating images: ' + error.message);
    }
  };

  return (
    <>
      <div style={{ height: '40px', paddingTop: '5px', fontWeight: 'bold' }}>
        Generate images with AI
      </div>

      {/* Model Selection */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Choose a model
        </label>
        <HTMLSelect
          fill
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          <option value="stable-diffusion">Stable Diffusion</option>
        </HTMLSelect>
      </div>

      {/* Input Image Option */}
      {/* <div style={{ marginBottom: '15px' }}>
        <a
          href="#"
          style={{ color: '#4a90e2', textDecoration: 'none' }}
          onClick={(e) => {
            e.preventDefault();
            setShowInputImage(!showInputImage);
          }}
        >
          <Plus size={14} style={{ marginRight: '5px' }} />
          Add input image (optional)
        </a>
        {showInputImage && (
          <div style={{ marginTop: '10px' }}>
            <Button intent="primary" text="Upload image" minimal small />
          </div>
        )}
      </div> */}

      {/* Prompt Input */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Your prompt
        </label>
        <InputGroup
          placeholder="Type your prompt here"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleGenerate();
            }
          }}
          style={{ marginBottom: '5px' }}
          inputRef={promptRef}
        />
      </div>

      {/* Style Selection */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Image style
        </label>
        <ButtonGroup fill style={{ display: 'flex' }}>
          <Button
            text={`${styles.auto.emoji} Auto`}
            active={imageStyle === 'auto'}
            style={{ flex: 1, maxWidth: '25%', borderRadius: 0 }}
            onClick={() => setImageStyle('auto')}
          />
          <Button
            text={`${styles.photorealistic.emoji} Photo`}
            active={imageStyle === 'photorealistic'}
            style={{ flex: 1, maxWidth: '25%', borderRadius: 0 }}
            onClick={() => setImageStyle('photorealistic')}
          />
          <Button
            text={`${styles.painting.emoji} Art`}
            active={imageStyle === 'painting'}
            style={{ flex: 1, maxWidth: '25%', borderRadius: 0 }}
            onClick={() => setImageStyle('painting')}
          />
          <Button
            text={`${styles.anime.emoji} Anime`}
            active={imageStyle === 'anime'}
            style={{ flex: 1, maxWidth: '25%', borderRadius: 0 }}
            onClick={() => setImageStyle('anime')}
          />
        </ButtonGroup>
      </div>

      {/* Negative Prompt Option */}
      {/* <div style={{ marginBottom: '15px' }}>
        <a
          href="#"
          style={{ color: '#4a90e2', textDecoration: 'none' }}
          onClick={(e) => {
            e.preventDefault();
            setShowNegativePrompt(!showNegativePrompt);
          }}
        >
          <Plus size={14} style={{ marginRight: '5px' }} />
          Add negative prompt (optional)
        </a>
        {showNegativePrompt && (
          <div style={{ marginTop: '10px' }}>
            <InputGroup
              placeholder="Enter things to exclude from the image"
              inputRef={negativePromptRef}
            />
          </div>
        )}
      </div> */}

      {/* Aspect Ratio Selection */}
      {/* <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Aspect ratio
        </label>
        <ButtonGroup fill style={{ display: 'flex' }}>
          <Button
            text="Square"
            active={aspectRatio === 'square'}
            style={{ flex: 1, maxWidth: '33.3%', borderRadius: 0 }}
            onClick={() => setAspectRatio('square')}
          />
          <Button
            text="Landscape"
            active={aspectRatio === 'landscape'}
            style={{ flex: 1, maxWidth: '33.3%', borderRadius: 0 }}
            onClick={() => setAspectRatio('landscape')}
          />
          <Button
            text="Portrait"
            active={aspectRatio === 'portrait'}
            style={{ flex: 1, maxWidth: '33.3%', borderRadius: 0 }}
            onClick={() => setAspectRatio('portrait')}
          />
        </ButtonGroup>
      </div> */}

      {/* Images Count Selection */}
      {/* <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Images to generate
        </label>
        <ButtonGroup fill style={{ display: 'flex' }}>
          <Button
            text="1"
            active={imagesCount === 1}
            style={{ flex: 1, maxWidth: '25%', borderRadius: 0 }}
            onClick={() => setImagesCount(1)}
          />
          <Button
            text="2"
            active={imagesCount === 2}
            style={{ flex: 1, maxWidth: '25%', borderRadius: 0 }}
            onClick={() => setImagesCount(2)}
          />
          <Button
            text="3"
            active={imagesCount === 3}
            style={{ flex: 1, maxWidth: '25%', borderRadius: 0 }}
            onClick={() => setImagesCount(3)}
          />
          <Button
            text="4"
            active={imagesCount === 4}
            style={{ flex: 1, maxWidth: '25%', borderRadius: 0 }}
            onClick={() => setImagesCount(4)}
          />
        </ButtonGroup>
      </div> */}

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        intent="primary"
        loading={loading}
        style={{ width: '100%', marginBottom: '20px', borderRadius: '4px' }}
        disabled={credits <= 0}
      >
        Generate
      </Button>

      <p style={{ textAlign: 'center', marginBottom: '20px' }}>
        {credits > 0 ? (
          <span>
            {credits} credits left —{' '}
            {/* <a href="#" style={{ color: '#4a90e2' }}>
              Upgrade now
            </a> */}
          </span>
        ) : (
          <span>
            You have no credits.{' '}
            {/* <a href="#" style={{ color: '#4a90e2' }}>
              Upgrade now
            </a> */}
          </span>
        )}
      </p>

      {/* Generated Images Grid */}
      {images.length > 0 && (
        <ImagesGrid
          shadowEnabled={false}
          images={images}
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
          rowsNumber={imagesCount > 2 ? 2 : 1}
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
