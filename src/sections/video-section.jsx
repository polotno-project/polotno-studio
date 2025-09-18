import React from 'react';
import { InputGroup } from '@blueprintjs/core';
import { ImagesGrid } from 'polotno/side-panel/images-grid';
import { SectionTab } from 'polotno/side-panel';
import { useInfiniteAPI } from 'polotno/utils/use-api';
import { t } from 'polotno/utils/l10n';
import { Video } from '@blueprintjs/icons';
import { selectVideo } from 'polotno/side-panel/select-video';
import { getKey } from 'polotno/utils/validate-key';

// use Polotno API proxy into Pexels
// WARNING: don't use on production! Use your own proxy and Pexels API key
const API = 'https://api.polotno.com/api/pexels/videos';

const getPexelsVideoAPI = ({ query, page }) =>
  `${API}/${
    query ? 'search' : 'popular'
  }?query=${query}&per_page=20&page=${page}&KEY=${getKey()}`;

export const VideosPanel = ({ store }) => {
  const { setQuery, loadMore, isReachingEnd, data, isLoading, error } =
    useInfiniteAPI({
      defaultQuery: '',
      getAPI: ({ page, query }) => getPexelsVideoAPI({ page, query }),
      getSize: (lastResponse) =>
        lastResponse.total_results / lastResponse.per_page,
    });

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
      <p style={{ textAlign: 'center' }}>
        Videos by{' '}
        <a href="https://www.pexels.com/" target="_blank">
          Pexels
        </a>
      </p>
      <ImagesGrid
        images={data
          ?.map((item) => item.videos)
          .flat()
          .filter(Boolean)}
        getPreview={(image) => image.image}
        onSelect={async (image, pos, element) => {
          const src =
            image.video_files.find((f) => f.quality === 'hd')?.link ||
            image.video_files[0].link;

          selectVideo({
            src,
            store,
            droppedPos: pos,
            targetElement: element,
          });
        }}
        isLoading={isLoading}
        error={error}
        loadMore={!isReachingEnd && loadMore}
        getCredit={(image) => (
          <span>
            Video by{' '}
            <a href={image.user.url} target="_blank" rel="noreferrer">
              {image.user.name}
            </a>{' '}
            on{' '}
            <a
              href="https://pexels.com/?utm_source=polotno&utm_medium=referral"
              target="_blank"
              rel="noreferrer noopener"
            >
              Pexels
            </a>
          </span>
        )}
      />
    </div>
  );
};

// define the new custom section
export const VideosSection = {
  name: 'videos',
  Tab: (props) => (
    <SectionTab name="Videos" {...props}>
      <Video />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: VideosPanel,
};
