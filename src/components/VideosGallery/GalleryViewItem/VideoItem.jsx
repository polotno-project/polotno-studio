import React, { useState } from "react"
import { timestamp } from "./utils"

/**
 * @typedef VideoElementProps
 * @type object
 * @property {string} url
 * @property {string} image
 * @property {boolean?} muted
 * @returns React.JSXElement
 */
export default function VideoItem({ url, image, muted = true }) {
  const [duration, setDuration] = useState(0)

  const handleOnMetadataLoad = (evt) => {
    const { duration } = evt.target

    setDuration(duration)
  }
  return (
    <div
      style={{
        position: "relative",
        textAlign: "center",
      }}
    >
      {/* Display Metadata on overlay. */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.2)",
          zIndex: 10
        }}
      >
        {/* Display the timestamp for the video */}
        {!!duration && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
            }}
          >
            <span
              style={{
                fontSize: "10px",
              }}
            >
              {timestamp(duration)}
            </span>
          </div>
        )}
      </div>

      <video
        src={url}
        poster={image}
        autoPlay
        loop
        muted={muted}
        style={{
          objectFit: "fill",
          width: "100%",
          height: "100%",
        }}
        onLoadedMetadata={handleOnMetadataLoad}
      />
    </div>
  )
}
