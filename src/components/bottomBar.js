import { getZoomMultiplier, resetUpload } from '../helper/positioningData';
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
    
    const zm = getZoomMultiplier(map.getZoom());
    var warning = null;
    var error = null;
    if (imgSize && (imgSize.width * scale * zm > 1024 || imgSize.height * scale * zm > 1024)) {
        error = "Image after scaling is too large (>1024px).";
    }
    if (!error && scale * zm < 1) {
        warning = "Image will be scaled down.";
    }
    return <div className="bottom-bar">
        <div className="file-upload">
            {file ?
                <><span className='alert warning' hidden={!warning}>{warning}</span><span className='alert error' hidden={!error}>{error}</span>
                <span><button id="uploadButton" onClick={_ => handleUpload()} disabled={!!error} className='file-button confirm-button' style={{'--color': '#2f9700'}} ><span className='icon' style={{'--maskurl': 'url(iconset/layer-action-mergedown.svg)'}}></span></button>
                    <button id="cancelUploadButton" onClick={resetUpload} className='file-button cancel-button' style={{'--color': '#cb4949'}}><span className='icon' style={{'--maskurl': 'url(iconset/act-remove.svg)'}}></span></button></span></> : 
                    <button onClick={() => document.getElementById("fileUpload").click()} className='file-button' style={{'--color': '#2f9700'}} ><span className='icon' style={{'--maskurl': 'url(iconset/hardware-imagescanner.svg)'}}></span></button>}

            <input id="fileUpload" type="file" onChange={onChange} hidden />
        </div>
        {file && imgSize ?
            <PlacementBar
                x={offset.x}
                y={offset.y}
                scale={scale}
                zoomMultiplier={getZoomMultiplier(map.getZoom())}
                onSetScale={onSetScale}
            ></PlacementBar> : null}

    </div>

}