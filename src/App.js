import logo from './logo.svg';
import './App.css';
import { Overlay } from './components/overlay';
import { useState } from 'react';
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { CRS } from 'leaflet';
import { useMap } from 'react-leaflet/hooks'
import { Point } from 'leaflet';
import { useMapEvents } from 'react-leaflet/hooks';
import { FileUpload } from './components/fileUpload';

function App({ center }) {
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
          <Logmap center={center} ></Logmap>
        </MapContainer>

        <FileUpload onChange={handleChange} file={objectUrl} onUpload={handleUpload} uploadActive={true}></FileUpload>
      </div>

  );
}

function Logmap({ center }) {
  const [stateObj, setStateObj] = useState();
  const [firstLoad, setFirstLoad] = useState();
  const mapEvents = useMapEvents({
    moveend: (e) => {
      const trueZoom = 3;
      const zoomMultiplier = Math.pow(2, trueZoom - mapEvents.getZoom());
      const mapCenter = mapEvents.latLngToLayerPoint(mapEvents.getCenter())
        .add(mapEvents.getPixelOrigin())
        .multiplyBy(zoomMultiplier);
      if (stateObj) {
        const state = {state: "objected"};
        window.history.pushState(state, '', `${window.location.origin}/${mapCenter.x},${mapCenter.y}`);  
        console.log(window.history.state);
        setStateObj(state);
        
      } else {
        window.history.replaceState(stateObj, '', `${window.location.origin}/${mapCenter.x},${mapCenter.y}`);
        console.log(window.history.state);
      }
      
    }
  })
  if (!firstLoad) {
    const trueZoom = 3;
    const zoomMultiplier = Math.pow(2, trueZoom - mapEvents.getZoom());
    // console.log(center, new Point(center.x, center.y).subtract(mapEvents.getPixelOrigin()));
    mapEvents.flyTo(mapEvents.layerPointToLatLng(new Point(center[0], center[1]).divideBy(zoomMultiplier).subtract(mapEvents.getPixelOrigin())));
    setFirstLoad(true);
  }
  return null;
}
export default App;
