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
  const [objectUrl, setObjectUrl] = useState();
  const [finalScale, setFinalScale] = useState();
  const [finalOffset, setFinalOffset] = useState();

  function handleChange(e) {
    setObjectUrl(URL.createObjectURL(e.target.files[0]))
    setFile(e.target.files[0]);
  }
  function handleUpload(e) {
    if (file) {
      var data = new FormData();
      data.append('image', file);
      data.append('scale', finalScale);
      fetch(`http://localhost:8080/tiles/${Math.floor(finalOffset.x)}/${Math.floor(finalOffset.y)}`,
        {
          method: 'PATCH',
          body: data,
          headers: {
            'Access-Control-Allow-Origin':'*',
            'Accept': '*/*',
          }

        }
      ).then(console.log)
    }

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
          style={{ position: 'absolute', height: '100vh', width: '100vw' }}
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
          <Overlay file={objectUrl} setFinalScale={setFinalScale} setFinalOffset={setFinalOffset}></Overlay>
          <Logmap></Logmap>
        </MapContainer>

        <FileUpload onChange={handleChange} file={objectUrl} onUpload={handleUpload} uploadActive={true}></FileUpload>
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
