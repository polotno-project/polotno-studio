import React from "react"
import { useGalleryFetcher, useVideos } from "./VideosContext"

/**
 * @typedef ColumnProps
 * @type {object}
 * @property {number?} col
 * @property {number?} cols
 * @property {object[]} items
 * @property {React.PropsWithChildren} children
 * @returns {React.ReactComponentElement}
 */
function Column({ col, cols, items, children }) {
  const videos = items.filter((_, idx) => idx % cols === col)

  const w = (100 / cols).toFixed(2)
  return (
    <div
      style={{
        flex: `${w}%`,
        maxWidth: `${w}%`,
        padding: "0 8px",
      }}
    >
      {children({ videos })}
    </div>
  )
}

/**
 * @typedef GalleryColsProps
 * @type {object}
 * @property {number?} cols
 * @property {React.PropsWithChildren} children
 * @returns {React.ReactComponentElement}
 */
export default function GalleryCols({ cols = 1, children }) {
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
        height: "100%",
        display: "flex",
        flexWrap: "wrap",
        padding: "0 8px",
        overflowY: "auto",
      }}
    >
      {Array.from(Array(cols).keys()).map((col) => (
        <Column col={col} cols={cols} items={videos} children={children} />
      ))}
    </div>
  )
}
