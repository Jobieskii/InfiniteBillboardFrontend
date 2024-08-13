import { useMapEvents, useMap } from "react-leaflet";
import { useState } from 'react';

export function Overlay({ file, setFinalScale, setFinalOffset }) {
    const [xOffset, setXOffset] = useState();
    const [yOffset, setYOffset] = useState();
    const [clientRect, setClientRect] = useState();
    const [imgSize, setImageSize] = useState();
    const [scale, setScale] = useState();
    const [zoomMultiplier, setZoomMultiplier] = useState();

    const map = useMapEvents({
        load: (e) => {
            console.log(e);
            if (clientRect) {
                calculateAnchor(clientRect, map, map.getZoom(), setXOffset, setYOffset, setFinalOffset);
            }
            const trueZoom = 3;
            const newZoomMultiplier = Math.pow(2, trueZoom - map.getZoom());
            setZoomMultiplier(newZoomMultiplier);
        },
        move: (e) => {
            if (clientRect) {
                calculateAnchor(clientRect, map, map.getZoom(), setXOffset, setYOffset, setFinalOffset);
            }
        },
        zoom: (e) => {
            const trueZoom = 3;
            const newZoomMultiplier = Math.pow(2, trueZoom - map.getZoom());
            setZoomMultiplier(newZoomMultiplier);
            setFinalScale(scale * newZoomMultiplier);
        }
    });

    const imglog = (e) => {
        setImageSize({width: e.target.width, height: e.target.height});
        calculateAnchor(e.target.getBoundingClientRect(), map, map.getZoom(), setXOffset, setYOffset, setFinalOffset);
        setClientRect(e.target.getBoundingClientRect());

        const trueZoom = 3;
        const newZoomMultiplier = Math.pow(2, trueZoom - map.getZoom());
        setZoomMultiplier(newZoomMultiplier);

        const maxDim = Math.max(e.target.width, e.target.height);
        if (maxDim > 1024) {
            setScale(512/(zoomMultiplier, maxDim));
        } else {
            setScale(1);
        }
        console.log(scale, zoomMultiplier);
        setFinalScale(scale * zoomMultiplier);
    }
    
    var style = {};
    if (imgSize && Math.max(imgSize.width, imgSize.height) * scale * zoomMultiplier > 1024) {
        style = {border: '4px solid red'};
    } else if (scale * zoomMultiplier < 1) {
        style = {border: '4px solid yellow'};
    } else if (scale * zoomMultiplier == 1) {
        style = {border: '4px solid green'}
    }

    if (file) {
        return <div className="overlay">
        <p><span>anchor: {Math.floor(xOffset)}px, {Math.floor(yOffset)}px</span><span style={{float:'right'}}>scale: {scale * zoomMultiplier}</span></p>
        <img id="overlayimg" src={file} className="overlay-image" onLoad={imglog} style={style}></img>
    </div>
    } else {
        return <div></div>
    }
    
}

function calculateAnchor(boundingRect, map, zoom, setXOffset, setYOffset, setFinalOffset) {
    const b = boundingRect;
    const trueZoom = 3;
    const zoomMultiplier = Math.pow(2, trueZoom - zoom);
    const p = map.containerPointToLayerPoint({x: b.x, y: b.y}).add(map.getPixelOrigin()).multiplyBy(zoomMultiplier);
    setXOffset(p.x);
    setYOffset(p.y);
    setFinalOffset(p);
}