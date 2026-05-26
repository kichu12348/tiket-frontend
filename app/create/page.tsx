"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FastAverageColor } from "fast-average-color";
import {
  ImagePlus,
  Globe,
  LayoutTemplate,
  Shuffle,
  MapPin,
  Ticket,
  Users,
  CheckCircle,
  Type,
} from "lucide-react";
import styles from "./Create.module.css";
import api from "@/lib/api";

// Custom components
import DatePicker from "./components/DatePicker";
import TimePicker from "./components/TimePicker";
import TimezonePicker from "./components/TimezonePicker";
import LocationPicker from "./components/LocationPicker";
import DescriptionModal from "./components/DescriptionModal";

export default function CreateEventPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [bgColor, setBgColor] = useState<string>("");
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const [title, setTitle] = useState("");

  // Date/Time State
  const [startDate, setStartDate] = useState(new Date().toISOString());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 3600000).toISOString(),
  );
  const [timezone, setTimezone] = useState("GMT+05:30");

  const [locationType, setLocationType] = useState<
    "online" | "offline" | "hybrid"
  >("offline");
  const [locationDetails, setLocationDetails] = useState("");
  const [virtualLink, setVirtualLink] = useState("");
  const [description, setDescription] = useState("");
  const [isDescModalOpen, setIsDescModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize FastAverageColor
  const fac = new FastAverageColor();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverImageUrl(url);

      fac
        .getColorAsync(url)
        .then((color) => {
          setBgColor(color.hex);
        })
        .catch((e) => {
          console.error("Error extracting color:", e);
        });
    }
  };

  const handleCreate = async () => {
    try {
      setIsSubmitting(true);

      let finalLocationDetails = locationDetails;
      if (locationType === "online") {
        finalLocationDetails = virtualLink;
      } else if (locationType === "hybrid") {
        finalLocationDetails = `Physical: ${locationDetails} | Virtual: ${virtualLink}`;
      }

      const payload = {
        title: title || "Untitled Event",
        startDate,
        endDate,
        locationType,
        locationDetails: finalLocationDetails || "TBA",
        description: description,
        coverImage: coverImageUrl || "",
        color: bgColor || "#000000",
        status: "published",
      };

      console.log(JSON.stringify(payload, null, 2));

      // await api.post("/api/events", payload);
      // router.push("/home");
    } catch (error) {
      console.error("Failed to create event:", error);
      alert("Failed to create event. Please check inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={styles.page}
      style={
        bgColor ? ({ "--dynamic-bg": bgColor } as React.CSSProperties) : {}
      }
    >
      <div className={styles.container}>
        {/* Left Pane */}
        <div className={styles.leftPane}>
          <div
            className={styles.imageUploadBlock}
            onClick={() => fileInputRef.current?.click()}
            style={{
              borderWidth: coverImageUrl ? "0px" : "1px",
            }}
          >
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt="Cover Preview"
                className={styles.uploadedImage}
              />
            ) : (
              <div className={styles.uploadIconWrapper}>
                <ImagePlus size={32} strokeWidth={1.5} />
                <span style={{ fontSize: "0.9rem" }}>Add Cover Image</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className={styles.hiddenInput}
              onChange={handleImageUpload}
            />
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <div className={styles.themeSelector} style={{ flex: 1 }}>
              <div className={styles.themeInfo}>
                <div className={styles.themeThumbnail}></div>
                <div className={styles.themeLabel}>
                  <span style={{ fontSize: "0.7rem" }}>Theme</span>
                  <span className={styles.themeName}>Minimal</span>
                </div>
              </div>
              <LayoutTemplate size={16} />
            </div>
            <div
              className={styles.themeSelector}
              style={{ width: "48px", justifyContent: "center" }}
            >
              <Shuffle size={16} />
            </div>
          </div>
        </div>

        {/* Right Pane */}
        <div className={styles.rightPane}>
          <div className={styles.topToggles}>
            <div className={styles.togglePill}>
              <div className={styles.avatar}>:)</div>
              <span>Personal Calendar</span>
            </div>
            <div className={styles.togglePill}>
              <Globe size={14} />
              <span>Public</span>
            </div>
          </div>

          <input
            type="text"
            placeholder="Event Name"
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Time Block (Luma Style) */}
          <div className={styles.formBlock}>
            <div className={styles.timeLayout}>
              <div className={styles.timeInputsWrapper}>
                {/* Timeline vertical connector */}
                <div className={styles.timeConnector}>
                  <div className={styles.dotFilled}></div>
                  <div className={styles.line}></div>
                  <div className={styles.dotEmpty}></div>
                </div>

                <div className={styles.timeRows}>
                  <div className={styles.timeRow}>
                    <span className={styles.timeLabel}>Start</span>
                    <div className={styles.pickersBox}>
                      <DatePicker date={startDate} onChange={setStartDate} />
                      <TimePicker date={startDate} onChange={setStartDate} />
                    </div>
                  </div>

                  <div className={styles.timeRow}>
                    <span className={styles.timeLabel}>End</span>
                    <div className={styles.pickersBox}>
                      <DatePicker date={endDate} onChange={setEndDate} />
                      <TimePicker date={endDate} onChange={setEndDate} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Timezone right side */}
              <TimezonePicker value={timezone} onChange={setTimezone} />
            </div>
          </div>

          {/* Location Block */}
          <div className={styles.formBlock}>
            <div className={styles.formRow}>
              <div className={styles.iconCol}>
                <MapPin size={18} />
              </div>
              <div className={styles.inputGroupCol}>
                <span className={styles.mainInputLabel}>
                  Add Event Location
                </span>
                <LocationPicker
                  locationType={locationType}
                  locationDetails={locationDetails}
                  virtualLink={virtualLink}
                  onChangeLocationType={setLocationType}
                  onChangeLocationDetails={setLocationDetails}
                  onChangeVirtualLink={setVirtualLink}
                />
              </div>
            </div>
          </div>

          {/* Description Block */}
          <div className={styles.formBlock}>
            <div
              className={styles.formRow}
              style={{ alignItems: "flex-start", paddingBottom: "1rem" }}
            >
              <div className={styles.iconCol} style={{ marginTop: "0.2rem" }}>
                <Type size={18} />
              </div>
              <div className={styles.inputGroupCol}>
                <span className={styles.mainInputLabel}>Add Description</span>
                <div 
                  className={styles.subInput}
                  style={{ 
                    minHeight: "60px", 
                    marginTop: "0.25rem", 
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "flex-start",
                    padding: "0.75rem",
                    color: description ? "var(--color-text-primary)" : "rgba(255, 255, 255, 0.4)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word"
                  }}
                  onClick={() => setIsDescModalOpen(true)}
                >
                  {description ? (
                    <div dangerouslySetInnerHTML={{ __html: description }} />
                  ) : (
                    "Write something..."
                  )}
                </div>
              </div>
            </div>
          </div>

          <span className={styles.optionsHeader}>Event Options</span>

          <div className={styles.formBlock}>
            <div className={styles.optionRow}>
              <div className={styles.iconCol}>
                <Ticket size={18} />
              </div>
              <div className={styles.optionGroup}>
                <span className={styles.label}>Ticket Price</span>
                <span className={styles.valueInput}>Free</span>
              </div>
            </div>

            <div className={styles.optionRow}>
              <div className={styles.iconCol}>
                <CheckCircle size={18} />
              </div>
              <div className={styles.optionGroup}>
                <span className={styles.label}>Require Approval</span>
                <div
                  style={{
                    width: 36,
                    height: 20,
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: 10,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      right: 2,
                      top: 2,
                      width: 16,
                      height: 16,
                      background: "#fff",
                      borderRadius: "50%",
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className={styles.optionRow}>
              <div className={styles.iconCol}>
                <Users size={18} />
              </div>
              <div className={styles.optionGroup}>
                <span className={styles.label}>Capacity</span>
                <span className={styles.valueInput}>Unlimited</span>
              </div>
            </div>
          </div>

          <button
            className={styles.createBtn}
            onClick={handleCreate}
            disabled={isSubmitting}
            style={{ marginTop: "1rem" }}
          >
            {isSubmitting ? "Creating..." : "Create Event"}
          </button>
        </div>
      </div>

      <DescriptionModal
        isOpen={isDescModalOpen}
        initialValue={description}
        onClose={() => setIsDescModalOpen(false)}
        onSave={(val) => setDescription(val)}
      />
    </div>
  );
}
