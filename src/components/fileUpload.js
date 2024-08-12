export function FileUpload({ file, uploadActive, onChange, onUpload }) {
    if (file) {
        return <div className="upload-bar">
        <span className="progress-bar"></span>
        <div className="file-upload">
            <button id="uploadButton" onClick={onUpload} disabled={!uploadActive}>POST</button>
            <button id="cancelUploadButton">X</button>
            <input id="fileUpload" type="file" onChange={onChange} />
        </div>
    </div>
    } else {
    return <div className="upload-bar">
        <div className="file-upload">
            <input id="fileUpload" type="file" onChange={onChange} />
        </div>
    </div>
    }
}