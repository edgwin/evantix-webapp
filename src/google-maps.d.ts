// Minimal type declarations for Google Maps API used in mapa-modal component.
// This avoids installing the full @types/google.maps package.
declare namespace google.maps {
  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  interface LatLng {
    lat(): number;
    lng(): number;
  }

  interface MapMouseEvent {
    latLng: LatLng | null;
  }
}
