import { PlacementBar } from './positioning'

export function BottomBar({ file, uploadActive, onChange, onUpload, positioningData, onSetScale }) {
    if (file && positioningData.point) {
        return <div className="bottom-bar">
        <PlacementBar 
            x={positioningData.point.x} 
            y={positioningData.point.y} 
            scale={positioningData.scale} 
            zoomMultiplier={positioningData.zoomMultiplier} 
            onSetScale={onSetScale} 
        ></PlacementBar>
        <span className="progress-bar"></span>
        <div className="file-upload">
            <button id="uploadButton" onClick={onUpload} disabled={!uploadActive}>POST</button>
            <button id="cancelUploadButton">X</button>
            <input id="fileUpload" type="file" onChange={onChange} />
        </div>
    </div>
    } else {
    return <div className="bottom-bar">
        <div className="file-upload">
            <input id="fileUpload" type="file" onChange={onChange} />
        </div>
    </div>
    }
}