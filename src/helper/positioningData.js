import { Map, Bounds, Point } from "leaflet";

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

export function tileInView(map, tileStrings) {
    const prebounds = map.getPixelBounds();
    const zm = getZoomMultiplier(map.getZoom());
    const bounds = new Bounds(prebounds.min.multiplyBy(zm), prebounds.max.multiplyBy(zm) );
    
    for (var tilestr of tileStrings) {
        const split = tilestr.split('/');
        const tilepos = new Point(parseInt(split[0]) * 512, parseInt(split[1]) * 512);
        if (bounds.intersects(
            new Bounds(
                tilepos, 
                tilepos.add(new Point(512, 512)),
            ))
        ) return true;
    }
    return false;
}