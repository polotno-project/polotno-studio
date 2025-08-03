import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@blueprintjs/core';
import { PostProcessModal } from './postprocess';

export const PostProcessButton = observer(({ store }) => {
  const [postProcessModalOpen, setPostProcessModalOpen] = React.useState(false);
  const [exportedImageUrl, setExportedImageUrl] = React.useState(null);
  const [quality, setQuality] = React.useState(1);
  const [type, setType] = React.useState('png');

  const getName = () => {
    const texts = [];
    store.pages.forEach((p) => {
      p.children.forEach((c) => {
        if (c.type === 'text') {
          texts.push(c.text);
        }
      });
    });
    const allWords = texts.join(' ').split(' ');
    const words = allWords.slice(0, 6);
    return words.join(' ').replace(/\s/g, '-').toLowerCase() || 'polotno';
  };

  const handlePostProcess = async () => {
    try {
      // Generate the image preview for the current page
      const url = await store.toDataURL({
        pageId: store.activePage.id,
        pixelRatio: quality,
        mimeType: 'image/' + type,
      });

      // Save the exported image URL for the modal
      setExportedImageUrl(url);

      // Open the post-processing modal
      setPostProcessModalOpen(true);
    } catch (e) {
      console.error('Error generating preview for post-processing:', e);
      alert('Failed to generate image for post-processing. Please try again.');
    }
  };

  return (
    <>
      <Button onClick={handlePostProcess} style={{ marginRight: '10px' }}>
        Beautify
      </Button>

      <PostProcessModal
        isOpen={postProcessModalOpen}
        onClose={() => setPostProcessModalOpen(false)}
        imageUrl={exportedImageUrl}
        imageType={type}
        imageName={getName()}
      />
    </>
  );
});
