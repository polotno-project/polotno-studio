import React from "react";
import { InputGroup } from "@blueprintjs/core";
import { SectionTab } from "polotno/side-panel";
import { useInfiniteAPI } from "polotno/utils/use-api";
import { t } from "polotno/utils/l10n";
import { Video } from "@blueprintjs/icons";
import { selectVideo } from "polotno/side-panel/select-video";
import { VideosGallery, VideosGalleryItem } from "../components/VideosGallery";

// this is a demo key just for that project
// (!) please don't use it in your projects
// to create your own API key please go here: https://polotno.com/login
const key = "nFA5H9elEytDyPyvKL7T";

// use Polotno API proxy into Pexels
// WARNING: don't use on production! Use your own proxy and Pexels API key
const API = "https://api.polotno.com/api/pexels/videos";

const getPexelsVideoAPI = ({ query, page }) =>
  `${API}/${
    query ? "search" : "popular"
  }?query=${query}&per_page=20&page=${page}&KEY=${key}`;

export const VideosPanel = ({ store }) => {
  const { setQuery, loadMore, isReachingEnd, data, isLoading, error } =
    useInfiniteAPI({
      defaultQuery: "",
      getAPI: ({ page, query }) => getPexelsVideoAPI({ page, query }),
      getSize: (lastResponse) =>
        lastResponse.total_results / lastResponse.per_page,
    });

  const handleOnSelect = (evt, video) => {
    const targetHDVideoFile = video.video_files.find(
      ({ quality }) => quality === "hd"
    );

    if (targetHDVideoFile) {
      const { link: src } = targetHDVideoFile;
      const targetElement = evt.targetElement;
      const droppedPos = { x: 0, y: 0 };

      selectVideo({ src, targetElement, droppedPos, store });
    }
  };

  const handleClickOnUserLink = (evt) => {
    evt.preventDefault();
    evt.stopPropagation();

    if (evt.currentTarget.href) {
      window.open(evt.currentTarget?.href, "_blank");
    }
  };

  const placeholder = t("sidePanel.searchPlaceholder");

  const videos = (data || []).reduce(
    (acc, { videos = [] } = {}) => acc.concat(...videos),
    []
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      <InputGroup
        leftIcon="search"
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
        }}
        type="search"
        style={{
          marginBottom: "20px",
        }}
      />
      <p style={{ textAlign: "center" }}>
        Videos by{" "}
        <a href="https://www.pexels.com/" target="_blank">
          Pexels
        </a>
      </p>
      <div
        style={{
          flexGrow: "grow",
          overflow: "hidden",
          height: "100%",
          padding: "8px 0",
        }}
      >
        <VideosGallery
          videos={videos}
          fetcher={{
            isLoading,
            isReachingEnd,
            loadMore,
          }}
        >
          <VideosGallery.Cols cols={2}>
            {({ videos }) => (
              <>
                {videos.map((video) => (
                  <div
                    style={{ marginTop: "8px", position: "relative" }}
                    key={video.id}
                  >
                    <VideosGalleryItem id={video.id} onSelect={handleOnSelect}>
                      {({ hovered }) => (
                        <>
                          {hovered && (
                            <div
                              style={{
                                position: "absolute",
                                width: "100%",
                                bottom: 0,
                                background: "rgba(0,0,0,.3)",
                                zIndex: "20",
                              }}
                            >
                              <div>
                                <p style={{ textAlign: "center" }}>
                                  <a
                                    href={video.user.url}
                                    target="_blank"
                                    onClick={handleClickOnUserLink}
                                  >
                                    {video.user.name}
                                  </a>
                                </p>
                              </div>
                            </div>
                          )}
                          {hovered && (
                            <VideosGalleryItem.Video
                              url={video.video_files[0].link}
                              image={video.image}
                            />
                          )}
                          {!hovered && (
                            <VideosGalleryItem.Preview
                              image={video.image}
                              alt={`preview ${video.image}`}
                            />
                          )}
                        </>
                      )}
                    </VideosGalleryItem>
                  </div>
                ))}
              </>
            )}
          </VideosGallery.Cols>
        </VideosGallery>
        {isLoading && (
          <div>
            <span>Loadinng ...</span>
          </div>
        )}
      </div>
    </div>
  );
};

// define the new custom section
export const VideosSection = {
  name: "videos",
  Tab: (props) => (
    <SectionTab name="Videos" {...props}>
      <Video />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: VideosPanel,
};
