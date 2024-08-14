
import {useState } from 'react'

export function PlacementBar({ x, y, scale, zoomMultiplier, onSetScale }) {
    const [displayScale, setDisplayScale] = useState((scale * zoomMultiplier).toFixed(3));
    const [editingScale, setEditingScale] = useState(false);
    if (!editingScale && (scale * zoomMultiplier).toFixed(3) != displayScale) {
        console.log((scale * zoomMultiplier).toFixed(3));
        setDisplayScale((scale * zoomMultiplier).toFixed(3));
    }
    return <div style={{display: 'flex',
        justifyContent: 'space-around',
        flexGrow: '1'}}>
    <span className='pos-control'>
        x:
        <span>{Math.floor(x)}</span>
        &nbsp;y:
        <span>{Math.floor(y)}</span>
        
    </span>
    <span className='pos-control'>
        scale:
        <input 
        type="number" 
        min={0.1}
        max={10}
        step={0.1}
        value={displayScale}
        onFocus={e => {
            setEditingScale(true);
        }} 
        onChange={e => {
            setDisplayScale(e.target.value);
        }} 
        onBlur={e => {
            onSetScale(displayScale / zoomMultiplier);
            setEditingScale(false);
        }} 
        onClick={e => {
            // setEditingScale(false);
        }}
        />
    </span>
</div>
}