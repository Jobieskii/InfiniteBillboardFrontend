export function newPositioningData(point, scale) {
    return {point: point, scale: scale}
}

export function getZoomMultiplier(zoom) {
    const trueZoom = 3;
    return Math.pow(2, trueZoom - zoom);
}

export function resetUpload() {
    const upload = document.getElementById("fileUpload");
    upload.value = "";
    upload.dispatchEvent(new Event("change", {bubbles: true}))
}