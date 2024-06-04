import React from "react"

import GalleryGrid from "./GalleryGrid"
import GalleryViewItem from './GalleryViewItem'

import VideosContextProvider from "./VideosContext"
import GalleryCols from "./GalleryCols"
/**
 * @typedef GalleryViewProps
 * @type {object}
 * @property {object[]} vidoes
 * @property {{
 *  isLoading: boolean
 *  isReachingEnd: boolean
 *  loadMore: Function
 * }} fetcher
 * @property {React.PropsWithChildren} children 
 * @returns React.JSXElement
 */
export default function GalleryView({ videos, fetcher, children }) {
  return (
    <VideosContextProvider videos={videos} fetcher={fetcher}>
      {children}
    </VideosContextProvider>
  )
}

GalleryView.Grid = GalleryGrid
GalleryView.Cols = GalleryCols
GalleryView.Item = GalleryViewItem
