import React, { useEffect, useState } from 'react';

const MapComponent: React.FC = () => {
    // const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    //     null
    //   );
    useEffect(() => {

    // if ("geolocation" in navigator) {
    //     navigator.geolocation.getCurrentPosition(
    //         (position) => {
    //         const lat = position.coords.latitude;
    //         const lon = position.coords.longitude;
    //         setLocation({ lat, lon });
    //         },
    //         (error) => {
    //         console.error("Error getting location: ", error);
    //         }
    //     );
    //     }
      // Load the Longdo Map script dynamically
      const script = document.createElement('script');
      script.src = 'https://api.longdo.com/map/?key=5fc04d23896fc489e4e60e6ff5b6cb37';
      script.async = true;
      script.onload = () => {
        // Initialize the map once the script is loaded
        const map = new (window as any).longdo.Map({
          placeholder: document.getElementById('map')
        });
  
        // Add a marker to the map
        // const marker1 = new (window as any).longdo.Marker(
        //   { lat: 13.651252, lon: 100.494489}, // Marker position
        //   {
        //     title: 'Marker',
        //     icon: {
        //       url: 'https://map.longdo.com/mmmap/images/pin_mark.png',
        //       offset: { x: 12, y: 45 }
        //     },
        //     // detail: 'Drag me',
        //     // visibleRange: { min: 0, max: 16 },
        //     draggable: false,
        //     weight: (window as any).longdo.OverlayWeight.Top,
        //   }
        // );
        var Marker = new (window as any).longdo.Marker(
            { lon: 100.538316, lat: 13.764953 },
            { title: 'Victory monument', detail: 'I\'m here' }
          ); // Create Marker Overlay
          
          map.Route.add(Marker);
        // map.Layers.setBase(longdo.Layers.NORMAL_EN);
        map.Layers.setBase((window as any).longdo.Layers.NORMAL_EN);
        map.Ui.DPad.visible(false);
        map.Ui.Zoombar.visible(true);
        map.Ui.Geolocation.visible(true);
        map.Ui.Toolbar.visible(false);
        map.Ui.LayerSelector.visible(true);
        map.Ui.Fullscreen.visible(true);
        map.Ui.Crosshair.visible(false);
        map.Ui.Scale.visible(true);
  
        // Add the marker to the map
        map.Overlays.add(Marker);
        map.Route.add({ lon: 100.494489
            , lat: 13.651252 });
        map.Route.search();
        map.Route.enableContextMenu();
        map.Route.auto(true);
        map.Route.mode((window as any).longdo.RouteMode.Cost);
        map.Route.mode((window as any).longdo.RouteMode.Distance);
      };
  
      document.head.appendChild(script);

    // Cleanup function to remove the script when the component unmounts
    return () => {
      document.head.removeChild(script);
    };
  }, []);
  

  return (
    <div style={{ height: '50vh', margin: 0 }}>
      <div id="map" style={{ height: '100%' }}></div>
    </div>
  );
};

export default MapComponent;

// import React, { useEffect, useState } from 'react';

// declare global {
//   interface Window {
//     longdo: any;
//   }
// }

// const MapComponent: React.FC = () => {
//   const [mapInitialized, setMapInitialized] = useState(false);
//   const [userLocation, setUserLocation] = useState<{ lon: number; lat: number } | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   // Load Longdo Map script and initialize
//   useEffect(() => {
//     // Check if script is already loaded
//     if (window.longdo) {
//       setMapInitialized(true);
//       return;
//     }

//     const script = document.createElement('script');
//     script.src = `https://api.longdo.com/map/?key=YOUR-KEY-API`;
//     script.async = true;
//     script.onload = () => setMapInitialized(true);
//     script.onerror = () => setError("Failed to load map script");
//     document.head.appendChild(script);

//     return () => {
//       document.head.removeChild(script);
//     };
//   }, []);

//   // Get user location
//   useEffect(() => {
//     if (!mapInitialized) return;

//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setUserLocation({
//             lon: position.coords.longitude,
//             lat: position.coords.latitude
//           });
//         },
//         (err) => {
//           setError(`Location access denied: ${err.message}`);
//           // Fallback to default location
//           setUserLocation({ lon: 100.54898, lat: 13.74308 });
//         }
//       );
//     } else {
//       setError("Geolocation not supported");
//       setUserLocation({ lon: 100.54898, lat: 13.74308 }); // Fallback
//     }
//   }, [mapInitialized]);

//   // Initialize map and route
//   useEffect(() => {
//     if (!mapInitialized || !userLocation) return;

//     try {
//       const map = new window.longdo.Map({
//         placeholder: document.getElementById('map'),
//         zoom: 14
//       });

//       // Add route
//       map.Route.clear();
//       map.Route.add({
//         lon: userLocation.lon,
//         lat: userLocation.lat,
//         title: "My Location"
//       });

//       // Add destination (replace with your destination)
//       map.Route.add({
//         lon: 100.55885,
//         lat: 13.72431,
//         title: "Destination"
//       });

//       // Center map and search route
//       map.location(userLocation);
//       map.Route.search();

//     } catch (e) {
//       setError("Failed to initialize map");
//       console.error(e);
//     }
//   }, [mapInitialized, userLocation]);

//   return (
//     <div style={{ height: '100vh', margin: 0 }}>
//       {error && (
//         <div style={{
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           right: 0,
//           background: 'rgba(255,0,0,0.3)',
//           padding: '10px',
//           zIndex: 1000
//         }}>
//           {error}
//         </div>
//       )}
//       <div id="map" style={{ height: '100%' }}></div>
//     </div>
//   );
// };

// export default MapComponent;