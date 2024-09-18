import React, { useCallback, useRef } from 'react';
import { registerNextDomDrop } from 'polotno/canvas/page';
import { Spinner } from '@blueprintjs/core';
import './video-grid.css';


export const VideoGrid = ({ items, onSelect, loadMore, isLoading, error, getCredit }) => {
    const observer = useRef(null);

    const lastPosElementRef = useCallback(
        (node) => {
            if (isLoading) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    loadMore(); // trigger loading
                }
            });

            if (node) observer.current.observe(node);
        },
        [isLoading]
    );

    if (error) {
        return <div>{error.message}</div>;
    }

    if (!items || items.length === 0) {
        return null;
    }

    const odds = items.filter((_, idx) => idx % 2 === 1);
    const evens = items.filter((_, idx) => idx % 2 === 0);


    return <div className="video-grid">
        {[odds, evens].map((col, idx) => (
            <div key={idx} className="video-grid__col">
                {col.map((item) =>
                    (<VideoItem key={item.id}
                                item={item}
                                onClick={() => onSelect(item)}
                                onDragStart={(e) => {
                                    registerNextDomDrop((pos, el) => {
                                        onSelect(item, pos, el);
                                    });
                                }}
                                onDragEnd={() => registerNextDomDrop(null)}
                                getCredit={getCredit}/>
                    ))}
                <div className="video-grid__loader" ref={lastPosElementRef}>{isLoading && <Spinner/>}</div>
            </div>
        ))}
    </div>;
};

const VideoItem = ({ item, onClick, onDragEnd, onDragStart, getCredit }) => {
    const videoRef = useRef(null);

    const onHover = () => {
        videoRef.current.play()?.catch(() => {
        });
    };

    const onLeave = () => {
        videoRef.current.pause()?.catch(() => {
        });
        videoRef.current.currentTime = 0;
    };

    const src = item.video_files.find((f) => f.quality === 'sd')?.link || '';

    if (!src) {
        return null;
    }

    const dateString = new Date(item.duration * 1000).toISOString();

    let duration;
    if (item.duration > 3600) {
        duration = dateString.substring(11, 19);
    } else {
        duration = dateString.substring(14, 19);
    }

    return (
        <div className="video-grid__item-wrapper">
            <div className="video-grid__item"
                 draggable
                 onClick={onClick}
                 onDragEnd={onDragEnd}
                 onDragStart={onDragStart}
                 onMouseEnter={onHover}
                 onMouseLeave={onLeave}>
                <video poster={item.image}
                       controls={false}
                       ref={videoRef}
                       muted
                       preload="none">
                    <source src={src}/>
                </video>
                <div className="video-grid__item-duration-wrapper">
                    <span
                        className="video-grid__item-duration">{duration}</span>
                </div>
                {getCredit && <div className="video-grid__item-credit">{getCredit(item)}</div>}
            </div>
        </div>
    );
};
