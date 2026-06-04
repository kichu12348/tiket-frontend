import { useState, useRef, useCallback, useEffect } from "react";
import styles from "./LocationPicker.module.css";
import Dropdown from "../Dropdown";
import { MapPin, Link as LinkIcon, Plus, Minus } from "lucide-react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
  MapMouseEvent,
  MapControl,
  ControlPosition,
  ColorScheme,
} from "@vis.gl/react-google-maps";
import { GOOGLE_MAPS_API_KEY, MAP_ID } from "@/constants/config";

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
  { label: "Offline", value: "offline", desc: "Physical Location" },
  { label: "Online", value: "online", desc: "Virtual Event" },
  { label: "Hybrid", value: "hybrid", desc: "Physical + Virtual" },
];

const defaultCenter = {
  lat: 10.004675902169992, // Default to Kochi
  lng: 76.30637841229771,
};

function LocationPickerInner({
  locationType,
  locationDetails,
  virtualLink,
  onChangeLocationType,
  onChangeLocationDetails,
  onChangeVirtualLink,
}: LocationPickerProps) {
  const map = useMap(MAP_ID);
  const placesLib = useMapsLibrary("places");
  const geocodingLib = useMapsLibrary("geocoding");

  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [hasInitialized, setHasInitialized] = useState(false);
  const [zoom, setZoom] = useState(12);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync prop -> local state on mount or when locationDetails changes externally
  useEffect(() => {
    if (!locationDetails) {
      setSearchValue("");
      return;
    }
    try {
      const parsed = JSON.parse(locationDetails);
      if (parsed.address || parsed.name) {
        setSearchValue(parsed.address || parsed.name);
      }
      if (parsed.lat && parsed.lng && !hasInitialized) {
        const pos = { lat: parsed.lat, lng: parsed.lng };
        setMapCenter(pos);
        setMarkerPosition(pos);
        setHasInitialized(true);
      }
    } catch {
      // Fallback if it's just a raw string
      setSearchValue(locationDetails);
    }
  }, [locationDetails, hasInitialized]);

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
      if (!input || !placesLib || !(placesLib as any).AutocompleteSuggestion) {
        setSuggestions([]);
        return;
      }

      try {
        const request = { input };
        const response = await (
          placesLib as any
        ).AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

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
    [placesLib],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isOpen && searchValue) {
        fetchSuggestions(searchValue);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchValue, isOpen, fetchSuggestions]);

  const handleSelect = (placeId: string, description: string) => {
    setSearchValue(description);
    setSuggestions([]);
    setIsOpen(false);

    if (geocodingLib) {
      const geocoder = new geocodingLib.Geocoder();
      geocoder.geocode({ placeId }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const loc = results[0].geometry.location;
          const lat =
            typeof loc.lat === "function" ? loc.lat() : (loc as any).lat;
          const lng =
            typeof loc.lng === "function" ? loc.lng() : (loc as any).lng;
          const newPos = { lat, lng };
          setMapCenter(newPos);
          setMarkerPosition(newPos);

          onChangeLocationDetails(
            JSON.stringify({
              address: results[0].formatted_address,
              placeId: placeId,
              lat,
              lng,
            }),
          );
        } else {
          onChangeLocationDetails(description);
        }
      });
    } else {
      onChangeLocationDetails(description);
    }
  };

  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      if (!e.detail.latLng) return;

      const lat = e.detail.latLng.lat;
      const lng = e.detail.latLng.lng;
      const newPos = { lat, lng };

      setMarkerPosition(newPos);
      setMapCenter(newPos);

      if (geocodingLib) {
        const geocoder = new geocodingLib.Geocoder();
        geocoder.geocode({ location: newPos }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const address = results[0].formatted_address;
            const placeId = results[0].place_id;
            setSearchValue(address);
            onChangeLocationDetails(
              JSON.stringify({
                address,
                placeId,
                lat,
                lng,
              }),
            );
          }
        });
      }
    },
    [geocodingLib, onChangeLocationDetails],
  );

  const handleZoomIn = () => {
    setZoom((prev) => prev + 1);
  };

  const handleZoomOut = () => {
    setZoom((prev) => prev - 1);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <Dropdown
        options={TYPE_OPTIONS}
        value={locationType}
        onChange={(val) => onChangeLocationType(val as any)}
        className={styles.typeDropdown}
        alignSelf="flex-end"
        popoverAlign="right"
      />

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
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    onChangeLocationDetails(e.target.value);
                  }}
                  onFocus={() => setIsOpen(true)}
                  className={styles.textInput}
                />
              </div>

              {isOpen && searchValue.length > 0 && suggestions.length > 0 && (
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

            <div className={styles.mapContainer}>
              <Map
                mapId={MAP_ID}
                style={{ width: "100%", height: "100%" }}
                defaultCenter={defaultCenter}
                center={mapCenter}
                onCenterChanged={(ev) => setMapCenter(ev.detail.center)}
                zoom={zoom}
                onClick={handleMapClick}
                disableDefaultUI={true}
                keyboardShortcuts={false}
                colorScheme={ColorScheme.DARK}
                onZoomChanged={(e) => setZoom(e.detail.zoom)}
              >
                {markerPosition && <AdvancedMarker position={markerPosition} />}
                <MapControl position={ControlPosition.RIGHT_BOTTOM}>
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
                </MapControl>
              </Map>
            </div>
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

export default function LocationPicker(props: LocationPickerProps) {
  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <LocationPickerInner {...props} />
    </APIProvider>
  );
}
