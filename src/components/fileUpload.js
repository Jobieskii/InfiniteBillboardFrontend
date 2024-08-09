export function FileUpload({onChange}) {
    return <div className="file-upload">
        <input id="fileupload" type="file" onChange={onChange} />
    </div>
}