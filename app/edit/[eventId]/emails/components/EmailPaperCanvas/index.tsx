"use client";

import React, { useState, useEffect } from "react";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { TextStyle, Color, FontFamily } from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";

import { EmailTemplate, AvailableVariables } from "@/types/email";
import { EmailModelSerializer } from "@/lib/emailModelSerializer";
import { toast } from "sonner";
import Dropdown from "@/components/Dropdown";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import {
  Monitor,
  Smartphone,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  MousePointerClick,
  Save,
  RotateCcw,
  RotateCw,
  Send,
  Users,
  Power,
  Trash2,
  Sparkles,
  Eye,
  Edit3,
  Code,
  Palette,
  Highlighter,
  Plus,
  SlidersHorizontal,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import Modal from "@/components/Modal";
import styles from "./EmailPaperCanvas.module.css";

interface EmailPaperCanvasProps {
  template: EmailTemplate;
  variables: AvailableVariables | null;
  onSave: (updated: Partial<EmailTemplate>) => Promise<void>;
  onReset: () => Promise<void>;
  onDelete?: () => Promise<void>;
  onOpenSendTest: () => void;
  onOpenSendBatch: () => void;
  isSaving: boolean;
}

const TEXT_COLORS = [
  { label: "Dark (Default)", value: "#111827" },
  { label: "Blue", value: "#2563eb" },
  { label: "Red", value: "#dc2626" },
  { label: "Green", value: "#16a34a" },
  { label: "Orange", value: "#d97706" },
  { label: "Purple", value: "#9333ea" },
  { label: "White", value: "#ffffff" },
  { label: "Gray", value: "#6b7280" },
];

const HIGHLIGHT_COLORS = [
  { label: "Yellow", value: "#fef08a" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Blue", value: "#bfdbfe" },
  { label: "Pink", value: "#fbcfe8" },
  { label: "Gray", value: "#f3f4f6" },
];

const FONT_FAMILIES = [
  { label: "Default (System)", value: "__default__" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Playfair Display", value: "'Playfair Display', serif" },
  { label: "Roboto", value: "'Roboto', sans-serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
];

const FONT_WEIGHTS = [
  { label: "Normal (400)", value: "400" },
  { label: "Medium (500)", value: "500" },
  { label: "Semi-Bold (600)", value: "600" },
  { label: "Bold (700)", value: "700" },
  { label: "Extra Bold (800)", value: "800" },
];

const BORDER_STYLES = [
  { label: "None", value: "none" },
  { label: "Solid", value: "solid" },
  { label: "Dashed", value: "dashed" },
  { label: "Dotted", value: "dotted" },
];

const BORDER_WIDTHS = [
  { label: "0px", value: "0px" },
  { label: "1px", value: "1px" },
  { label: "2px", value: "2px" },
  { label: "3px", value: "3px" },
  { label: "4px", value: "4px" },
];

const CORNER_RADII = [
  { label: "0px", value: "0px" },
  { label: "4px", value: "4px" },
  { label: "8px", value: "8px" },
  { label: "12px", value: "12px" },
  { label: "16px", value: "16px" },
];

const PADDING_SIZES = [
  { label: "0px", value: "0px" },
  { label: "4px", value: "4px" },
  { label: "8px", value: "8px" },
  { label: "12px", value: "12px" },
  { label: "16px", value: "16px" },
  { label: "24px", value: "24px" },
];

const ELEMENT_TYPES = [
  { label: "Paragraph", value: "p" },
  { label: "Heading 1", value: "h1" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
  { label: "Blockquote", value: "quote" },
  { label: "Bullet List", value: "bullet" },
  { label: "Numbered List", value: "ordered" },
];

// Custom Tiptap Extension for Block Inline Attributes
const BlockStyleExtension = Extension.create({
  name: "blockStyle",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading", "blockquote", "listItem"],
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: (element) => element.style.backgroundColor || null,
            renderHTML: (attributes) => {
              if (!attributes.backgroundColor) return {};
              return {
                style: `background-color: ${attributes.backgroundColor}`,
              };
            },
          },
          borderColor: {
            default: null,
            parseHTML: (element) => element.style.borderColor || null,
            renderHTML: (attributes) => {
              if (!attributes.borderColor) return {};
              return { style: `border-color: ${attributes.borderColor}` };
            },
          },
          borderWidth: {
            default: null,
            parseHTML: (element) => element.style.borderWidth || null,
            renderHTML: (attributes) => {
              if (!attributes.borderWidth) return {};
              return { style: `border-width: ${attributes.borderWidth}` };
            },
          },
          borderStyle: {
            default: null,
            parseHTML: (element) => element.style.borderStyle || null,
            renderHTML: (attributes) => {
              if (!attributes.borderStyle) return {};
              return { style: `border-style: ${attributes.borderStyle}` };
            },
          },
          borderRadius: {
            default: null,
            parseHTML: (element) => element.style.borderRadius || null,
            renderHTML: (attributes) => {
              if (!attributes.borderRadius) return {};
              return { style: `border-radius: ${attributes.borderRadius}` };
            },
          },
          padding: {
            default: null,
            parseHTML: (element) => element.style.padding || null,
            renderHTML: (attributes) => {
              if (!attributes.padding) return {};
              return { style: `padding: ${attributes.padding}` };
            },
          },
        },
      },
    ];
  },
});

export default function EmailPaperCanvas({
  template,
  variables,
  onSave,
  onReset,
  onDelete,
  onOpenSendTest,
  onOpenSendBatch,
  isSaving,
}: EmailPaperCanvasProps) {
  const [name, setName] = useState(template.name);
  const [subject, setSubject] = useState(template.subject);
  const [isActive, setIsActive] = useState(template.isActive);
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [canvasMode, setCanvasMode] = useState<"edit" | "preview" | "code">(
    "edit",
  );
  const [, setSelectionTick] = useState(0);

  // Modal states for links & CTA buttons
  const [isCtaModalOpen, setIsCtaModalOpen] = useState(false);
  const [ctaLabel, setCtaLabel] = useState("View Your Digital Pass");
  const [ctaUrl, setCtaUrl] = useState("{{event.passUrl}}");
  const [ctaBgColor, setCtaBgColor] = useState("#000000");
  const [ctaTextColor, setCtaTextColor] = useState("#ffffff");

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
      }),
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          style: "color: #2563eb; text-decoration: underline;",
        },
      }),
      Image,
      Placeholder.configure({
        placeholder:
          "Click or select text here to start editing your email template...",
      }),
      BlockStyleExtension,
    ],
    content: template.body,
    immediatelyRender: false,
    onTransaction: () => {
      setSelectionTick((tick) => tick + 1);
    },
  });

  // Sync external template updates
  useEffect(() => {
    setName(template.name);
    setSubject(template.subject);
    setIsActive(template.isActive);
    if (editor && template.body !== editor.getHTML()) {
      editor.commands.setContent(template.body);
    }
  }, [template, editor]);

  if (!editor) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const jsonBody = editor.getJSON();
    const compiledHtml = EmailModelSerializer.serializeJsonToHtml(jsonBody);

    await onSave({
      name,
      subject,
      body: compiledHtml,
      bodyJson: jsonBody,
      isActive,
    });
  };

  const handleInsertVariable = (varKey: string) => {
    editor.chain().focus().insertContent(` ${varKey} `).run();
  };

  const handleInsertCtaButton = () => {
    if (!ctaLabel.trim() || !ctaUrl.trim()) return;

    const buttonHtml = `
<p style="text-align: center; margin: 28px 0;">
  <a href="${ctaUrl.trim()}" style="background-color: ${ctaBgColor}; color: ${ctaTextColor}; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
    ${ctaLabel.trim()}
  </a>
</p>
`.trim();

    editor.chain().focus().insertContent(buttonHtml).run();
    setIsCtaModalOpen(false);
  };

  const handleApplyLink = () => {
    if (!linkUrl.trim()) {
      setIsLinkModalOpen(false);
      return;
    }
    editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
    setIsLinkModalOpen(false);
    setLinkUrl("");
  };

  const allVars = variables
    ? [
        ...(variables.eventVariables || []),
        ...(variables.attendeeVariables || []),
        ...(variables.ticketVariables || []),
        ...(variables.formVariables || []),
      ]
    : [];

  const sampleValues: Record<string, string> = {};
  allVars.forEach((v) => {
    sampleValues[v.key] = v.sample;
  });

  const renderInterpolated = (templateStr: string) => {
    if (!templateStr) return "";
    return templateStr.replace(
      /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g,
      (match, key) => {
        const fullKey = `{{${key}}}`;
        return sampleValues[fullKey] || match;
      },
    );
  };

  const previewSubject = renderInterpolated(subject) || "(No Subject)";
  const jsonTree = editor.getJSON();
  const compiledRawHtml = EmailModelSerializer.serializeJsonToHtml(jsonTree);
  const previewBodyHtml =
    renderInterpolated(compiledRawHtml) ||
    "<p style='color:#9ca3af;'>No content written yet...</p>";

  // Current Active Node Style Getters
  const currentFontFamily =
    editor.getAttributes("textStyle").fontFamily || "__default__";
  const currentFontWeight =
    editor.getAttributes("textStyle").fontWeight || "400";
  const currentBorderStyle =
    editor.getAttributes("paragraph").borderStyle || "none";
  const currentBorderWidth =
    editor.getAttributes("paragraph").borderWidth || "0px";
  const currentBorderRadius =
    editor.getAttributes("paragraph").borderRadius || "0px";
  const currentPadding = editor.getAttributes("paragraph").padding || "0px";

  const currentElementType = editor.isActive("heading", { level: 1 })
    ? "h1"
    : editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
    ? "h3"
    : editor.isActive("blockquote")
    ? "quote"
    : editor.isActive("bulletList")
    ? "bullet"
    : editor.isActive("orderedList")
    ? "ordered"
    : "p";

  return (
    <form className={styles.workspaceCard} onSubmit={handleSave}>
      {/* Upper Control Bar */}
      <div className={styles.topControlBar}>
        <div className={styles.metaRow}>
          <input
            type="text"
            className={styles.nameInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Template Name"
            required
          />
          <span className={styles.typeBadge} data-type={template.type}>
            {template.type}
          </span>
        </div>

        <div className={styles.rightBarGroup}>
          {/* Undo / Redo */}
          <div className={styles.undoRedoGroup}>
            <button
              type="button"
              className={styles.iconToolBtn}
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw size={14} />
            </button>
            <button
              type="button"
              className={styles.iconToolBtn}
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo (Ctrl+Y)"
            >
              <RotateCw size={14} />
            </button>
          </div>

          {/* Device Toggle Switch (Desktop vs Mobile) */}
          <div className={styles.deviceSegmented}>
            <button
              type="button"
              className={styles.deviceBtn}
              data-active={deviceView === "desktop"}
              onClick={() => setDeviceView("desktop")}
              title="Desktop View (720px)"
            >
              <Monitor size={15} />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              className={styles.deviceBtn}
              data-active={deviceView === "mobile"}
              onClick={() => setDeviceView("mobile")}
              title="Mobile View (375px)"
            >
              <Smartphone size={15} />
              <span>Mobile</span>
            </button>
          </div>

          {/* Mode Switch (Edit / Preview / Code) */}
          <div className={styles.modeSegmented}>
            <button
              type="button"
              className={styles.modeBtn}
              data-active={canvasMode === "edit"}
              onClick={() => setCanvasMode("edit")}
              title="Visual Editor Mode"
            >
              <Edit3 size={14} />
              <span>Edit</span>
            </button>
            <button
              type="button"
              className={styles.modeBtn}
              data-active={canvasMode === "preview"}
              onClick={() => setCanvasMode("preview")}
              title="Live Data Preview"
            >
              <Eye size={14} />
              <span>Preview</span>
            </button>
            <button
              type="button"
              className={styles.modeBtn}
              data-active={canvasMode === "code"}
              onClick={() => setCanvasMode("code")}
              title="HTML Code View"
            >
              <Code size={14} />
              <span>Code</span>
            </button>
          </div>

          <button
            type="button"
            className={styles.activeStatusBtn}
            data-active={isActive}
            onClick={() => setIsActive(!isActive)}
            title={isActive ? "Template is Active" : "Template is Inactive"}
          >
            <Power size={14} />
            <span>{isActive ? "Active" : "Inactive"}</span>
          </button>
        </div>
      </div>

      {/* Dedicated Subject Line Input Box (Positioned Above Editor) */}
      <div className={styles.subjectBoxContainer}>
        <label className={styles.subjectBoxLabel}>Subject</label>
        {canvasMode === "edit" ? (
          <input
            type="text"
            className={styles.subjectBoxInput}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="You're Invited to {{event_title}} | See you there!"
            required
          />
        ) : (
          <div className={styles.subjectBoxPreview}>{previewSubject}</div>
        )}
      </div>

      {/* Main Two-Column Editor Body */}
      <div className={styles.editorBodyLayout}>
        {/* Left Inspector Sidebar with Radix Accordion & Project Dropdown */}
        <div className={styles.leftInspectorSidebar}>
          <div className={styles.sidebarHeaderTabRow}>
            <button
              type="button"
              className={styles.tabIconBtn}
              onClick={() => setIsCtaModalOpen(true)}
            >
              <Plus size={14} />
              <span>Add CTA</span>
            </button>
            <button
              type="button"
              className={styles.tabIconBtn}
              data-active={true}
            >
              <SlidersHorizontal size={14} />
              <span>Styles</span>
            </button>
          </div>

          <p className={styles.inspectorInstructionText}>
            Select text or an element in the editor, then use the options below
            to style it.
          </p>

          <Accordion
            type="multiple"
            defaultValue={["textFormatting", "bgBorders"]}
            className="w-full"
          >
            {/* 1. Text Formatting Accordion Item */}
            <AccordionItem value="textFormatting">
              <AccordionTrigger>Text Formatting</AccordionTrigger>
              <AccordionContent>
                {/* Font Family */}
                <div className={styles.inputFieldGroup}>
                  <label className={styles.inputLabel}>Font Family</label>
                  <Dropdown
                    options={FONT_FAMILIES}
                    value={currentFontFamily}
                    onChange={(val) => {
                      if (val === "__default__") {
                        editor.chain().focus().unsetFontFamily().run();
                      } else {
                        editor.chain().focus().setFontFamily(val).run();
                      }
                    }}
                    placeholder="Font Family"
                    btnWidth="100%"
                    width="100%"
                  />
                </div>

                {/* Font Weight */}
                <div className={styles.inputFieldGroup}>
                  <label className={styles.inputLabel}>Font Weight</label>
                  <Dropdown
                    options={FONT_WEIGHTS}
                    value={currentFontWeight}
                    onChange={(val) =>
                      editor
                        .chain()
                        .focus()
                        .setMark("textStyle", { fontWeight: val })
                        .run()
                    }
                    placeholder="Font Weight"
                    btnWidth="100%"
                    width="100%"
                  />
                </div>

                {/* Text Color */}
                <div className={styles.inputFieldGroup}>
                  <label className={styles.inputLabel}>Text Color</label>
                  <div className={styles.swatchGrid}>
                    {TEXT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        className={styles.colorSwatchBtn}
                        style={{ backgroundColor: c.value }}
                        onClick={() =>
                          editor.chain().focus().setColor(c.value).run()
                        }
                        title={`Color: ${c.label}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Highlight Color */}
                <div className={styles.inputFieldGroup}>
                  <label className={styles.inputLabel}>Highlight Color</label>
                  <div className={styles.swatchGrid}>
                    <button
                      type="button"
                      className={styles.clearSwatchBtn}
                      onClick={() =>
                        editor.chain().focus().unsetHighlight().run()
                      }
                    >
                      Clear
                    </button>
                    {HIGHLIGHT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        className={styles.colorSwatchBtn}
                        style={{ backgroundColor: c.value }}
                        onClick={() =>
                          editor
                            .chain()
                            .focus()
                            .setHighlight({ color: c.value })
                            .run()
                        }
                        title={`Highlight: ${c.label}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Alignments */}
                <div className={styles.inputFieldGroup}>
                  <label className={styles.inputLabel}>Text Alignment</label>
                  <div className={styles.buttonToggleGroup}>
                    <button
                      type="button"
                      className={styles.toggleBtn}
                      data-active={editor.isActive({ textAlign: "left" })}
                      onClick={() =>
                        editor.chain().focus().setTextAlign("left").run()
                      }
                    >
                      <AlignLeft size={15} />
                    </button>
                    <button
                      type="button"
                      className={styles.toggleBtn}
                      data-active={editor.isActive({ textAlign: "center" })}
                      onClick={() =>
                        editor.chain().focus().setTextAlign("center").run()
                      }
                    >
                      <AlignCenter size={15} />
                    </button>
                    <button
                      type="button"
                      className={styles.toggleBtn}
                      data-active={editor.isActive({ textAlign: "right" })}
                      onClick={() =>
                        editor.chain().focus().setTextAlign("right").run()
                      }
                    >
                      <AlignRight size={15} />
                    </button>
                    <button
                      type="button"
                      className={styles.toggleBtn}
                      data-active={editor.isActive({ textAlign: "justify" })}
                      onClick={() =>
                        editor.chain().focus().setTextAlign("justify").run()
                      }
                    >
                      <AlignJustify size={15} />
                    </button>
                  </div>
                </div>

                {/* Bold, Italic, Underline, Strike */}
                <div className={styles.inputFieldGroup}>
                  <label className={styles.inputLabel}>Formatting</label>
                  <div className={styles.buttonToggleGroup}>
                    <button
                      type="button"
                      className={styles.toggleBtn}
                      data-active={editor.isActive("bold")}
                      onClick={() => editor.chain().focus().toggleBold().run()}
                    >
                      <Bold size={15} />
                    </button>
                    <button
                      type="button"
                      className={styles.toggleBtn}
                      data-active={editor.isActive("italic")}
                      onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                      }
                    >
                      <Italic size={15} />
                    </button>
                    <button
                      type="button"
                      className={styles.toggleBtn}
                      data-active={editor.isActive("underline")}
                      onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                      }
                    >
                      <UnderlineIcon size={15} />
                    </button>
                    <button
                      type="button"
                      className={styles.toggleBtn}
                      data-active={editor.isActive("strike")}
                      onClick={() =>
                        editor.chain().focus().toggleStrike().run()
                      }
                    >
                      <Strikethrough size={15} />
                    </button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 2. Background & Borders Accordion Item */}
            <AccordionItem value="bgBorders">
              <AccordionTrigger>Background & Borders</AccordionTrigger>
              <AccordionContent>
                {/* Block Background */}
                <div className={styles.inputFieldGroup}>
                  <label className={styles.inputLabel}>Block Background</label>
                  <div className={styles.swatchGrid}>
                    <button
                      type="button"
                      className={styles.clearSwatchBtn}
                      onClick={() =>
                        editor
                          .chain()
                          .focus()
                          .updateAttributes("paragraph", {
                            backgroundColor: null,
                          })
                          .run()
                      }
                    >
                      None
                    </button>
                    {[
                      "#f9fafb",
                      "#f3f4f6",
                      "#eff6ff",
                      "#fef2f2",
                      "#f0fdf4",
                      "#fffbe0",
                      "#111827",
                    ].map((bg) => (
                      <button
                        key={bg}
                        type="button"
                        className={styles.colorSwatchBtn}
                        style={{ backgroundColor: bg }}
                        onClick={() =>
                          editor
                            .chain()
                            .focus()
                            .updateAttributes("paragraph", {
                              backgroundColor: bg,
                            })
                            .run()
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Border Style & Width */}
                <div className={styles.rowTwoGrid}>
                  <div className={styles.inputFieldGroup}>
                    <label className={styles.inputLabel}>Border Style</label>
                    <Dropdown
                      options={BORDER_STYLES}
                      value={currentBorderStyle}
                      onChange={(val) =>
                        editor
                          .chain()
                          .focus()
                          .updateAttributes("paragraph", { borderStyle: val })
                          .run()
                      }
                      placeholder="Style"
                      btnWidth="100%"
                      width="100%"
                    />
                  </div>

                  <div className={styles.inputFieldGroup}>
                    <label className={styles.inputLabel}>Width</label>
                    <Dropdown
                      options={BORDER_WIDTHS}
                      value={currentBorderWidth}
                      onChange={(val) =>
                        editor
                          .chain()
                          .focus()
                          .updateAttributes("paragraph", { borderWidth: val })
                          .run()
                      }
                      placeholder="Width"
                      btnWidth="100%"
                      width="100%"
                    />
                  </div>
                </div>

                {/* Border Color */}
                <div className={styles.inputFieldGroup}>
                  <label className={styles.inputLabel}>Border Color</label>
                  <div className={styles.swatchGrid}>
                    {[
                      "#e5e7eb",
                      "#d1d5db",
                      "#9ca3af",
                      "#2563eb",
                      "#dc2626",
                      "#16a34a",
                      "#111827",
                    ].map((bc) => (
                      <button
                        key={bc}
                        type="button"
                        className={styles.colorSwatchBtn}
                        style={{ backgroundColor: bc }}
                        onClick={() =>
                          editor
                            .chain()
                            .focus()
                            .updateAttributes("paragraph", { borderColor: bc })
                            .run()
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* Corner Radius */}
                <div className={styles.inputFieldGroup}>
                  <label className={styles.inputLabel}>Corner Radius</label>
                  <Dropdown
                    options={CORNER_RADII}
                    value={currentBorderRadius}
                    onChange={(val) =>
                      editor
                        .chain()
                        .focus()
                        .updateAttributes("paragraph", { borderRadius: val })
                        .run()
                    }
                    placeholder="Radius"
                    btnWidth="100%"
                    width="100%"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 3. Spacing Accordion Item */}
            <AccordionItem value="spacing">
              <AccordionTrigger>Spacing</AccordionTrigger>
              <AccordionContent>
                <div className={styles.inputFieldGroup}>
                  <label className={styles.inputLabel}>Internal Padding</label>
                  <Dropdown
                    options={PADDING_SIZES}
                    value={currentPadding}
                    onChange={(val) =>
                      editor
                        .chain()
                        .focus()
                        .updateAttributes("paragraph", { padding: val })
                        .run()
                    }
                    placeholder="Padding"
                    btnWidth="100%"
                    width="100%"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* 4. Links & Actions Accordion Item */}
            <AccordionItem value="linksActions">
              <AccordionTrigger>Links & Actions</AccordionTrigger>
              <AccordionContent>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => {
                    setLinkUrl(editor.getAttributes("link").href || "");
                    setIsLinkModalOpen(true);
                  }}
                >
                  <LinkIcon size={15} />
                  <span>Insert Hyperlink</span>
                </button>

                <button
                  type="button"
                  className={styles.btnPrimary}
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => setIsCtaModalOpen(true)}
                >
                  <MousePointerClick size={15} />
                  <span>Add CTA Button</span>
                </button>
              </AccordionContent>
            </AccordionItem>

            {/* 5. Element Styling & Data Accordion Item */}
            <AccordionItem value="elementStyling">
              <AccordionTrigger>Element Styling & Data</AccordionTrigger>
              <AccordionContent>
                <div className={styles.inputFieldGroup}>
                  <label className={styles.inputLabel}>Element Type</label>
                  <Dropdown
                    options={ELEMENT_TYPES}
                    value={currentElementType}
                    onChange={(val) => {
                      if (val === "p")
                        editor.chain().focus().setParagraph().run();
                      else if (val === "h1")
                        editor
                          .chain()
                          .focus()
                          .toggleHeading({ level: 1 })
                          .run();
                      else if (val === "h2")
                        editor
                          .chain()
                          .focus()
                          .toggleHeading({ level: 2 })
                          .run();
                      else if (val === "h3")
                        editor
                          .chain()
                          .focus()
                          .toggleHeading({ level: 3 })
                          .run();
                      else if (val === "quote")
                        editor.chain().focus().toggleBlockquote().run();
                      else if (val === "bullet")
                        editor.chain().focus().toggleBulletList().run();
                      else if (val === "ordered")
                        editor.chain().focus().toggleOrderedList().run();
                    }}
                    placeholder="Element Type"
                    btnWidth="100%"
                    width="100%"
                  />
                </div>

                <div className={styles.inputFieldGroup}>
                  <label className={styles.inputLabel}>
                    Insert Dynamic Tags
                  </label>
                  <div className={styles.varsFlexWrap}>
                    {allVars.map((v) => (
                      <button
                        key={v.key}
                        type="button"
                        className={styles.sidebarVarPill}
                        onClick={() => handleInsertVariable(v.key)}
                        title={`Insert ${v.key}`}
                      >
                        {v.key}
                      </button>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Right Viewport Canvas */}
        <div className={styles.canvasOuterViewport}>
          {canvasMode === "code" ? (
            <div className={styles.codeViewViewport}>
              <div className={styles.codeHeaderBar}>
                <span className={styles.codeHeaderTitle}>
                  HTML Email Document Output
                </span>
                <button
                  type="button"
                  className={styles.copyCodeBtn}
                  onClick={() => {
                    navigator.clipboard.writeText(compiledRawHtml);
                    toast.success("HTML code copied to clipboard!");
                  }}
                >
                  Copy HTML
                </button>
              </div>
              <textarea
                className={styles.htmlCodeTextarea}
                value={compiledRawHtml}
                readOnly
              />
            </div>
          ) : (
            <div className={styles.paperDocumentCard} data-device={deviceView}>
              <div className={styles.paperBodyArea}>
                {canvasMode === "edit" ? (
                  <EditorContent
                    editor={editor}
                    className={styles.tiptapEditor}
                  />
                ) : (
                  <div
                    className={styles.previewRenderedBody}
                    dangerouslySetInnerHTML={{ __html: previewBodyHtml }}
                  />
                )}
              </div>

              {/* Permanent Email Footer */}
              <div className={styles.emailPermanentFooter}>
                <p className={styles.footerQueryText}>
                  If you have any questions or queries regarding this event,
                  feel free to reply directly to this email or reach out to us
                  at{" "}
                  <a
                    href="mailto:support@tiket.com"
                    className={styles.footerLink}
                  >
                    support@tiket.com
                  </a>
                  .
                </p>
                <p className={styles.footerBranding}>
                  Sent via <strong>Tiket Event Platform</strong>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions Footer */}
      <div className={styles.actionFooter}>
        <div className={styles.leftActions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onReset}
            title="Reset template to system default email layout"
          >
            <RotateCcw size={14} />
            <span>Reset Default</span>
          </button>

          {template.type === "custom" && onDelete && (
            <button
              type="button"
              className={styles.btnDanger}
              onClick={onDelete}
              title="Delete Custom Template"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          )}
        </div>

        <div className={styles.rightActions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onOpenSendTest}
          >
            <Send size={14} />
            <span>Send Test</span>
          </button>

          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onOpenSendBatch}
          >
            <Users size={14} />
            <span>Send Blast</span>
          </button>

          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={isSaving}
          >
            <Save size={16} />
            <span>{isSaving ? "Saving..." : "Save Template"}</span>
          </button>
        </div>
      </div>

      {/* CTA Button Generator Modal */}
      <Modal
        isOpen={isCtaModalOpen}
        onClose={() => setIsCtaModalOpen(false)}
        title="Insert Call-to-Action Button"
        width={460}
      >
        <div className={styles.modalContentBody}>
          <p className={styles.modalSub}>
            Generate an inbox-optimized CTA button linking to pass or
            registration details.
          </p>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Button Text</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="e.g. View Your Digital Pass"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Target URL / Variable</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="e.g. {{event.passUrl}} or https://..."
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
            />
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => setIsCtaModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleInsertCtaButton}
              disabled={!ctaLabel.trim() || !ctaUrl.trim()}
            >
              Insert Button
            </button>
          </div>
        </div>
      </Modal>

      {/* Link Modal */}
      <Modal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        title="Insert Hyperlink"
        width={420}
      >
        <div className={styles.modalContentBody}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>URL Address</label>
            <input
              type="url"
              className={styles.formInput}
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              autoFocus
            />
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => setIsLinkModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleApplyLink}
            >
              Apply Link
            </button>
          </div>
        </div>
      </Modal>
    </form>
  );
}
