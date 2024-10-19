import logo from './logo.svg';
import './App.css';
import { getZoomMultiplier, newPositioningData, tileInView } from './helper/positioningData'
import { Overlay } from './components/overlay';
import { useState, useMemo, useEffect } from 'react';
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { AttributionControl } from 'react-leaflet/AttributionControl'
import { CRS } from 'leaflet';
import { Client } from '@stomp/stompjs';
import { Point } from 'leaflet';
import { useMapEvents } from 'react-leaflet/hooks';
import { BottomBar } from './components/bottomBar';
import { Browser } from 'leaflet';

const [cacheBustIndex, cacheBustIncr] = function() {
  var idx = Math.floor( Math.random() * 200000 ) + 1;
  return [function() {
    return idx;
  }, function() {
    idx += 1;
    return idx;
  }]
}();

function invalidateMapCache(map) {
  cacheBustIncr();
  map.eachLayer(l => l.redraw());
}

function App({ center }) {
  const [file, setFile] = useState();
  const [objectUrl, setObjectUrl] = useState();
  const [imageSize, setImageSize] = useState();
  const [scale, setScale] = useState(1);
  const [finalOffset, setFinalOffset] = useState(new Point(0, 0));
  const [map, setMap] = useState(null)
  const [username, setUsername] = useState(null);

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
        zoom={3}
        scrollWheelZoom={false}
        style={{ position: 'absolute', height: '100vh', width: '100vw', background:'white' }}
        crs={CRS.Simple}
        ref={setMap}
        attributionControl={false}
        keyboardPanDelta={1}>
        <TileLayer
          id='tilelayer'
          tileSize={512}
          maxZoom={5}
          // minZoom={1}
          minZoom={Browser.retina ? 0 : 1}
          maxNativeZoom={Browser.retina ? 3 : 4} //Retina adds + 1 here
          // maxNativeZoom={4}
          minNativeZoom={1}
          zoomOffset={0}
          zoomReverse={true}
          url="https://bib.bohenek.xyz/content/{z}/{x}/{y}.png?{buster}"
          buster={cacheBustIndex}
          detectRetina={true}
        />
        <AttributionControl position="bottomleft" />
        <Logmap center={center}></Logmap>
      </MapContainer>
    ),
    [],
  )
  useEffect(() => {
    const stompClient = new Client({
      brokerURL: "wss://bib.bohenek.xyz/api/stomp",
      onConnect: (frame) => {
        console.log("connected to stomp", frame);
        stompClient.subscribe('/topic/tile-updates', function(messageOutput) {
          const updated = JSON.parse(messageOutput.body);
          console.log("updated ", updated);
          if (map && tileInView(map, updated)) {
            invalidateMapCache(map)
          };
      });
      },
      onWebSocketError: (e) => console.log(e),
      onStompError: (e) => console.log(e)
    });
    stompClient.activate();
    
    fetch("https://bib.bohenek.xyz/api/session", {credentials: "include"})
      .then( e => e.json())
      .then( e => setUsername(e.username))
      .catch(e=>e);
    
    return () => stompClient.deactivate();
  }, [map])

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
      username={username}
    ></BottomBar> : null }
    {displayMap}


  </div>
}

function Logmap({ center }) {
  const [stateObj, setStateObj] = useState();
  const [firstLoad, setFirstLoad] = useState();
  const mapEvents = useMapEvents({
    moveend: (e) => {
      var mapCenter = mapEvents.latLngToLayerPoint(mapEvents.getCenter())
        .add(mapEvents.getPixelOrigin())
        .multiplyBy(getZoomMultiplier(mapEvents.getZoom()));
      mapCenter.x = Math.floor(mapCenter.x);
      mapCenter.y = Math.floor(mapCenter.y);
      if (!stateObj) {
        const state = { state: "objected" };
        window.history.pushState(state, '', `${window.location.origin}/#${mapCenter.x},${mapCenter.y}`);
        setStateObj(state);

      } else {
        window.history.replaceState(stateObj, '', `${window.location.origin}/#${mapCenter.x},${mapCenter.y}`);
      }

    },
    zoomend: (e) => {
      console.log(mapEvents.getZoom(), getZoomMultiplier(mapEvents.getZoom()), Browser.retina )
    }
  })
  
  useEffect(() => {
    mapEvents.eachLayer((layer) => {
      const onTileLoad = function (event) {
        const tile = event.tile;
          // remove the transform from leaflet and add class to flip the tiles
          tile.style.transform = "";
          tile.classList.add("bib-leaflet-tile");F
          if (tile.parentNode && !tile.parentNode.classList.contains("bib-tile-wrapper")) {
            const wrapper = document.createElement("div");
            wrapper.classList.add("bib-tile-wrapper");
            tile.parentNode.insertBefore(wrapper, tile);
            wrapper.appendChild(tile);

            const flippedTile = document.createElement("img");
            flippedTile.classList = tile.classList;
            flippedTile.classList.add("bib-leaflet-tile--flipped");

            flippedTile.src = 'android-chrome-512x512.png';
            wrapper.appendChild(flippedTile);
  
            // put back the translate as a indivual property instead of using transform
            wrapper.style.translate = `${tile._leaflet_pos.x}px ${tile._leaflet_pos.y}px`;

            wrapper.addEventListener('transitionend', (event) => {
              tile.style.translate = wrapper.style.translate;
              
              const parent = wrapper.parentNode;
              if(parent){
              parent.insertBefore(tile, wrapper);
              parent.removeChild(wrapper);
              }
            });
        // after a random interval add the aninmation
        setTimeout(() => {
          wrapper.classList.add("bib-tile-wrapper--animated");

        }, Math.random() * 1500 + 100);
      }
      };

      layer.on("tileload", onTileLoad);

      // when the page has fully loaded remove the animation listener
      layer.on("load", function (event) {
        layer.off("tileload", onTileLoad);
      });


      return () => {
        layer.off("tileload");
      };
    });
  }, [mapEvents]);

  if (!firstLoad) {
    const zoomMultiplier = getZoomMultiplier(mapEvents.getZoom());
    // console.log(center, new Point(center.x, center.y).subtract(mapEvents.getPixelOrigin()));
    mapEvents.setView(mapEvents.layerPointToLatLng(new Point(center[0], center[1]).divideBy(zoomMultiplier).subtract(mapEvents.getPixelOrigin())));
    setFirstLoad(true);
    console.log("new map ", mapEvents);
  }
  return null;
}
export default App;
