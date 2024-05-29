import Masonry from "react-masonry-css";
import {Spinner} from "@blueprintjs/core";
import {useRef} from "react";
import useIntersectionObserver from "../hooks/use-intersection-observer";

const breakpointColumnsObj = {
    default: 2,
    1100: 2,
    700: 2,
    500: 1
};
const VideosGrid = (props) => {
    const {videos, onSelect, onMouseEnter, onMouseleave, onVideoLoaded, loadMore, isReachingEnd, isLoading} = props
    const loadMoreRef = useRef();

    useIntersectionObserver({
        target: loadMoreRef,
        onIntersect: loadMore,
        enabled: isReachingEnd,
        isLoading: isLoading
    });
    return (
        <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
        >
            {videos?.map((videoItem, index) => {
                return (
                <div style={{ padding: '5px', width: '100%' }} key={videoItem.id}>
                    <div
                        onClick={() => onSelect(videoItem)}
                        onMouseEnter={(e) => onMouseEnter(e, videoItem)}
                        ref={loadMoreRef}
                        onMouseLeave={onMouseleave}
                        style={{ cursor: 'pointer', borderRadius: '5px', position: 'relative', overflow: 'hidden' }}
                    >
                        <img
                            crossOrigin="anonymous"
                            src={videoItem.image}
                            alt="Thumbnail"
                            style={{ width: '100%', display: 'block', maxHeight: '300px', objectFit: 'contain', boxShadow: '0 0 5px rgba(16, 22, 26, 0.3)' }}
                        />
                        <video
                            crossOrigin="anonymous"
                            style={{ width: '100%', height: '100%', position: 'absolute', top: '0', left: '0', display: 'none', objectFit: 'cover' }}
                            src={videoItem.video_files.find((f) => f.quality === 'hd')?.link || videoItem.video_files[0].link}
                            type="video/mp4"
                            muted
                            playsInline
                            autoPlay
                            loop
                            onLoadedData={onVideoLoaded}
                        />
                        <div className='video-minutes' style={{ position: 'absolute', bottom: '10px', right: '10px', color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.7)', padding: '5px', display: 'none' }}></div>
                    </div>
                </div>
                )
            })}
            {isLoading && Array.from({ length: breakpointColumnsObj.default }).map((_, idx) => (
                <div key={idx} style={{ width: '100%' }}><Spinner /></div>
            ))}
        </Masonry>
    )
}
export default VideosGrid
