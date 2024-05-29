import React, {useCallback} from 'react';
import { InputGroup } from '@blueprintjs/core';
import { SectionTab } from 'polotno/side-panel';
import { useInfiniteAPI } from 'polotno/utils/use-api';
import { t } from 'polotno/utils/l10n';
import { Video } from '@blueprintjs/icons';
import { selectVideo } from 'polotno/side-panel/select-video';
import VideosGrid from "../components/video-grid";

// this is a demo key just for that project
// (!) please don't use it in your projects
// to create your own API key please go here: https://polotno.com/login
const key = 'nFA5H9elEytDyPyvKL7T';

// use Polotno API proxy into Pexels
// WARNING: don't use on production! Use your own proxy and Pexels API key
const API = 'https://api.polotno.com/api/pexels/videos';

const getPexelsVideoAPI = ({ query, page }) =>
  `${API}/${
    query ? 'search' : 'popular'
  }?query=${query}&per_page=20&page=${page}&KEY=${key}`;

export const VideosPanel = ({ store }) => {
  const { setQuery, loadMore, isReachingEnd, data, isLoading, error } =
    useInfiniteAPI({
      defaultQuery: '',
      getAPI: ({ page, query }) => getPexelsVideoAPI({ page, query }),
      getSize: (lastResponse) =>
        lastResponse.total_results / lastResponse.per_page,
    });

  const handleSelectVideo = useCallback((video) => {
        const src = video.video_files.find((f) => f.quality === 'hd')?.link || video.video_files[0].link;
        selectVideo({ src, store });
    }, []);
    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleMouseEnter = useCallback((event, video) => {
        const videoElement = event.currentTarget.querySelector('video');
        const videoMinutesDiv = event.currentTarget.querySelector('.video-minutes');
        videoElement.style.display = 'flex';
        videoMinutesDiv.innerText = formatDuration(video.duration);
        videoMinutesDiv.style.display = 'block';
        if (videoElement.dataset.ready === 'true') {
            videoElement.currentTime = 0;
            videoElement.play().catch(error => {
                console.error('Play was interrupted:', error);
                videoElement.pause();
            });
        }
    }, []);

    const handleMouseLeave = useCallback((event) => {
        const videoElement = event.currentTarget.querySelector('video');
        const videoMinutesDiv = event.currentTarget.querySelector('.video-minutes');
        videoMinutesDiv.innerText = '';
        videoMinutesDiv.style.display = 'none';
        videoElement.pause();
        videoElement.style.display = 'none';
    }, []);

    const handleVideoLoaded = useCallback((event) => {
        event.target.dataset.ready = 'true';
    }, []);

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
        <VideosGrid
              videos={data
                ?.map((item) => item.videos)
                .flat()
                .filter(Boolean)}
              onSelect={handleSelectVideo}
              loadMore={loadMore}
              isReachingEnd={isReachingEnd}
              onMouseEnter={handleMouseEnter}
              onMouseleave={handleMouseLeave}
              onVideoLoaded={handleVideoLoaded}
              isLoading={isLoading}

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
