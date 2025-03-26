import React, { useEffect, useState } from 'react';

const MapComponent: React.FC = () => {
  const [map, setMap] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Longdo Map script
    const script = document.createElement('script');
    script.src = 'https://api.longdo.com/map/?key=5fc04d23896fc489e4e60e6ff5b6cb37';
    script.async = true;
    script.onload = initializeMap;
    script.onerror = () => setError("Failed to load map script");
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeMap = () => {
    const mapInstance = new (window as any).longdo.Map({
      placeholder: document.getElementById('map'),
      zoom: 10
    });
    setMap(mapInstance);

    // Configure UI
    mapInstance.Layers.setBase((window as any).longdo.Layers.NORMAL_EN);
    mapInstance.Ui.DPad.visible(false);
    mapInstance.Ui.Zoombar.visible(true);
    mapInstance.Ui.Geolocation.visible(true);

    // Get current position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lon } = position.coords;
          addUserLocation(mapInstance, lon, lat);
        },
        (err) => {
          setError(`Geolocation error: ${err.message}`);
          // Fallback to Bangkok coordinates if denied
        }
      );
    } else {
      setError("Geolocation not supported");
      // Fallback to Bangkok coordinates
    }
  };

  const addUserLocation = (mapInstance: any, lon: number, lat: number) => {
    // Add user marker
    const userMarker = new (window as any).longdo.Marker(
      { lon, lat },
      { title: "Your Current Location", detail: "Detected automatically" }
    );
    mapInstance.Overlays.add(userMarker);

    // Add destination (Victory Monument)
    const destinationMarker = new (window as any).longdo.Marker(
      { lon: 100.749502, lat: 13.688381, },
      { title: "Victory Monument", detail: "Destination" }
    );
    mapInstance.Overlays.add(destinationMarker);

    // Set up route
    mapInstance.Route.placeholder(document.getElementById('result'));
    mapInstance.Route.add({ lon, lat });
    mapInstance.Route.add({ lon: 100.749502, lat: 13.688381 });
    mapInstance.Route.search();
    mapInstance.location({ lon, lat }, true);
  };

  return (
    <div style={{ height: '50vh', margin: 0 }}>
      {error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          background: 'rgba(255,0,0,0.3)',
          padding: '10px',
          zIndex: 1000
        }}>
          {error}
        </div>
      )}
      <div id="map" style={{ height: '100%' }}></div>
      <div id="result" style={{ 
        position: 'relative',
        bottom: 0,
        left: 0,
        right: 20,
        height: '30%',
        background: 'white',
        overflow: 'auto'
      }}></div>
    </div>
  );
};

export default MapComponent;