import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getFormFields,
  createFormField,
  updateFormField,
  deleteFormField,
  deleteFormPage,
} from "@/api/forms";
import { FormField } from "@/types/form";
import { toast } from "sonner";
import { arrayMove } from "@dnd-kit/sortable";
import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { LocalField, StandardField, StandardFieldStatus } from "../types";
import { User, Mail, Phone } from "lucide-react";
import { Event } from "@/store/useEventStore";

function serverToLocal(field: FormField): LocalField {
  return {
    localId: field.id,
    serverId: field.id,
    name: field.name,
    label: field.label,
    fieldType: field.fieldType as any,
    isRequired: field.isRequired,
    options: field.options,
    sortOrder: field.sortOrder,
    page: field.page,
  };
}

export function useFormEditor(event: Event | null) {
  const [customFields, setCustomFields] = useState<LocalField[]>([]);
  const [standardFields, setStandardFields] = useState<StandardField[]>([
    {
      name: "name",
      label: "Name",
      icon: <User size={16} />,
      status: "Required",
    },
    {
      name: "email",
      label: "Email",
      icon: <Mail size={16} />,
      status: "Required",
    },
    { name: "phone", label: "Phone", icon: <Phone size={16} />, status: "Off" },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [activePage, setActivePage] = useState(1);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  /* ── Data Fetching ── */
  const refreshFields = useCallback(async () => {
    if (!event?.id) return;
    try {
      const data = await getFormFields(event.id);

      const custom: LocalField[] = [];
      const stdMap = new Map<string, FormField>();

      data.forEach((f) => {
        if (["name", "email", "phone"].includes(f.name) && f.page === 0) {
          stdMap.set(f.name, f);
        } else {
          custom.push(serverToLocal(f));
        }
      });

      custom.sort((a, b) => a.sortOrder - b.sortOrder);

      setCustomFields((prev) => {
        return custom.map((newField) => {
          const oldField = prev.find((p) => p.serverId === newField.serverId);
          if (oldField?.isEditing) return { ...newField, isEditing: true };
          return newField;
        });
      });

      setStandardFields((prev) =>
        prev.map((std) => {
          const dbField = stdMap.get(std.name);
          if (std.name === "name" || std.name === "email") {
            return {
              ...std,
              serverId: dbField?.id,
              status: "Required",
            };
          }
          if (!dbField) return { ...std, serverId: undefined, status: "Off" };
          return {
            ...std,
            serverId: dbField.id,
            status: dbField.isRequired ? "Required" : "Optional",
          };
        }),
      );
    } catch (error) {
      console.error("Failed to fetch form fields", error);
      toast.error("Failed to load form fields.");
    }
  }, [event?.id]);

  useEffect(() => {
    if (!event?.id) return;
    setIsLoading(true);
    refreshFields().finally(() => setIsLoading(false));
  }, [refreshFields, event?.id]);

  /* ── Derived State ── */
  const pages = useMemo(() => {
    const pageNums = new Set(customFields.map((f) => f.page));
    return Array.from(pageNums).sort((a, b) => a - b);
  }, [customFields]);

  const activePageFields = useMemo(
    () =>
      customFields
        .filter((f) => f.page === activePage)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [customFields, activePage],
  );

  /* ── Standard Fields DB Sync ── */
  const updateStandardField = async (
    name: string,
    status: StandardFieldStatus,
  ) => {
    if (!event?.id) return;
    const std = standardFields.find((f) => f.name === name);
    if (!std) return;

    if (status !== "Required") {
      const otherRequired = standardFields.some(
        (f) =>
          f.name !== name &&
          (f.name === "name" || f.name === "email") &&
          f.status === "Required",
      );
      if (!otherRequired && (name === "name" || name === "email")) {
        toast.error("Either Name or Email must be Required.");
        return;
      }
    }

    try {
      if (status === "Off") {
        if (std.serverId) await deleteFormField(event.id, std.serverId);
      } else {
        const isReq = status === "Required";
        if (!std.serverId) {
          await createFormField(event.id, {
            name: std.name,
            label: std.label,
            fieldType: std.name === "email" ? "email" : "text",
            isRequired: isReq,
            page: 0,
            sortOrder: 0,
          });
        } else {
          await updateFormField(event.id, std.serverId, { isRequired: isReq });
        }
      }
      await refreshFields();
      toast.success(`${std.label} updated.`);
    } catch (error) {
      toast.error("Failed to update field.");
    }
  };

  /* ── Custom Fields Actions ── */
  const handleModalSave = async (
    fieldData: Omit<LocalField, "isEditing" | "localId">,
    modalMode: "add" | "edit",
    editingField: LocalField | null
  ) => {
    if (!event?.id) return;

    if (modalMode === "add") {
      const tempId = crypto.randomUUID();
      const pageFields = customFields.filter((f) => f.page === activePage);
      const maxSort = pageFields.reduce(
        (max, f) => Math.max(max, f.sortOrder),
        -1,
      );

      const newField: LocalField = {
        ...fieldData,
        localId: tempId,
        sortOrder: maxSort + 1,
        page: activePage,
      };

      setCustomFields((prev) => [...prev, newField]);

      try {
        const created = await createFormField(event.id, {
          name: newField.name,
          label: newField.label,
          fieldType: newField.fieldType,
          isRequired: newField.isRequired,
          options: newField.options,
          sortOrder: newField.sortOrder,
          page: newField.page,
        });
        setCustomFields((prev) =>
          prev.map((f) =>
            f.localId === tempId ? { ...f, serverId: created.id } : f,
          ),
        );
      } catch (err) {
        toast.error("Failed to add question.");
        setCustomFields((prev) => prev.filter((f) => f.localId !== tempId));
        throw err;
      }
    } else if (modalMode === "edit" && editingField) {
      const updatedField: LocalField = {
        ...editingField,
        ...fieldData,
      };
      setCustomFields((prev) =>
        prev.map((f) =>
          f.localId === updatedField.localId ? updatedField : f,
        ),
      );

      if (updatedField.serverId) {
        try {
          await updateFormField(event.id, updatedField.serverId, {
            name: updatedField.name,
            label: updatedField.label,
            fieldType: updatedField.fieldType,
            isRequired: updatedField.isRequired,
            options: updatedField.options,
          });
        } catch (err) {
          toast.error("Failed to save changes.");
          setCustomFields((prev) =>
            prev.map((f) =>
              f.localId === editingField.localId ? editingField : f,
            ),
          );
          throw err;
        }
      }
    }
  };

  const deleteCustomField = async (id: string) => {
    if (!event?.id) return;
    const field = customFields.find((f) => f.localId === id);
    if (!field) return;

    setCustomFields((prev) => prev.filter((f) => f.localId !== id));

    if (field.serverId) {
      try {
        await deleteFormField(event.id, field.serverId);
      } catch (err) {
        toast.error("Failed to delete question.");
        setCustomFields((prev) => [...prev, field]);
        throw err;
      }
    }
  };

  const addPage = () => {
    const maxPage = pages.length > 0 ? Math.max(...pages) : 0;
    const newPage = maxPage + 1;
    setActivePage(newPage);
  };

  const executeDeletePage = async (pageToDelete: number) => {
    if (!event?.id) return;

    try {
      await deleteFormPage(event.id, pageToDelete);
      await refreshFields();

      if (activePage === pageToDelete) {
        setActivePage(Math.max(1, pageToDelete - 1));
      } else if (activePage > pageToDelete) {
        setActivePage(activePage - 1);
      }
      toast.success(`Page ${pageToDelete} deleted.`);
    } catch (e) {
      toast.error("Failed to delete page.");
      throw e;
    }
  };

  /* ── Drag & Drop Handlers ── */
  const handleDragStart = (e: DragStartEvent) => {
    setActiveDragId(e.active.id as string);
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const activeIdx = activePageFields.findIndex(
      (f) => f.localId === active.id,
    );
    const overIdx = activePageFields.findIndex((f) => f.localId === over.id);

    if (activeIdx === -1 || overIdx === -1) return;

    const reordered = arrayMove(activePageFields, activeIdx, overIdx);
    const updated = reordered.map((f, i) => ({ ...f, sortOrder: i }));

    setCustomFields((prev) => {
      const otherPages = prev.filter((f) => f.page !== activePage);
      return [...otherPages, ...updated];
    });

    if (!event?.id) return;

    try {
      for (const item of updated) {
        const original = activePageFields.find(
          (f) => f.localId === item.localId,
        );
        if (
          original &&
          original.sortOrder !== item.sortOrder &&
          item.serverId
        ) {
          await updateFormField(event.id, item.serverId, {
            sortOrder: item.sortOrder,
          });
        }
      }
    } catch (err) {
      toast.error("Failed to save reorder. Reverting.");
      await refreshFields();
    }
  };

  return {
    state: {
      isLoading,
      standardFields,
      customFields,
      activePageFields,
      pages,
      activePage,
      activeDragId,
    },
    actions: {
      setActivePage,
      addPage,
      executeDeletePage,
      updateStandardField,
      handleModalSave,
      deleteCustomField,
      handleDragStart,
      handleDragEnd,
    },
  };
}
