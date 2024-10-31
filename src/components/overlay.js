import { useState, useEffect, useRef } from 'react';
import { getZoomMultiplier } from '../helper/positioningData'

export function Overlay({ map, imageObjectUrl, imgSize, scale, onSetScale, onSetOffset, onSetImgSize }) {
    const [clientRect, setClientRect] = useState();
    const zoomMultiplier = getZoomMultiplier(map.getZoom());
    const imageElement = useRef(null);

    useEffect(() => {
    const onMove = () => {
        if (clientRect) {
            calculateAnchor(clientRect, map, onSetOffset);
        }
    }

        map.on('move', onMove)
            .on('moveend', onMove);

        return () => {
            map.off('move', onMove)
                .off('moveend', onMove);
        }
    }, [map, clientRect, onSetOffset]);

    useEffect(() => {
    const onResize = () => {
        if (imageElement.current) {
            const cr = imageElement.current.getBoundingClientRect();
            setClientRect(cr);
            calculateAnchor(cr, map, onSetOffset);
        }
    }
    
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
        }
    }, [map, onSetOffset])

    const imglog = (e) => {
        onSetImgSize({ width: e.target.naturalWidth, height: e.target.naturalHeight });
        calculateAnchor(e.target.getBoundingClientRect(), map, onSetOffset);
        setClientRect(e.target.getBoundingClientRect());

        var newScale = Math.min((window.innerWidth / 2) / e.target.naturalWidth, 1);
        newScale = Math.min((window.innerHeight / 2) / e.target.naturalHeight, newScale);
        console.log(newScale, zoomMultiplier);
        onSetScale(newScale);
    }
    const imgResize = (e) => {
        calculateAnchor(e.target.getBoundingClientRect(), map, onSetOffset);
        setClientRect(e.target.getBoundingClientRect());
    }

    if (!imageObjectUrl || !map) {
        return null;
    }

    var style = {};
    if (imgSize && Math.max(imgSize.width, imgSize.height) * scale * zoomMultiplier > 1024) {
        style = { borderColor: 'rgba(249, 67, 67, 0.67)' };
    } else if (scale * zoomMultiplier < 1) {
        style = { borderColor: 'rgba(255, 206, 58, 0.67)' };
    } else if (scale * zoomMultiplier === 1) {
        style = { borderColor: 'rgba(129, 227, 30, 0.67)' }
    } else {
        style = { borderColor: 'rgba(255, 206, 58, 0.67)' }
    }

    return <div className="overlay" style={style}>
        <img
            id="overlayimg"
            src={imageObjectUrl}
            className="overlay-image"
            onLoad={imglog}
            onTransitionEnd={imgResize}
            alt='user provided'
            ref={imageElement}
            style={imgSize ? { width: imgSize.width * scale } : {}}
        ></img>
    </div>

}

function calculateAnchor(boundingRect, map, setFinalOffset) {
    const b = boundingRect;
    const zoomMultiplier = getZoomMultiplier(map.getZoom());
    const p = map.containerPointToLayerPoint({ x: b.x, y: b.y }).add(map.getPixelOrigin()).multiplyBy(zoomMultiplier);
    setFinalOffset(p);
}