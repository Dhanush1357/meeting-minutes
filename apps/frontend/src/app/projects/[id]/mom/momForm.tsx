import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  PlusCircle,
  Loader2,
  Plus,
  Import,
  X,
  Check,
  Edit2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/stores/useAuthStore";
import { fetchAllMoms } from "./utils";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoMStatus } from "../types";
import { UserRole } from "@/app/users/types";
import { formatDate } from "@/lib/utils";
import { hasProjectRole } from "../utils";
import { MultiSelectUsers } from "@/components/MultiSelectUser";

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// TaskInput component
const TaskInput: React.FC<TaskInputProps> = React.memo(
  ({
    label,
    points,
    setPoints,
    userRole,
    hasRole,
    status = "CREATED",
    isCreator = false,
  }) => {
    // State to track if we're in "edit all" mode
    const [isEditingAll, setIsEditingAll] = useState(false);

    // Memoize the checks
    const canEdit = useMemo(() => {
      if (status === MoMStatus.APPROVED || status === MoMStatus.CLOSED)
        return false;
      return isCreator || userRole === UserRole.SUPER_ADMIN || hasRole;
    }, [status, isCreator]);

    const canToggleComplete = useMemo(() => {
      return status !== MoMStatus.CLOSED;
    }, [status]);

    const addPoint = useCallback(() => {
      if (!canEdit) return;
      setPoints([...points, { id: generateId(), text: "", completed: false }]);
    }, [canEdit, points, setPoints]);

    const editPoint = useCallback(
      (id: string, newText: string) => {
        if (!canEdit) return;
        setPoints(
          points.map((point) =>
            point.id === id ? { ...point, text: newText } : point
          )
        );
      },
      [canEdit, points, setPoints]
    );

    const toggleComplete = useCallback(
      (id: string) => {
        if (!canToggleComplete) return;
        setPoints(
          points.map((point) =>
            point.id === id ? { ...point, completed: !point.completed } : point
          )
        );
      },
      [canToggleComplete, points, setPoints]
    );

    const removePoint = useCallback(
      (id: string) => {
        if (!canEdit) return;
        setPoints(points.filter((point) => point.id !== id));
      },
      [canEdit, points, setPoints]
    );

    // Toggle between edit all mode and normal mode
    const toggleEditAll = useCallback(() => {
      setIsEditingAll(!isEditingAll);
    }, [isEditingAll]);

    // Save all edits and exit edit all mode
    const saveAllEdits = useCallback(() => {
      setIsEditingAll(false);
    }, []);

    return (
      <Card className="shadow-sm border-0 bg-gray-50/50">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
            <div className="flex gap-2">
              {canEdit && (
                <>
                  {isEditingAll ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={saveAllEdits}
                      className="hover:bg-gray-100"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      <span>Done</span>
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={toggleEditAll}
                        className="hover:bg-gray-100"
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addPoint}
                        className="hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {points.map((point, index) => (
            <div
              key={point.id}
              className={`group relative bg-white rounded-lg border border-transparent transition-all hover:border-gray-200 ${
                point.completed ? "bg-gray-50" : ""
              }`}
            >
              <div className="flex items-center gap-2 p-2">
                {canToggleComplete && !isEditingAll && (
                  <button
                    type="button"
                    onClick={() => toggleComplete(point.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded border transition-colors ${
                      point.completed
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {point.completed && <Check className="h-3 w-3" />}
                  </button>
                )}
                <div className="flex-grow">
                  {isEditingAll ? (
                    <Input
                      value={point.text}
                      onChange={(e) => editPoint(point.id, e.target.value)}
                      className="border-0 focus:ring-0 bg-transparent"
                      autoFocus={index === 0}
                    />
                  ) : (
                    <span
                      className={
                        point.completed ? "text-gray-500 line-through" : ""
                      }
                    >
                      {point.text}
                    </span>
                  )}
                </div>
                {canEdit && !isEditingAll && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePoint(point.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0 h-6 w-6"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {points.length === 0 && canEdit && (
            <div
              className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
              onClick={addPoint}
            >
              Click to add your first point
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

// Import Section component
const ImportSection: React.FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  existingMoMs: ExistingMoM[];
  onImport: (momId: string) => void;
  isLoading: boolean;
}> = ({ isOpen, setIsOpen, existingMoMs, onImport, isLoading }) => {
  const [selectedMoM, setSelectedMoM] = useState<string>("");

  const handleImport = () => {
    if (!selectedMoM) return;
    onImport(selectedMoM);
    setSelectedMoM("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Import from Existing MoM
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-base font-medium">
              Select MoM to Import
            </Label>
            <Select value={selectedMoM} onValueChange={setSelectedMoM}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select a MoM" />
              </SelectTrigger>
              <SelectContent>
                {existingMoMs.map((mom: any) => (
                  <SelectItem key={mom.id} value={String(mom.id)}>
                    {mom.title} - {formatDate(mom.created_at)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-gray-500">
            This will import all sections (Discussion Points, Open Issues,
            Updates, and Notes) from the selected MoM.
          </p>
          <DialogFooter>
            <Button
              onClick={handleImport}
              disabled={!selectedMoM || isLoading}
              className="bg-[#127285] hover:bg-[#388e9e] text-white"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Import
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main MoMForm component
const MoMForm: React.FC<MoMFormProps> = ({
  isOpen,
  setIsOpen,
  project,
  loading = false,
  onSubmit,
  initialData,
  editMode = false,
}) => {
  // Form state
  const [title, setTitle] = useState<string>("");
  const [completionDate, setCompletionDate] = useState<string>("");
  const [place, setPlace] = useState<string>("");

  // Task state with IDs
  const [discussion, setDiscussion] = useState<Point[]>([]);
  const [openIssues, setOpenIssues] = useState<Point[]>([]);
  const [updates, setUpdates] = useState<Point[]>([]);
  const [notes, setNotes] = useState<Point[]>([]);

  // Import dialog state
  const [importDialogOpen, setImportDialogOpen] = useState<boolean>(false);
  const [existingMoMs, setExistingMoMs] = useState<ExistingMoM[]>([]);
  const [isLoadingMoMs, setIsLoadingMoMs] = useState<boolean>(false);

  // Track reference MoM IDs as an array
  const [referenceMomIds, setReferenceMomIds] = useState<string[]>([]);

  // Track imported points by source MoM ID
  const [importedPointsMap, setImportedPointsMap] = useState<{
    [momId: string]: {
      discussion: string[];
      openIssues: string[];
      updates: string[];
      notes: string[];
    };
  }>({});

  const { currentUser } = useAuthStore();
  const hasRole = hasProjectRole(project?.user_roles, Number(currentUser?.id), [
    UserRole.CREATOR,
    UserRole.APPROVER,
    UserRole.REVIEWER,
  ]);

  const [selectedUserEmails, setSelectedUserEmails] = React.useState([]);

  const projectUsers = React.useMemo(() => {
    if (!project?.user_roles) return [];
    
    return project.user_roles.map((userRole:any) => ({
      id: userRole.user.email, // Use email as the ID for selection
      first_name: userRole.user.first_name,
      last_name: userRole.user.last_name,
      email: userRole.user.email,
      role: userRole.role
    }));
  }, [project?.user_roles]);

  // Handle user selection (now emails)
  const handleUserSelection = (selectedEmails: any) => {
    setSelectedUserEmails(selectedEmails);
  };

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setCompletionDate(initialData.completion_date || "");
      setPlace(initialData.place || "");

      // Ensure points have IDs
      const addIds = (points: any[]) =>
        points.map((p) => ({ ...p, id: p.id || generateId() }));

      setDiscussion(addIds(initialData.discussion || []));
      setOpenIssues(addIds(initialData.open_issues || []));
      setUpdates(addIds(initialData.updates || []));
      setNotes(addIds(initialData.notes || []));

      // Initialize reference MoM IDs if they exist
      if (initialData.reference_mom_ids) {
        if (Array.isArray(initialData.reference_mom_ids)) {
          setReferenceMomIds(initialData.reference_mom_ids.map(String));
        } else if (typeof initialData.reference_mom_ids === "object") {
          try {
            const parsedIds = Object.values(initialData.reference_mom_ids);
            setReferenceMomIds(parsedIds.map(String));
          } catch (e) {
            console.error("Error parsing reference_mom_ids:", e);
          }
        } else if (initialData.reference_mom_ids) {
          setReferenceMomIds([String(initialData.reference_mom_ids)]);
        }
      }
    }
  }, [initialData]);

  // Load existing MoMs for import
  useEffect(() => {
    if (isOpen && !editMode && project?.id) {
      const loadMoMs = async () => {
        setIsLoadingMoMs(true);
        try {
          const momsData = await fetchAllMoms(project?.id);
          setExistingMoMs(momsData);
        } catch (error) {
          console.error("Failed to load MoMs:", error);
          toast(
            "Failed to load MoMs. Please try again later. Check your internet connection. 1001"
          );
        } finally {
          setIsLoadingMoMs(false);
        }
      };
      loadMoMs();
    }
  }, [isOpen, project?.id]);

  // Form submission handler
  const handleSubmit = async () => {
    // Validate form data
    if (!title.trim()) {
      toast("Please enter a title for the MoM");
      return;
    }

    // Submit data
    await onSubmit({
      title,
      completion_date: completionDate
        ? new Date(completionDate).toISOString()
        : "",
      place,
      discussion,
      open_issues: openIssues,
      updates,
      notes,
      reference_mom_ids:
        referenceMomIds.length > 0 ? referenceMomIds : undefined,
      user_emails: selectedUserEmails?.length > 0 ? selectedUserEmails : undefined,
    });
  };

  // Function to remove all points imported from a specific MoM
  const removeImportedPoints = useCallback(
    (momId: string) => {
      const importedPoints = importedPointsMap[momId];

      if (!importedPoints) return;

      // Remove discussion points from this MoM
      setDiscussion((prev) =>
        prev.filter((point) => !importedPoints.discussion.includes(point.id))
      );

      // Remove open issues from this MoM
      setOpenIssues((prev) =>
        prev.filter((point) => !importedPoints.openIssues.includes(point.id))
      );

      // Remove updates from this MoM
      setUpdates((prev) =>
        prev.filter((point) => !importedPoints.updates.includes(point.id))
      );

      // Remove notes from this MoM
      setNotes((prev) =>
        prev.filter((point) => !importedPoints.notes.includes(point.id))
      );

      // Update the imported points map to remove this MoM's tracking
      setImportedPointsMap((prev) => {
        const newMap = { ...prev };
        delete newMap[momId];
        return newMap;
      });
    },
    [importedPointsMap]
  );

  // Handle removing MoM from reference list and all its data
  const handleRemoveMoM = useCallback(
    (momId: string) => {
      // Remove the MoM ID from references
      setReferenceMomIds((prev) => prev.filter((id) => id !== momId));

      // Remove all points that were imported from this MoM
      removeImportedPoints(momId);
    },
    [removeImportedPoints]
  );

  // Import handler - adds to the referenceMomIds array
  const handleImport = useCallback(
    (momId: string) => {
      const momData = existingMoMs.find((mom) => String(mom.id) === momId);
      if (!momData) return;

      // Add the MoM ID to the reference IDs if it's not already there
      if (!referenceMomIds.includes(momId)) {
        setReferenceMomIds((prev) => [...prev, momId]);
      }

      // Track IDs of imported points for this MoM
      const trackingData = {
        discussion: [],
        openIssues: [],
        updates: [],
        notes: [],
      };

      // Add IDs to imported points and keep track of them
      const addIdsAndTrack = (points: any[], trackArray: string[]) => {
        return points.map((p) => {
          const newId = generateId();
          trackArray.push(newId);
          return { ...p, id: newId };
        });
      };

      // Import all sections with tracking
      const newDiscussionPoints = addIdsAndTrack(
        momData.discussion || [],
        trackingData.discussion
      );
      const newOpenIssues = addIdsAndTrack(
        momData.open_issues || [],
        trackingData.openIssues
      );
      const newUpdates = addIdsAndTrack(
        momData.updates || [],
        trackingData.updates
      );
      const newNotes = addIdsAndTrack(momData.notes || [], trackingData.notes);

      // Update the tracking map
      setImportedPointsMap((prev) => ({
        ...prev,
        [momId]: trackingData,
      }));

      // Update the state with the new points
      setDiscussion((prev) => [...prev, ...newDiscussionPoints]);
      setOpenIssues((prev) => [...prev, ...newOpenIssues]);
      setUpdates((prev) => [...prev, ...newUpdates]);
      setNotes((prev) => [...prev, ...newNotes]);

      toast("MoM imported successfully.");
    },
    [existingMoMs, referenceMomIds]
  );

  // Create a UI component to display imported MoMs
  const ImportedMoMsList = () => {
    if (referenceMomIds.length === 0) return null;

    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-500">Imported From:</h4>
        <div className="flex flex-wrap gap-2 mt-1">
          {referenceMomIds.map((id) => {
            const mom = existingMoMs.find((mom) => String(mom.id) === id);
            return (
              <div
                key={id}
                className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
              >
                <span className="truncate max-w-[200px]">
                  {mom ? mom.title : `MoM #${id}`}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMoM(id)}
                  className="ml-1 p-0 h-5 w-5"
                >
                  <X className="h-3 w-3 text-gray-500" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!editMode && (
        <DialogTrigger asChild>
          <Button size="lg">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create MoM
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[800px] h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {editMode ? "Edit MoM" : "Create New MoM"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-6 py-4"
        >
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-base font-medium">
                    MoM Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter MoM title"
                    required
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="completion_date"
                      className="text-base font-medium"
                    >
                      Completion Date
                    </Label>
                    <Input
                      id="completion_date"
                      type="datetime-local"
                      value={completionDate}
                      onChange={(e) => setCompletionDate(e.target.value)}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="place" className="text-base font-medium">
                      Place
                    </Label>
                    <Input
                      id="place"
                      value={place}
                      onChange={(e) => setPlace(e.target.value)}
                      placeholder="Enter meeting place"
                      required
                      className="mt-1"
                    />
                  </div>
                  {currentUser?.role ===UserRole.SUPER_ADMIN && 
                  <div>
                    <Label
                      htmlFor="participants"
                      className="text-base font-medium"
                    >
                      Send MoM To
                    </Label>
                    <div className="mt-1">
                      <MultiSelectUsers
                        users={projectUsers}
                        selectedUsers={selectedUserEmails}
                        onSelect={handleUserSelection}
                        placeholder="Select participants..."
                      />
                    </div>
                  </div>
}
                </div>
                <ImportedMoMsList />
              </div>
            </CardContent>
          </Card>

          {!editMode && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setImportDialogOpen(true)}
                disabled={isLoadingMoMs || existingMoMs.length === 0}
                className="bg-white hover:bg-gray-50"
              >
                {isLoadingMoMs ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Import className="mr-2 h-4 w-4" />
                )}
                Import from Existing MoM
              </Button>
            </div>
          )}
          <div className="space-y-6">
            <TaskInput
              label="Discussion Points"
              points={discussion}
              setPoints={setDiscussion}
              status={initialData?.status}
              userRole={currentUser?.role}
              hasRole={hasRole}
              isCreator={initialData?.creator === currentUser?.id}
            />
            <TaskInput
              label="Open Issues"
              points={openIssues}
              setPoints={setOpenIssues}
              status={initialData?.status}
              userRole={currentUser?.role}
              hasRole={hasRole}
              isCreator={initialData?.creator === currentUser?.id}
            />
            <TaskInput
              label="Updates"
              points={updates}
              setPoints={setUpdates}
              status={initialData?.status}
              userRole={currentUser?.role}
              hasRole={hasRole}
              isCreator={initialData?.creator === currentUser?.id}
            />
            <TaskInput
              label="Notes"
              points={notes}
              setPoints={setNotes}
              status={initialData?.status}
              userRole={currentUser?.role}
              hasRole={hasRole}
              isCreator={initialData?.creator === currentUser?.id}
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#127285] hover:bg-[#388e9e] text-white"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editMode ? "Update MoM" : "Create MoM"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <ImportSection
        isOpen={importDialogOpen}
        setIsOpen={setImportDialogOpen}
        existingMoMs={existingMoMs}
        onImport={handleImport}
        isLoading={isLoadingMoMs}
      />
    </Dialog>
  );
};

export default MoMForm;
