"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FastAverageColor } from "fast-average-color";
import {
  ImagePlus,
  Globe,
  Lock,
  MapPin,
  Users,
  CheckCircle,
  Type,
  CalendarClock,
  CalendarCheck,
  Trash2,
  UploadCloud,
  ImageIcon,
  FileEdit,
  XCircle,
} from "lucide-react";
import styles from "./Edit.module.css";
import {
  getSignedUrl,
  uploadToCDN,
  updateEvent,
  getEvent,
  updateEventSlug,
} from "@/api/events";
import { getImageUrl } from "@/constants/config";
import SkeletonLoader from "./components/SkeletonLoader";

// Custom components
import DateRangeBlock from "@/components/DateRangeBlock";
import FontPicker from "@/components/FontPicker";
import LocationPicker from "@/components/LocationPicker";
import DescriptionModal from "@/components/DescriptionModal";
import DOMPurify from "isomorphic-dompurify";
import Dropdown from "@/components/Dropdown";
import Switch from "@/components/Switch";
import { toast } from "sonner";
import Modal from "@/components/Modal";
import { Event, UpdateEventPayload } from "@/types/event";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const eventRef = useRef<Event | null>(null);

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [bgColor, setBgColor] = useState<string>("");
  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [titleFont, setTitleFont] = useState("'Inter', sans-serif");

  // Date/Time State
  const [startDate, setStartDate] = useState(new Date().toISOString());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 3600000).toISOString(),
  );
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  // Registration Date/Time State
  const [regStartDate, setRegStartDate] = useState(new Date().toISOString());
  const [regEndDate, setRegEndDate] = useState(
    new Date(Date.now() + 86400000).toISOString(),
  );

  const [locationType, setLocationType] = useState<
    "online" | "offline" | "hybrid"
  >("offline");
  const [locationDetails, setLocationDetails] = useState("");
  const [virtualLink, setVirtualLink] = useState("");
  const [description, setDescription] = useState("");
  const [isDescModalOpen, setIsDescModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);
  const [capacity, setCapacity] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [status, setStatus] = useState<
    "draft" | "published" | "completed" | "cancelled"
  >("draft");
  const [slug, setSlug] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [isUpdatingSlug, setIsUpdatingSlug] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Initialize FastAverageColor
  const fac = new FastAverageColor();

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const eventData = await getEvent(eventId);

        eventRef.current = eventData;

        setTitle(eventData.title || "");
        setTitleFont(eventData.fontFamily || "'Inter', sans-serif");
        setDescription(eventData.description || "");
        setLocationType(eventData.locationType || "offline");

        if (eventData.locationType === "online") {
          setVirtualLink(eventData.locationDetails || "");
        } else if (eventData.locationType === "hybrid") {
          const parts = (eventData.locationDetails || "").split(" | Virtual: ");
          if (parts.length === 2) {
            setLocationDetails(parts[0].replace("Physical: ", ""));
            setVirtualLink(parts[1]);
          } else {
            setLocationDetails(eventData.locationDetails || "");
          }
        } else {
          setLocationDetails(eventData.locationDetails || "");
        }

        setStartDate(eventData.startDate || new Date().toISOString());
        setEndDate(
          eventData.endDate || new Date(Date.now() + 3600000).toISOString(),
        );
        setTimezone(
          eventData.timezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
        );
        setRegStartDate(
          eventData.registrationStart || new Date().toISOString(),
        );
        setRegEndDate(
          eventData.registrationEnd ||
            new Date(Date.now() + 86400000).toISOString(),
        );

        setRequireApproval(eventData.requireApproval || false);
        setCapacity(eventData.capacity ? eventData.capacity.toString() : "");
        setBgColor(eventData.color || "");
        setStatus(eventData.status || "draft");
        setSlug(eventData.slug || "");

        if (eventData.coverImage) {
          setCoverImageUrl(getImageUrl(eventData.coverImage));
        }
      } catch (error) {
        console.log("Failed to fetch event data", error);
        toast.error("Failed to load event data.");
        router.push("/home");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) fetchEvent();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
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

  const handleSlugUpdate = async () => {
    if (slug === eventRef.current?.slug) {
      toast.info("Slug is already the same.");
      return;
    }

    if (slug.trim().length < 3) {
      toast.error("Slug must be at least 3 characters long.");
      return;
    }

    if (!slug.trim()) {
      toast.error("Slug cannot be empty.");
      return;
    }

    try {
      setIsUpdatingSlug(true);
      await updateEventSlug(eventId as string, slug);
      toast.success("Slug updated successfully!");
      eventRef.current!.slug = slug;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to update slug.";
      toast.error(errorMessage);
    } finally {
      setIsUpdatingSlug(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setIsSubmitting(true);

      if (!hasEventChanged()) {
        toast.info("No changes to update.");
        setIsSubmitting(false);
        return;
      }

      // --- VALIDATIONS ---
      if (!title.trim()) {
        toast.error("Event title is required.");
        setIsSubmitting(false);
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) {
        toast.error("Event end date must be after the start date.");
        setIsSubmitting(false);
        return;
      }

      const rStart = new Date(regStartDate);
      const rEnd = new Date(regEndDate);
      if (rEnd <= rStart) {
        toast.error("Registration end date must be after the start date.");
        setIsSubmitting(false);
        return;
      }

      if (rEnd > end) {
        toast.error("Registration cannot end after the event has ended.");
        setIsSubmitting(false);
        return;
      }

      if (capacity && parseInt(capacity, 10) <= 0) {
        toast.error("Capacity must be a valid number greater than 0.");
        setIsSubmitting(false);
        return;
      }
      // -------------------

      let finalLocationDetails = locationDetails;
      if (locationType === "online") {
        finalLocationDetails = virtualLink;
      } else if (locationType === "hybrid") {
        finalLocationDetails = `Physical: ${locationDetails} | Virtual: ${virtualLink}`;
      }

      let finalCoverImage = undefined;

      if (coverImageFile) {
        toast.info("Uploading cover image...");
        try {
          const { url: signedUrl, max_size } = await getSignedUrl(
            coverImageFile.name,
            coverImageFile.type.split("/")[1],
          );

          if (coverImageFile.size / 1024 / 1024 > max_size) {
            toast.error(`Image size must be less than ${max_size}MB`);
            setIsSubmitting(false);
            return;
          }

          const { filename } = await uploadToCDN(signedUrl, coverImageFile);
          finalCoverImage = filename;
        } catch (err) {
          console.error("Failed to upload image to CDN:", err);
          toast.error("Failed to upload cover image. Please try again.");
          setIsSubmitting(false);
          return;
        }
      }

      const payload: UpdateEventPayload = {
        title: title || "Untitled Event",
        description,
        locationType,
        locationDetails:
          locationType === "online" ? virtualLink : finalLocationDetails,
        startDate,
        endDate,
        timezone,
        registrationStart: regStartDate,
        registrationEnd: regEndDate,
        fontFamily: titleFont,
        requireApproval,
        capacity: capacity ? parseInt(capacity, 10) : null,
        color: bgColor || "#000000",
        status,
      };

      if (finalCoverImage) {
        payload.coverImage = finalCoverImage;
      }

      const res = await updateEvent(eventId, payload);

      if (res) {
        eventRef.current = res;
        toast.success("Event updated successfully!");
      }
    } catch (error: any) {
      console.error("Error updating event:", error);
      const errorMessage =
        error.response?.data?.error ||
        "An error occurred while updating the event.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSlugButtonDisabled = () => {
    return (
      isUpdatingSlug ||
      slug === eventRef.current?.slug ||
      slug.trim().length < 3
    );
  };

  const hasEventChanged = () => {
    if (!eventRef.current) return false;

    if (coverImageFile !== null) return true;
    if (!coverImageUrl && eventRef.current.coverImage) return true;

    let finalLocationDetails = locationDetails;
    if (locationType === "online") {
      finalLocationDetails = virtualLink;
    } else if (locationType === "hybrid") {
      finalLocationDetails = `Physical: ${locationDetails} | Virtual: ${virtualLink}`;
    }

    const normalizeDate = (d1: any, d2: any) => {
      if (!d1 && !d2) return true;
      if (!d1 || !d2) return false;
      return new Date(d1).getTime() === new Date(d2).getTime();
    };

    const isSame =
      eventRef.current.title === title &&
      (eventRef.current.description || "") === description &&
      eventRef.current.locationType === locationType &&
      (eventRef.current.locationDetails || "") === finalLocationDetails &&
      normalizeDate(eventRef.current.startDate, startDate) &&
      normalizeDate(eventRef.current.endDate, endDate) &&
      eventRef.current.timezone === timezone &&
      normalizeDate(eventRef.current.registrationStart, regStartDate) &&
      normalizeDate(eventRef.current.registrationEnd, regEndDate) &&
      (eventRef.current.fontFamily || "'Inter', sans-serif") === titleFont &&
      !!eventRef.current.requireApproval === requireApproval &&
      eventRef.current.capacity ===
        (capacity ? parseInt(capacity, 10) : null) &&
      (eventRef.current.color || "") === bgColor &&
      eventRef.current.status === status;

    return !isSame;
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

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
            onClick={() => setIsImageModalOpen(true)}
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

          <FontPicker value={titleFont} onChange={setTitleFont} />
        </div>

        {/* Right Pane */}
        <div className={styles.rightPane}>
          <div className={styles.topToggles}>
            <div className={styles.togglePill}>
              <Dropdown
                options={[
                  {
                    label: "Draft",
                    value: "draft",
                    LeftComponent: <FileEdit size={14} />,
                  },
                  {
                    label: "Published",
                    value: "published",
                    LeftComponent: <Globe size={14} />,
                  },
                  {
                    label: "Completed",
                    value: "completed",
                    LeftComponent: <CheckCircle size={14} />,
                  },
                  {
                    label: "Cancelled",
                    value: "cancelled",
                    LeftComponent: <XCircle size={14} />,
                  },
                ]}
                value={status}
                onChange={(value) => setStatus(value as any)}
              />
            </div>
            <div className={styles.togglePill}>
              <Dropdown
                options={[
                  {
                    label: "Public",
                    value: "public",
                    LeftComponent: <Globe size={14} />,
                    desc: "Anyone can find this event",
                  },
                  {
                    label: "Private",
                    value: "private",
                    LeftComponent: <Lock size={14} />,
                    desc: "Only people with the link can register",
                  },
                ]}
                value={visibility}
                onChange={(value) =>
                  setVisibility(value as "public" | "private")
                }
              />
            </div>
          </div>

          <input
            type="text"
            placeholder="Event Name"
            className={styles.titleInput}
            style={{ fontFamily: titleFont, marginBottom: "0" }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className={styles.slugInputWrapper}>
            <span className={styles.slugBase}>{baseUrl}/</span>
            <input
              type="text"
              className={styles.slugInput}
              value={slug}
              onChange={(e) =>
                setSlug(
                  e.target.value
                    .toLowerCase()
                    .replace(/\s/g, "-")
                    .replace(/[^a-z0-9-]/g, "")
                    .replace(/-{2,}/g, "-"),
                )
              }
              placeholder="event-slug"
            />
            <button
              className={styles.slugSaveBtn}
              onClick={handleSlugUpdate}
              disabled={isSlugButtonDisabled()}
              style={{ opacity: isSlugButtonDisabled() ? 0.5 : 1 }}
            >
              {isUpdatingSlug ? "Saving..." : "Save"}
            </button>
          </div>

          {/* Event Date & Time */}
          <div className={styles.sectionLabel}>
            <CalendarClock size={15} strokeWidth={1.8} />
            <span>Event Date & Time</span>
          </div>
          <DateRangeBlock
            startDate={startDate}
            endDate={endDate}
            timezone={timezone}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onTimezoneChange={setTimezone}
          />

          {/* Registration Period */}
          <div className={styles.sectionLabel}>
            <CalendarCheck size={15} strokeWidth={1.8} />
            <span>Registration Period</span>
          </div>
          <DateRangeBlock
            startDate={regStartDate}
            endDate={regEndDate}
            timezone={timezone}
            onStartDateChange={setRegStartDate}
            onEndDateChange={setRegEndDate}
            onTimezoneChange={setTimezone}
            timezonePickerDisabled={true}
          />

          {/* Location Block */}
          <div className={styles.sectionLabel}>
            <MapPin size={15} strokeWidth={1.8} />
            <span>Location</span>
          </div>
          <div className={styles.formBlock}>
            <div style={{ padding: "1rem" }}>
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

          {/* Description Block */}
          <div className={styles.sectionLabel}>
            <Type size={15} strokeWidth={1.8} />
            <span>Description</span>
          </div>
          <div className={styles.formBlock}>
            <div
              className={styles.subInput}
              style={{
                minHeight: "60px",
                cursor: "pointer",
                display: "flex",
                alignItems: "flex-start",
                padding: "1rem",
                color: description
                  ? "var(--color-text-primary)"
                  : "rgba(255, 255, 255, 0.4)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
              onClick={() => setIsDescModalOpen(true)}
            >
              {description ? (
                <div
                  className="prose"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(description),
                  }}
                />
              ) : (
                "Write something..."
              )}
            </div>
          </div>

          <span className={styles.optionsHeader}>Event Options</span>

          <div className={styles.formBlock}>
            <div className={styles.optionRow}>
              <div className={styles.iconCol}>
                <CheckCircle size={18} />
              </div>
              <div className={styles.optionGroup}>
                <span className={styles.label}>Require Approval</span>
                <Switch
                  checked={requireApproval}
                  onChange={setRequireApproval}
                />
              </div>
            </div>

            <div className={styles.optionRow}>
              <div className={styles.iconCol}>
                <Users size={18} />
              </div>
              <div className={styles.optionGroup}>
                <span className={styles.label}>Capacity</span>
                <input
                  type="number"
                  className={styles.valueInput}
                  placeholder="Unlimited"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  min="1"
                />
              </div>
            </div>
          </div>

          <button
            className={styles.createBtn}
            onClick={handleUpdate}
            disabled={isSubmitting || !hasEventChanged()}
            style={{
              marginTop: "1rem",
              opacity: !hasEventChanged() ? 0.5 : 1,
            }}
          >
            {isSubmitting ? "Updating..." : "Update Event"}
          </button>
        </div>
      </div>

      <DescriptionModal
        isOpen={isDescModalOpen}
        initialValue={description}
        onClose={() => setIsDescModalOpen(false)}
        onSave={(val) => setDescription(val)}
      />

      <Modal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        title="Cover Image Options"
      >
        <div className={styles.modalBtnGroup}>
          {coverImageUrl ? (
            <>
              <button
                className={styles.modalActionBtn}
                onClick={() => {
                  fileInputRef.current?.click();
                  setIsImageModalOpen(false);
                }}
              >
                <div className={styles.iconCircle}>
                  <ImageIcon size={18} strokeWidth={1.5} />
                </div>
                <span>Change cover image</span>
              </button>
              <button
                className={`${styles.modalActionBtn} ${styles.dangerBtn}`}
                onClick={() => {
                  setCoverImageUrl("");
                  setCoverImageFile(null);
                  setBgColor("");
                  setIsImageModalOpen(false);
                }}
              >
                <div className={styles.iconCircleDanger}>
                  <Trash2 size={18} strokeWidth={1.5} />
                </div>
                <span>Remove cover image</span>
              </button>
            </>
          ) : (
            <button
              className={styles.modalActionBtn}
              onClick={() => {
                fileInputRef.current?.click();
                setIsImageModalOpen(false);
              }}
            >
              <div className={styles.iconCircle}>
                <UploadCloud size={18} strokeWidth={1.5} />
              </div>
              <span>Upload image</span>
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}
