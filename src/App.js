import logo from './logo.svg';
import './App.css';
import { getZoomMultiplier, newPositioningData } from './helper/positioningData'
import { Overlay } from './components/overlay';
import { useState } from 'react';
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { CRS } from 'leaflet';
import { useMap } from 'react-leaflet/hooks'
import { Point } from 'leaflet';
import { useMapEvents } from 'react-leaflet/hooks';
import { BottomBar } from './components/bottomBar';

function App({ center }) {
  const [file, setFile] = useState();
  const [objectUrl, setObjectUrl] = useState();
  const [imageSize, setImageSize] = useState();
  const [scale, setScale] = useState(1);
  const [finalOffset, setFinalOffset] = useState(new Point(0, 0));

  function handleChange(e) {
    setObjectUrl(URL.createObjectURL(e.target.files[0]))
    setFile(e.target.files[0]);
    
  }
  function handleUpload(e) {
    if (file) {
      var data = new FormData();
      data.append('image', file);
      data.append('scale', getZoomMultiplier(mapEvents.getZoom())*finalScale);
      fetch(`http://localhost:8080/tiles/${Math.floor(finalOffset.x)}/${Math.floor(finalOffset.y)}`,
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
  const [map, setMap] = useState(null)

  const displayMap = useMemo(
    () => (
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        ref={setMap}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    ),
    [],
  )

  return <div className="App">

<Overlay file={objectUrl} scale={finalScale} onSetScale={setFinalScale} onSetOffset={setFinalOffset}></Overlay>
      <BottomBar 
    onChange={handleChange} 
    onSetScale={setFinalScale} 
    file={objectUrl} 
    onUpload={handleUpload} 
    uploadActive={true} 
    positioningData={newPositioningData(finalOffset, finalScale)}
    ></BottomBar>
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
      </MapContainer>

      
    </div>
}

function Logmap({ center, setMapEvents }) {
  const [stateObj, setStateObj] = useState();
  const [firstLoad, setFirstLoad] = useState();
  const mapEvents = useMapEvents({
    moveend: (e) => {
      const trueZoom = 3;
      const zoomMultiplier = Math.pow(2, trueZoom - mapEvents.getZoom());
      const mapCenter = mapEvents.latLngToLayerPoint(mapEvents.getCenter())
        .add(mapEvents.getPixelOrigin())
        .multiplyBy(zoomMultiplier);
      if (!stateObj) {
        const state = { state: "objected" };
        window.history.pushState(state, '', `${window.location.origin}/${mapCenter.x},${mapCenter.y}`);
        setStateObj(state);

      } else {
        window.history.replaceState(stateObj, '', `${window.location.origin}/${mapCenter.x},${mapCenter.y}`);
      }

    }
  })

  if (!firstLoad) {
    const trueZoom = 3;
    const zoomMultiplier = Math.pow(2, trueZoom - mapEvents.getZoom());
    // console.log(center, new Point(center.x, center.y).subtract(mapEvents.getPixelOrigin()));
    mapEvents.flyTo(mapEvents.layerPointToLatLng(new Point(center[0], center[1]).divideBy(zoomMultiplier).subtract(mapEvents.getPixelOrigin())));
    setMapEvents(mapEvents);
    setFirstLoad(true);
    console.log("new map ", mapEvents);
  }
  return null;
}
export default App;
