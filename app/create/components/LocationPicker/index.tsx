import { useState, useRef, useCallback, useEffect } from "react";
import styles from "./LocationPicker.module.css";
import Dropdown from "../Dropdown";
import { MapPin, Link as LinkIcon, Plus, Minus } from "lucide-react";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";

interface LocationPickerProps {
  locationType: "online" | "offline" | "hybrid";
  locationDetails: string;
  virtualLink: string;
  onChangeLocationType: (type: "online" | "offline" | "hybrid") => void;
  onChangeLocationDetails: (val: string) => void;
  onChangeVirtualLink: (val: string) => void;
}

interface PlaceSuggestion {
  placeId: string;
  description: string;
}

const TYPE_OPTIONS = [
  { label: "Offline (Physical Location)", value: "offline" },
  { label: "Online (Virtual Event)", value: "online" },
  { label: "Hybrid (Both)", value: "hybrid" },
];

const libraries: "places"[] = ["places"];

const defaultCenter = {
  lat: 10.004675902169992, // Default to Kochi
  lng: 76.30637841229771,
};

export default function LocationPicker({
  locationType,
  locationDetails,
  virtualLink,
  onChangeLocationType,
  onChangeLocationDetails,
  onChangeVirtualLink,
}: LocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(
    async (input: string) => {
      if (
        !input ||
        !isLoaded ||
        !window.google?.maps?.places?.AutocompleteSuggestion
      ) {
        setSuggestions([]);
        return;
      }

      try {
        const request = { input };
        const response =
          await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
            request,
          );

        if (!response.suggestions || response.suggestions.length === 0) {
          setSuggestions([]);
          return;
        }

        const parsed = response.suggestions.map((s: any) => ({
          placeId: s.placePrediction.placeId,
          description: s.placePrediction.text.text,
        }));
        setSuggestions(parsed);
      } catch (error) {
        console.error("Failed to fetch places suggestions:", error);
        setSuggestions([]);
      }
    },
    [isLoaded],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isOpen && locationDetails) {
        fetchSuggestions(locationDetails);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [locationDetails, isOpen, fetchSuggestions]);

  const handleSelect = (placeId: string, description: string) => {
    onChangeLocationDetails(description);
    setSuggestions([]);
    setIsOpen(false);

    if (isLoaded && window.google?.maps?.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ placeId }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const loc = results[0].geometry.location;
          const newPos = { lat: loc.lat(), lng: loc.lng() };
          setMapCenter(newPos);
          setMarkerPosition(newPos);
        }
      });
    }
  };

  const onLoadMap = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmountMap = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom((mapRef.current.getZoom() || 15) + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom((mapRef.current.getZoom() || 15) - 1);
    }
  };

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Type Selector Dropdown */}
      <Dropdown
        options={TYPE_OPTIONS}
        value={locationType}
        onChange={(val) => onChangeLocationType(val as any)}
        className={styles.typeDropdown}
      />

      {/* Input Fields based on type */}
      <div className={styles.inputsWrapper}>
        {(locationType === "offline" || locationType === "hybrid") && (
          <>
            <div className={styles.inputWrapper}>
              <div className={styles.inputField}>
                <div className={styles.inputIcon}>
                  <MapPin size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Search physical address..."
                  value={locationDetails}
                  onChange={(e) => onChangeLocationDetails(e.target.value)}
                  onFocus={() => setIsOpen(true)}
                  className={styles.textInput}
                />
              </div>

              {isOpen &&
                locationDetails.length > 0 &&
                suggestions.length > 0 && (
                  <div className={styles.suggestionsList}>
                    {suggestions.map(({ placeId, description }) => (
                      <button
                        key={placeId}
                        className={styles.suggestionItem}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSelect(placeId, description);
                        }}
                      >
                        <div className={styles.inputIcon}>
                          <MapPin size={16} />
                        </div>
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {description}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
            </div>

            {/* Map Container outside the search box */}
            {locationDetails && (
              <div className={styles.mapContainer}>
                {isLoaded ? (
                  <>
                    <GoogleMap
                      mapContainerStyle={{ width: "100%", height: "100%" }}
                      center={mapCenter}
                      zoom={15}
                      onLoad={onLoadMap}
                      onUnmount={onUnmountMap}
                      options={{
                        disableDefaultUI: true,
                        zoomControl: false,
                        keyboardShortcuts: false,
                        styles: [
                          {
                            elementType: "geometry",
                            stylers: [{ color: "#212121" }],
                          },
                          {
                            elementType: "labels.icon",
                            stylers: [{ visibility: "off" }],
                          },
                          {
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#757575" }],
                          },
                          {
                            elementType: "labels.text.stroke",
                            stylers: [{ color: "#212121" }],
                          },
                          {
                            featureType: "administrative",
                            elementType: "geometry",
                            stylers: [{ color: "#757575" }],
                          },
                          {
                            featureType: "administrative.country",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#9e9e9e" }],
                          },
                          {
                            featureType: "administrative.land_parcel",
                            stylers: [{ visibility: "off" }],
                          },
                          {
                            featureType: "administrative.locality",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#bdbdbd" }],
                          },
                          {
                            featureType: "poi",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#757575" }],
                          },
                          {
                            featureType: "poi.park",
                            elementType: "geometry",
                            stylers: [{ color: "#181818" }],
                          },
                          {
                            featureType: "poi.park",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#616161" }],
                          },
                          {
                            featureType: "poi.park",
                            elementType: "labels.text.stroke",
                            stylers: [{ color: "#1b1b1b" }],
                          },
                          {
                            featureType: "road",
                            elementType: "geometry.fill",
                            stylers: [{ color: "#2c2c2c" }],
                          },
                          {
                            featureType: "road",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#8a8a8a" }],
                          },
                          {
                            featureType: "road.arterial",
                            elementType: "geometry",
                            stylers: [{ color: "#373737" }],
                          },
                          {
                            featureType: "road.highway",
                            elementType: "geometry",
                            stylers: [{ color: "#3c3c3c" }],
                          },
                          {
                            featureType: "road.highway.controlled_access",
                            elementType: "geometry",
                            stylers: [{ color: "#4e4e4e" }],
                          },
                          {
                            featureType: "road.local",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#616161" }],
                          },
                          {
                            featureType: "transit",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#757575" }],
                          },
                          {
                            featureType: "water",
                            elementType: "geometry",
                            stylers: [{ color: "#000000" }],
                          },
                          {
                            featureType: "water",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#3d3d3d" }],
                          },
                        ],
                      }}
                    >
                      {markerPosition && <Marker position={markerPosition} />}
                    </GoogleMap>

                    <div className={styles.customZoomControls}>
                      <button
                        type="button"
                        className={styles.zoomBtn}
                        onClick={handleZoomIn}
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        type="button"
                        className={styles.zoomBtn}
                        onClick={handleZoomOut}
                      >
                        <Minus size={16} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: "1rem", color: "gray" }}>
                    Loading interactive map...
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {(locationType === "online" || locationType === "hybrid") && (
          <div className={styles.inputField}>
            <div className={styles.inputIcon}>
              <LinkIcon size={16} />
            </div>
            <input
              type="url"
              placeholder="Virtual event link (e.g. Zoom, Google Meet)"
              value={virtualLink}
              onChange={(e) => onChangeVirtualLink(e.target.value)}
              className={styles.textInput}
            />
          </div>
        )}
      </div>
    </div>
  );
}
