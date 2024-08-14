import { getZoomMultiplier } from '../helper/positioningData';
import { PlacementBar } from './positioning'

export function BottomBar({ map, file, offset, scale, imgSize, onChange, onSetScale }) {
    if (!map) return null;

    function handleUpload() {
        if (map && file) {
            var data = new FormData();
            data.append('image', file);
            data.append('scale', getZoomMultiplier(map.getZoom()) * scale);
            fetch(`http://localhost:8080/tiles/${Math.floor(offset.x)}/${Math.floor(offset.y)}`,
                {
                    method: 'PATCH',
                    body: data,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Accept': '*/*',
                    }

                }
            ).then(console.log)
        }
    }
    return <div className="bottom-bar">
        {file && imgSize ?
            <PlacementBar
                x={offset.x}
                y={offset.y}
                scale={scale}
                zoomMultiplier={getZoomMultiplier(map.getZoom())}
                onSetScale={onSetScale}
            ></PlacementBar> : null}
        <div className="file-upload">
            {file ?
                <><button id="uploadButton" onClick={_ => handleUpload()} disabled={false}>POST</button>
                    <button id="cancelUploadButton">X</button></> : null}

            <input id="fileUpload" type="file" onChange={onChange} />
        </div>
    </div>

}