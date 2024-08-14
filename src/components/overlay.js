import { useState } from 'react';
import { getZoomMultiplier } from '../helper/positioningData'

export function Overlay({ imageObjectUrl, scale, onSetScale, onSetOffset, mapEvents }) {
    const [clientRect, setClientRect] = useState();
    const [imgSize, setImageSize] = useState();
    const [zoomMultiplier, setZoomMultiplier] = useState();
    const [addedEvents, setAddedEvents] = useState(false);

    if (!addedEvents) {
        mapEvents.addEventListener('move', (e) => {
            if (clientRect) {
                calculateAnchor(clientRect, map, map.getZoom(), onSetOffset);
            }
        });
        mapEvents.addEventListener('zoom', (e) => {
            const newZoomMultiplier = getZoomMultiplier(map.getZoom())
            setZoomMultiplier(newZoomMultiplier);
            onSetScale(scale * newZoomMultiplier);
        });
        mapEvents.addEventListener('load', (e) => {
            console.log(e);
            if (clientRect) {
                calculateAnchor(clientRect, mapEvents, mapEvents.getZoom(), onSetOffset);
            }
            const newZoomMultiplier = getZoomMultiplier(mapEvents.getZoom())
            setZoomMultiplier(newZoomMultiplier);
        });
        setAddedEvents(true);
    }
    const map = mapEvents;

    const imglog = (e) => {
        setImageSize({ width: e.target.width, height: e.target.height });
        calculateAnchor(e.target.getBoundingClientRect(), map, map.getZoom(), onSetOffset);
        setClientRect(e.target.getBoundingClientRect());

        const newZoomMultiplier = getZoomMultiplier(map.getZoom())
        setZoomMultiplier(newZoomMultiplier);

        var newScale = Math.min((window.innerWidth / 2) / e.target.width, 1);
        newScale = Math.min((window.innerHeight / 2) / e.target.height, newScale);
        console.log(newScale, newZoomMultiplier);
        onSetScale(newScale * newZoomMultiplier);
    }

    var style = {};
    if (imgSize && Math.max(imgSize.width, imgSize.height) * scale * zoomMultiplier > 1024) {
        style = { border: '4px solid red' };
    } else if (scale * zoomMultiplier < 1) {
        style = { border: '4px solid yellow' };
    } else if (scale * zoomMultiplier == 1) {
        style = { border: '4px solid green' }
    }
    if (imgSize) {
        style.width = imgSize.width * scale;
    }

    if (imageObjectUrl) {
        return <div className="overlay">
            <img id="overlayimg" src={imageObjectUrl} className="overlay-image" onLoad={imglog} style={style}></img>
        </div>
    } else {
        return <div></div>
    }

}


function calculateAnchor(boundingRect, map, zoom, setFinalOffset) {
    const b = boundingRect;
    const zoomMultiplier = getZoomMultiplier(zoom)
    const p = map.containerPointToLayerPoint({ x: b.x, y: b.y }).add(map.getPixelOrigin()).multiplyBy(zoomMultiplier);
    setFinalOffset(p);
}