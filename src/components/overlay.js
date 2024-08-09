export function Overlay({ file, scale, x, y }) {
    if (file) {
        return <div className="overlay">
        <p><span>anchor: {x}x{y}px</span><span style={{float:'right'}}>scale: {scale}</span></p>
        <img id="overlayimg" src={file} className="overlay-image"></img>
    </div>
    } else {
        return <div></div>
    }
    
}