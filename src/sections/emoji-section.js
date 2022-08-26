import React from 'react';
import { observer } from 'mobx-react-lite';
import { InputGroup } from '@blueprintjs/core';
import { isAlive } from 'mobx-state-tree';

import { useInfiniteAPI } from 'polotno/utils/use-api';
import { urlToBase64, svgToURL } from 'polotno/utils/svg';
import { SectionTab } from 'polotno/side-panel';
import { getKey } from 'polotno/utils/validate-key';
import { getImageSize } from 'polotno/utils/image';
import EnEmojiHappy from '@meronex/icons/en/EnEmojiHappy';

import { ImagesGrid } from 'polotno/side-panel/images-grid';

const API = '';

const itemToURL = (item) => {
  return API + '/twemoji/' + item.unicode.codePointAt(0).toString(16) + '.svg';
};

export const EmojiPanel = observer(({ store }) => {
  // load data
  const [index, setIndex] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState('monkey');

  React.useEffect(() => {
    async function run() {
      setLoading(true);
      const req = await fetch(API + '/twemoji/index.json');
      const json = await req.json();
      setIndex(json);
      setLoading(false);
    }
    run();
  }, []);

  const images = [];

  if (query) {
    index.forEach(({ emojiList }) => {
      emojiList.forEach(({ unicode, tags }) => {
        const str = tags.join('');
        if (str.includes(query)) {
          images.push({
            unicode,
            tags,
          });
        }
      });
    });
  } else if (index.length) {
    images.push(...index[0]?.emojiList.slice(0, 20));
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <InputGroup
        leftIcon="search"
        placeholder="Search..."
        onChange={(e) => {
          setQuery(e.target.value);
        }}
        type="search"
        value={query}
        style={{
          marginBottom: '20px',
        }}
      />
      <ImagesGrid
        shadowEnabled={false}
        images={images}
        getPreview={itemToURL}
        isLoading={loading}
        onSelect={async (item, pos, element) => {
          const url = await itemToURL(item);
          if (element && element.type === 'image' && !element.locked) {
            const base64 = await urlToBase64(url);
            element.set({ clipSrc: base64 });
            return;
          }
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
            const base64 = await urlToBase64(url);
            if (isAlive(svg)) {
              await svg.set({ src: base64 });
            }
          });
        }}
        rowsNumber={4}
      />
    </div>
  );
});

// define the new custom section
export const EmojiSection = {
  name: 'emoji',
  Tab: (props) => (
    <SectionTab name="Emoji" {...props}>
      <EnEmojiHappy />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: EmojiPanel,
};
