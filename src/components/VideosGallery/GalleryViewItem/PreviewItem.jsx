import React from "react"

/**
 * @typedef PreviewProps 
 * @type {object}
 * @property {string} image
 * @property {string?} alt
 * @property {string?} className
 * @returns {React.ReactComponentElement}
 */
export default function PreviewItem({
  image,
  alt = "",
  className = "",
}) {
  return (
    <div
      style={{
        position: "relative",
        textAlign: "center",
      }}
    >
      <img
        src={image}
        alt={alt}
        className={className}
        style={{
          objectFit: "fill",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  )
}