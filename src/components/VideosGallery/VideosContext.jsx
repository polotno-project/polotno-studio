import React, { createContext, useContext, useMemo, useState } from 'react'

/**
 * @typedef Video
 * @type {object}
 * @property {string} image
 * @property {number} id
 */
/**
 * @typedef VideosContext
 * @type object
 * @property {Video[]} videos
 * @property {{
 *  loadMore: Function
 * }} fetcher
 */
const ctx = {
  videos: [],
  fetcher: {
    loadMore: () => {}
  }
}

const VideosContext = createContext(ctx)

export default function VideosContextProvider({ videos, fetcher, children }) {
  const values = useMemo(() => ({
    videos,
    fetcher,
  }), [videos])

  return (
    <VideosContext.Provider value={values}>{children}</VideosContext.Provider>
  )
}

export function useVideos() {
  const { videos } = useContext(VideosContext)

  return videos 
}

/**
 * @param {number} id 
 * @returns {Video|undefined}
 */
export function useVideo(id) {
  /** @type {{ videos: Video[]}}  */
  const { videos } = useContext(VideosContext)

  const video = videos.find((video) => video.id === id)

  return video 
}

export function useGalleryFetcher() {
  const { fetcher } = useContext(VideosContext)

  return fetcher
}