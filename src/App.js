import logo from './logo.svg';
import './App.css';
import { Overlay } from './components/overlay';
import { useState } from 'react';
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { CRS } from 'leaflet';
import { useMap } from 'react-leaflet/hooks'
import { useMapEvents } from 'react-leaflet/hooks';
import { FileUpload } from './components/fileUpload';

function App() {
  const [file, setFile] = useState();
  function handleChange(e) {
      setFile(URL.createObjectURL(e.target.files[0]));
  }

  return (
    <div className="App">
      <header className="App-header scroll-align">
      </header>
      <div className='scroll-align'>
      
      <MapContainer 
      center={[0, 0]} 
      zoom={2} 
      scrollWheelZoom={false} 
      style={{position:'absolute', height:'100vh', width:'100vw'}} 
      crs={CRS.Simple}
      >
        <TileLayer
          id='tilelayer'
          tileSize={512}
          maxZoom={4} 
          minZoom={1}
          maxNativeZoom={3}
          minNativeZoom={1}
          zoomOffset={0}
          zoomReverse={true}
          url="http://localhost:8000/{z}/{x}/{y}.png"
        />
        <Overlay file={file}></Overlay>
        <Logmap></Logmap>
      </MapContainer>
      
      <FileUpload onChange={handleChange}></FileUpload>
      </div>

    </div>
  );
}

function Logmap() {
  const map = useMap();
  console.log(map.getCenter(), map.getPixelOrigin());
  const mapEvents = useMapEvents({
    click: (e) => {
      const trueZoom = 3;
      const zoomMultiplier = Math.pow(2, trueZoom - mapEvents.getZoom());
      // console.log(e.layerPoint.add(mapEvents.getPixelOrigin()).multiplyBy(zoomMultiplier))
    }
  })
  return null;
}
export default App;
