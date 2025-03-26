import React, { useEffect, useState, useRef } from "react";

interface MapComponentProps {
  latitude: number;
  longitude: number;
}

const MapComponent: React.FC<MapComponentProps> = ({ latitude, longitude }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setError("Failed to get user location: " + error.message);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://api.longdo.com/map/?key=5fc04d23896fc489e4e60e6ff5b6cb37";
    script.async = true;
    script.onload = initializeMap;
    script.onerror = () => setError("Failed to load map script");
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [userLocation]);

  const initializeMap = () => {
    if (!mapRef.current) return;

    const mapInstance = new (window as any).longdo.Map({
      placeholder: mapRef.current,
      zoom: 14,
    });
    setMap(mapInstance);

    mapInstance.Layers.setBase((window as any).longdo.Layers.NORMAL_EN);
    mapInstance.Ui.DPad.visible(false);
    mapInstance.Ui.Zoombar.visible(true);
    mapInstance.Ui.Geolocation.visible(true);
    mapInstance.Ui.Toolbar.visible(false);
    mapInstance.Ui.LayerSelector.visible(true);
    mapInstance.Ui.Fullscreen.visible(true);
    mapInstance.Ui.Crosshair.visible(false);
    mapInstance.Ui.Scale.visible(true);

    if (userLocation) {
      addRoute(
        mapInstance,
        userLocation.longitude,
        userLocation.latitude,
        longitude,
        latitude
      );
    }
  };

  const addRoute = (
    mapInstance: any,
    userLon: number,
    userLat: number,
    venueLon: number,
    venueLat: number
  ) => {
    const userMarker = new (window as any).longdo.Marker(
      { lon: userLon, lat: userLat },
      { title: "Your Location", detail: "You are here" }
    );

    const venueMarker = new (window as any).longdo.Marker(
      { lon: venueLon, lat: venueLat },
      { title: "Venue Location", detail: "This is the venue's location" }
    );

    mapInstance.Overlays.add(userMarker);
    mapInstance.Overlays.add(venueMarker);
    mapInstance.Route.add(userMarker);
    mapInstance.Route.add(venueMarker);
    mapInstance.Route.search();
    mapInstance.location({ lon: userLon, lat: userLat }, true);
  };

  return (
    <div style={{ height: "50vh", margin: 0 }}>
      {error && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            background: "rgba(255,0,0,0.3)",
            padding: "10px",
            zIndex: 1000,
          }}
        >
          {error}
        </div>
      )}
      <div ref={mapRef} style={{ height: "100%" }}></div>
    </div>
  );
};

export default MapComponent;
