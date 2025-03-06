import './App.css';
import { getZoomMultiplier, tileInView } from './helper/positioningData'
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

  function handleCleanupWrapper(e) {
    // Find all tile wrappers in the DOM
    const layer = e.target;

    const wrappers = layer._level.el.querySelectorAll(".bib-tile-wrapper");

    wrappers.forEach((wrapper) => {
      // If the wrapper no longer has a tile inside it, so it would have only the 1 element of the flip side remove it
      const containsTile =
        Array.from(wrapper.children).length === 1 ? false : true;

      if (!containsTile) {
        wrapper.remove();
      }
    });
  }

  function onTileLoad(e) {
    const tile = e.tile;
    const wrapper = tile.parentNode;

    if (wrapper && wrapper.classList.contains("bib-tile-wrapper")) {
      setTimeout(() => {
        wrapper.classList.add("bib-tile-wrapper--animated");
      }, Math.random() * 1000 + 100);
    }
  }

  function onTileLoadStart(e) {
    const tile = e.tile;

    if (tile.hasAttribute("tile-wrapped")) return;
    tile.setAttribute("tile-wrapped", "true");

    tile.style.transform = "";
    tile.classList.add("bib-leaflet-tile");

    const wrapper = document.createElement("div");
    wrapper.classList.add("bib-tile-wrapper");
    tile.parentNode.insertBefore(wrapper, tile);
    wrapper.appendChild(tile);

    const flippedTile = document.createElement("img");
    flippedTile.classList.add("bib-leaflet-tile--flipped");
    flippedTile.src = "loading-bib-tile.png";
    wrapper.appendChild(flippedTile);

    wrapper.style.translate = `${tile._leaflet_pos.x}px ${tile._leaflet_pos.y}px`;

    tile.addEventListener("error", () => {
      setTimeout(() => {
        wrapper.classList.add("bib-tile-wrapper--animated");
      }, Math.random() * 700 + 100);
    });

    wrapper.addEventListener("transitionend", () => {
      tile.style.translate = wrapper.style.translate;
      const parent = wrapper.parentNode;
      if (parent) {
        tile.classList.remove("bib-leaflet-tile");
        tile.removeAttribute("tile-wrapped");
        parent.insertBefore(tile, wrapper);
        parent.removeChild(wrapper);
      }
    });
  }

  const displayMap = useMemo(
    () => (
      <MapContainer
        center={[0, 0]}
        zoom={sessionStorage.getItem('zoom') ?? 5}
        scrollWheelZoom={true}
        style={{ position: 'absolute', height: '100dvh', width: '100dvw', background: 'white' }}
        crs={CRS.Simple}
        ref={setMap}
        attributionControl={false}
        keyboardPanDelta={1}>
        <TileLayer
          id='tilelayer'
          tileSize={512}
          maxZoom={7}
          // minZoom={1}
          minZoom={Browser.retina ? 0 : 1}
          maxNativeZoom={Browser.retina ? 5 : 6} //Retina adds + 1 here
          // maxNativeZoom={4}
          minNativeZoom={1}
          zoomOffset={0}
          zoomReverse={true}
          url="https://bib.bohenek.xyz/content/{z}/{x}/{y}.png?{buster}"
          buster={cacheBustIndex}
          detectRetina={true}
          eventHandlers={
            !sessionStorage.getItem("animPlayed")
              ? {
            tileloadstart: onTileLoadStart,
            tileload: onTileLoad,
            tileabort: handleCleanupWrapper,
            tileunload: handleCleanupWrapper,
            load: (event) => {
              const layer = event.target;
              layer.off("tileload");
              layer.off("tileloadstart");
              layer.off("tileabort");
              layer.off("tileerror");
                    sessionStorage.setItem("animPlayed", true);
            },
                }
              : {}
          }
        />
        <AttributionControl position="bottomleft" />
        <Logmap center={center}></Logmap>
      </MapContainer>
    ),
    [center],
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

    fetch("https://bib.bohenek.xyz/api/session")
      .then(e => {
        if (e.ok) {
          e.json().then(e => setUsername(e.username));
        } else {
          setUsername("");
        }
      })
      .catch(e => e);
    // magick, this fixes all retina display issues for the animation
    const scaling = Browser.retina ? 0.5 : 1;
    document.documentElement.style.setProperty('--scaling', scaling);

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
  const [firstLoad, setFirstLoad] = useState();
  const [lastState, setLastState] = useState(0);

  const mapEvents = useMapEvents({
    moveend: (e) => {
      var mapCenter = mapEvents.latLngToLayerPoint(mapEvents.getCenter())
        .add(mapEvents.getPixelOrigin())
        .multiplyBy(getZoomMultiplier(mapEvents.getZoom()));
      mapCenter.x = Math.floor(mapCenter.x);
      mapCenter.y = Math.floor(mapCenter.y);

      const state = {c: mapEvents.getCenter(), z: mapEvents.getZoom()};
      if (window.history.state === null || !state.c.equals(window.history.state.c, 0.1)) {
        if (Date.now() > lastState + 3000) {
          window.history.pushState(state, '', `${window.location.origin}/?${mapCenter.x},${mapCenter.y}`);
        } else {
          window.history.replaceState(state, '', `${window.location.origin}/?${mapCenter.x},${mapCenter.y}`);
        }
        setLastState(Date.now());
      }
    },
    zoomend: (e) => {
      if (getZoomMultiplier(mapEvents.getZoom()) < 1) {
        document.documentElement.style.setProperty('--rendering', 'pixelated');
      } else {
        document.documentElement.style.setProperty('--rendering', 'optimizeQuality');
      }
      console.log(mapEvents.getZoom(), getZoomMultiplier(mapEvents.getZoom()), Browser.retina );
      sessionStorage.setItem('zoom', mapEvents.getZoom());
    }
  })

  useEffect(() => {
    const zoomMultiplier = getZoomMultiplier(mapEvents.getZoom());
    const onPopstate = (e) => {
      if (e.state !== null) {
        mapEvents.setView(e.state.c, e.state.z, {animate: false})
      } else {
        const state = {c: mapEvents.getCenter(), z: mapEvents.getZoom()};
        window.history.replaceState(state, '', `${window.location.origin}/?${center[0]},${center[1]}`);
        mapEvents.setView(mapEvents.layerPointToLatLng(new Point(center[0], center[1]).divideBy(zoomMultiplier).subtract(mapEvents.getPixelOrigin())), mapEvents.getZoom(), {animate: false});
      }
      setLastState(0);
    };
    window.addEventListener('popstate', onPopstate);

    return () => {
      window.removeEventListener('popstate', onPopstate);
    };
  }, [mapEvents, center]);

  if (!firstLoad) {
    const zoomMultiplier = getZoomMultiplier(mapEvents.getZoom());
    // console.log(center, new Point(center.x, center.y).subtract(mapEvents.getPixelOrigin()));
    mapEvents.setView(mapEvents.layerPointToLatLng(new Point(center[0], center[1]).divideBy(zoomMultiplier).subtract(mapEvents.getPixelOrigin())), mapEvents.getZoom(), {animate: false});
    setFirstLoad(true);
    console.log("new map ", mapEvents);
  }
  return null;
}
export default App;
