import React, { useCallback, useEffect, useRef, useState } from "react"

import { useVideo } from "../VideosContext"

import VideoItem from "./VideoItem"
import PreviewItem from "./PreviewItem"

const DEFAULT_HOVER_TIME = 500
/**
 * Convert duration to timestamp.
 * @param {number} duration
 */

/**
 * @typedef VideoGridItemProps
 * @type object
 * @property {number} id
 * @property {number?} hoverTimer
 * @property {Function} onSelect
 * @property {React.PropsWithChildren} children
 * @returns React.JSXElement
 */
export default function GalleryViewItem({
  id,
  hoverTimer = DEFAULT_HOVER_TIME,
  onSelect,
  children,
}) {
  /** @type {React.MutableRefObject<NodeJS.Timeout|null>} timer */
  let timer = useRef(null)

  const [hovered, setHovered] = useState(false)
  const video = useVideo(id)

  // As a fallback, stop playing after 20 secs.
  useEffect(() => {
    setTimeout(() => {
      setHovered(false)
      if (timer.current) {
        clearTimeout(timer.current)
      }
    }, 20 * 1000)
  }, [])

  const handleMouseOver = () => {
    if (!timer.current) {
      timer.current = setTimeout(() => {
        setHovered(true)

        timer.current = null
      }, hoverTimer)
    }
  }

  const handleMouseLeave = () => {
    if (timer.current) {
      clearTimeout(timer.current)

      timer.current = null
    }
    if (hovered) {
      setHovered(false)
    }
  }

  const handleOnClick = useCallback(
    (evt) => {
      evt.preventDefault()

      onSelect(evt, video)
    },
    [video]
  )

  return (
    <div
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      onClick={handleOnClick}
      style={{
        backgroundColor: "black",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        borderRadius: "8px",
        width: "100%",
        height: "100%",
        maxHeight: "300px",
        minHeight: "60px",
      }}
    >
      {!children && (
        <PreviewItem image={video?.image} alt={`Preview ${video?.image}`} />
      )}
      {children &&
        (typeof children === "function" ? children({ hovered }) : children)}
    </div>
  )
}

GalleryViewItem.Video = VideoItem
GalleryViewItem.Preview = PreviewItem
