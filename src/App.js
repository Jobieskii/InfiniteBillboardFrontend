import logo from './logo.svg';
import './App.css';
import { getZoomMultiplier, newPositioningData } from './helper/positioningData'
import { Overlay } from './components/overlay';
import { useState, useMemo } from 'react';
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
  const [map, setMap] = useState(null)

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setObjectUrl(URL.createObjectURL(e.target.files[0]))
      setFile(e.target.files[0]);  
    } else {
      setObjectUrl(null);
      setFile(null);
    }
  }


  const displayMap = useMemo(
    () => (
      <MapContainer
        center={[0, 0]}
        zoom={2}
        scrollWheelZoom={false}
        style={{ position: 'absolute', height: '100vh', width: '100vw', background:'white' }}
        crs={CRS.Simple}
        ref={setMap}>
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
        <Logmap center={center}></Logmap>
      </MapContainer>
    ),
    [],
  )

  return <div className="App">
    { map ? <Overlay 
      map={map}
      imageObjectUrl={objectUrl} 
      scale={scale}
      imgSize={imageSize} 
      onSetScale={setScale} 
      onSetOffset={setFinalOffset}
      onSetImgSize={setImageSize}
    ></Overlay> : null }
    { map ? <BottomBar
      map={map}
      file={file}
      offset={finalOffset}
      scale={scale}
      imgSize={imageSize}
      onChange={handleFileChange}
      onSetScale={setScale}
    ></BottomBar> : null }
    {displayMap}


  </div>
}

function Logmap({ center }) {
  const [stateObj, setStateObj] = useState();
  const [firstLoad, setFirstLoad] = useState();
  const mapEvents = useMapEvents({
    moveend: (e) => {
      const mapCenter = mapEvents.latLngToLayerPoint(mapEvents.getCenter())
        .add(mapEvents.getPixelOrigin())
        .multiplyBy(getZoomMultiplier(mapEvents.getZoom()));
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
    const zoomMultiplier = getZoomMultiplier(mapEvents.getZoom());
    // console.log(center, new Point(center.x, center.y).subtract(mapEvents.getPixelOrigin()));
    mapEvents.flyTo(mapEvents.layerPointToLatLng(new Point(center[0], center[1]).divideBy(zoomMultiplier).subtract(mapEvents.getPixelOrigin())));
    setFirstLoad(true);
    console.log("new map ", mapEvents);
  }
  return null;
}
export default App;
