import logo from './logo.svg';
import './App.css';
import { Overlay } from './components/overlay';
import { useState } from 'react';
import { MapContainer } from 'react-leaflet/MapContainer'
import { TileLayer } from 'react-leaflet/TileLayer'
import { CRS } from 'leaflet';
import { useMap } from 'react-leaflet/hooks'
import { FileUpload } from './components/fileUpload';

function App() {
  const [file, setFile] = useState();
  function handleChange(e) {
      console.log(e.target.files);
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
      maxZoom={2} 
      minZoom={0}
      crs={CRS.Simple}
      >
        <TileLayer
          tileSize={512}
          url="http://localhost:8000/{z}/{x}/{y}.png"
        />
      
      </MapContainer>
      <Overlay file={file}></Overlay>
      <FileUpload onChange={handleChange}></FileUpload>
      </div>

    </div>
  );
}

export default App;
