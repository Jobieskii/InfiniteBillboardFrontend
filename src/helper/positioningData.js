export function newPositioningData(point, scale) {
    return {point: point, scale: scale}
}

export function getZoomMultiplier(zoom) {
    const trueZoom = 3;
    return Math.pow(2, trueZoom - zoom);
}