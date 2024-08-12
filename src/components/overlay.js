import { useMapEvents, useMap } from "react-leaflet";
import { useState } from 'react';

export function Overlay({ file }) {
    const [xOffset, setXOffset] = useState();
    const [yOffset, setYOffset] = useState();
    const [clientRect, setClientRect] = useState();
    const [scale, setScale] = useState();

    const map = useMapEvents({
        move: (e) => {
            if (clientRect) {
                calculateAnchor(clientRect, map, map.getZoom(), setXOffset, setYOffset);
            }
        }
    });

    const imglog = (e) => {
        console.log(e.target.width, e.target.height, e.target.offsetLeft);
        calculateAnchor(e.target.getBoundingClientRect(), map, map.getZoom(), setXOffset, setYOffset);
        setClientRect(e.target.getBoundingClientRect());
    }
    
    if (file) {
        console.log(file);
        return <div className="overlay">
        <p><span>anchor: {Math.floor(xOffset)}px, {Math.floor(yOffset)}px</span><span style={{float:'right'}}>scale: {scale}</span></p>
        <img id="overlayimg" src={file} className="overlay-image" onLoad={imglog}></img>
    </div>
    } else {
        return <div></div>
    }
    
}

function calculateAnchor(boundingRect, map, zoom, setXOffset, setYOffset) {
    const b = boundingRect;
    const trueZoom = 3;
    const zoomMultiplier = Math.pow(2, trueZoom - zoom);
    const p = map.containerPointToLayerPoint({x: b.x, y: b.y}).add(map.getPixelOrigin()).multiplyBy(zoomMultiplier);
    setXOffset(p.x);
    setYOffset(p.y);
}