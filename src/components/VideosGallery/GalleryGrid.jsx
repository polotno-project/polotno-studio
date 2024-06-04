import React from "react"
import { useGalleryFetcher, useVideos } from "./VideosContext"

/**
 * @typedef GalleryGridProps
 * @type {object}
 * @property {number?} cols
 * @property {React.PropsWithChildren} children
 * @returns {React.ReactComponentElement}
 */
export default function GalleryGrid({ cols = 1, children }) {
  const videos = useVideos()
  const { loadMore, isLoading, isReachingEnd } = useGalleryFetcher()

  const handleOnScroll = (evt) => {
    console.log(evt)

    if (!isReachingEnd && !isLoading) {
      const { offsetHeight, scrollHeight, scrollTop } = evt.target

      if (scrollHeight - scrollTop === offsetHeight) {
        loadMore()
      }
    }
  }

  return (
    <div
      onScroll={handleOnScroll}
      style={{
        width: "100%",
        maxWidth: "400px",
        height: "100%",
        display: "grid",
        gridTemplateColumns: "masonry",
        gridTemplateRows: "repeat(auto-fill, minmax(110px, 1fr))",
        overflowY: "auto",
        gap: "10px",
      }}
    >
      {children({ videos })}
    </div>
  )
}
