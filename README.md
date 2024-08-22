# Infinite Billboard
The Infinite Billboard is an experimental website that tries to reimagine online interaction. Users are free to place images anywhere on the board, which includes other people's images, with the creative limitation of working with actual pixels of a "single" image. The position on the map can be easily bookmarked and shared by the URL which enables complex interaction with secret locations.

For Backend see: https://github.com/Jobieskii/InfiniteBillboardBackend

## Frontend
The frontend is made in React and relies heavily on react-leaflet a react wrapper around leaflet.js. It includes:
- UI elements for selecting, placing, scaling and uploading an image. The image being displayed is positioned to be as close as possible to the actual result after uploading.
- A STOMP connection for retrieving list of updated tiles (the actual tiles on the screen are only updated if the updates happen within the bounds of the screen)
- Support for high resolution displays

## Acknowlegements
- Icons by [R.V.Klein](https://rvklein.neocities.org/proj/ideogramma/)
- [leafletjs](https://leafletjs.com/)
