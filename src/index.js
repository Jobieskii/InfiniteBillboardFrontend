import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
window.addEventListener('paste', e => {
  const upload = document.getElementById("fileUpload");
  console.log(e.clipboardData.files);
  upload.files = e.clipboardData.files;
  upload.dispatchEvent(new Event("change", {bubbles: true}))
  console.log(e.clipboardData.files);
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
