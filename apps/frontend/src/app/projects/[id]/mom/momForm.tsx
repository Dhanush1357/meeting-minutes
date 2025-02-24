import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  PlusCircle,
  Loader2,
  Plus,
  Import,
  X,
  Check, Edit2
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Types
type Point = {
  id: string; // Add unique identifier
  text: string;
  completed: boolean;
};

type TaskInputProps = {
  label: string;
  points: Point[];
  setPoints: (points: Point[]) => void;
  status?: string;
  userRole?: string;
  isCreator?: boolean;
};

type ExistingMoM = {
  id: string | number;
  title: string;
  discussion: Point[];
  open_issues: Point[];
  updates: Point[];
  notes: Point[];
};

type MoMFormData = {
  title: string;
  completion_date: string;
  place: string;
  discussion: Point[];
  open_issues: Point[];
  updates: Point[];
  notes: Point[];
  status: string;
  creator: number;
};

type MoMFormProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  loading?: boolean;
  projectId: number;
  onSubmit: any;
  initialData?: MoMFormData;
  editMode?: boolean;
};

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Task Item component (extracted from TaskInput)
const TaskItem: React.FC<{
  point: Point;
  index: number;
  onToggle: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  canEdit: boolean;
  canToggleComplete: boolean;
}> = ({ point, index, onToggle, onEdit, onRemove, canEdit, canToggleComplete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(point.text);

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onEdit(point.id, editText);
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSaveEdit();
  };

  return (
    <div
      className={`group relative bg-white rounded-lg border border-transparent transition-all hover:border-gray-200 ${
        point.completed ? "bg-gray-50" : ""
      }`}
    >
      <div className="flex items-center gap-2 p-2">
        {canToggleComplete && (
          <button
            type="button"
            onClick={() => onToggle(point.id)}
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
          {isEditing ? (
            <div className="flex gap-2">
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="border-0 focus:ring-0 bg-transparent"
                onKeyPress={handleKeyPress}
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSaveEdit}
                className="p-1"
              >
                <Check className="h-4 w-4 text-green-600" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span
                className={
                  point.completed ? "text-gray-500 line-through" : ""
                }
              >
                {point.text}
              </span>
              {canEdit && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                >
                  <Edit2 className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </Button>
              )}
            </div>
          )}
        </div>
        {canEdit && !isEditing && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(point.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0 h-6 w-6"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </Button>
        )}
      </div>
    </div>
  );
};

// TaskInput component (optimized)
const TaskInput: React.FC<TaskInputProps> = React.memo(({
  label,
  points,
  setPoints,
  status = "CREATED",
  userRole = "",
  isCreator = false,
}) => {
  // Memoize these checks
  const canEdit = useMemo(() => {
    if (status === "APPROVED" || status === "CLOSED") return false;
    return isCreator || userRole === "REVIEWER" || userRole === "APPROVER";
  }, [status, isCreator, userRole]);

  const canToggleComplete = useMemo(() => {
    return status !== "CLOSED";
  }, [status]);

  // Use callbacks for all handlers to prevent unnecessary rerenders
  const addPoint = useCallback(() => {
    if (!canEdit) return;
    setPoints([...points, { id: generateId(), text: "", completed: false }]);
  }, [canEdit, points, setPoints]);

  const editPoint = useCallback((id: string, newText: string) => {
    if (!canEdit) return;
    setPoints(
      points.map(point => point.id === id ? { ...point, text: newText } : point)
    );
  }, [canEdit, points, setPoints]);

  const toggleComplete = useCallback((id: string) => {
    if (!canToggleComplete) return;
    setPoints(
      points.map(point => point.id === id ? { ...point, completed: !point.completed } : point)
    );
  }, [canToggleComplete, points, setPoints]);

  const removePoint = useCallback((id: string) => {
    if (!canEdit) return;
    setPoints(points.filter(point => point.id !== id));
  }, [canEdit, points, setPoints]);

  return (
    <Card className="shadow-sm border-0 bg-gray-50/50">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
          {canEdit && status !== "APPROVED" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addPoint}
              className="hover:bg-gray-100"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {points.map((point, index) => (
          <TaskItem
            key={point.id}
            point={point}
            index={index}
            onToggle={toggleComplete}
            onEdit={editPoint}
            onRemove={removePoint}
            canEdit={canEdit}
            canToggleComplete={canToggleComplete}
          />
        ))}
        {points.length === 0 && canEdit && status !== "APPROVED" && (
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
});

// Import Section component (extracted from MoMForm)
const ImportSection: React.FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  existingMoMs: ExistingMoM[];
  onImport: (momId: string, section: string) => void;
}> = ({ isOpen, setIsOpen, existingMoMs, onImport }) => {
  const [selectedMoM, setSelectedMoM] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");

  const handleImport = () => {
    if (!selectedMoM || !selectedSection) return;
    onImport(selectedMoM, selectedSection);
    setSelectedMoM("");
    setSelectedSection("");
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
            <Label className="text-base font-medium">Select MoM</Label>
            <Select value={selectedMoM} onValueChange={setSelectedMoM}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select a MoM" />
              </SelectTrigger>
              <SelectContent>
                {existingMoMs.map((mom) => (
                  <SelectItem key={mom.id} value={String(mom.id)}>
                    {mom.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-base font-medium">Select Section</Label>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discussion">Discussion Points</SelectItem>
                <SelectItem value="open_issues">Open Issues</SelectItem>
                <SelectItem value="updates">Updates</SelectItem>
                <SelectItem value="notes">Notes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              onClick={handleImport}
              disabled={!selectedMoM || !selectedSection}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Import Selected Items
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main MoMForm component (optimized)
const MoMForm: React.FC<MoMFormProps> = ({
  isOpen,
  setIsOpen,
  projectId,
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
  
  const { currentUser } = useAuthStore();

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setCompletionDate(initialData.completion_date || "");
      setPlace(initialData.place || "");
      
      // Ensure points have IDs
      const addIds = (points: any[]) => 
        points.map(p => ({ ...p, id: p.id || generateId() }));
      
      setDiscussion(addIds(initialData.discussion || []));
      setOpenIssues(addIds(initialData.open_issues || []));
      setUpdates(addIds(initialData.updates || []));
      setNotes(addIds(initialData.notes || []));
    }
  }, [initialData]);

  // Load existing MoMs for import
  useEffect(() => {
    if (isOpen && !editMode) {
      const loadMoMs = async () => {
        setIsLoadingMoMs(true);
        try {
          const momsData = await fetchAllMoms(projectId);
          setExistingMoMs(momsData);
        } catch (error) {
          console.error("Failed to load MoMs:", error);
          toast("Failed to load MoMs. Please try again later. Check your internet connection. 1001");
        } finally {
          setIsLoadingMoMs(false);
        }
      };
      loadMoMs();
    }
  }, [isOpen, editMode, projectId]);

  // Form submission handler
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!title.trim()) {
      toast("Please enter a title for the MoM. 1002");
      return;
    }
    
    // Submit data - strip IDs from points before submission if your API doesn't expect them
    onSubmit({
      title,
      completion_date: completionDate,
      place,
      discussion,
      open_issues: openIssues,
      updates,
      notes,
    });
  }, [title, completionDate, place, discussion, openIssues, updates, notes, onSubmit]);

  // Import handler
  const handleImport = useCallback((momId: string, section: string) => {
    const momData = existingMoMs?.find((mom) => String(mom.id) === momId);
    if (!momData) return;

    // Add IDs to imported points
    const addIds = (points: any[]) => 
      points.map(p => ({ ...p, id: p.id || generateId() }));

    switch (section) {
      case "discussion":
        setDiscussion(prev => [...prev, ...addIds(momData.discussion || [])]);
        break;
      case "open_issues":
        setOpenIssues(prev => [...prev, ...addIds(momData.open_issues || [])]);
        break;
      case "updates":
        setUpdates(prev => [...prev, ...addIds(momData.updates || [])]);
        break;
      case "notes":
        setNotes(prev => [...prev, ...addIds(momData.notes || [])]);
        break;
      default:
        break;
    }
  }, [existingMoMs]);

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
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
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
                      type="date"
                      value={completionDate}
                      onChange={(e) => setCompletionDate(e.target.value)}
                      required
                      className="mt-1"
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
                </div>
              </div>
            </CardContent>
          </Card>

          {!editMode && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setImportDialogOpen(true)}
                disabled={isLoadingMoMs}
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
              isCreator={initialData?.creator === currentUser?.id}
            />
            <TaskInput
              label="Open Issues"
              points={openIssues}
              setPoints={setOpenIssues}
              status={initialData?.status}
              userRole={currentUser?.role}
              isCreator={initialData?.creator === currentUser?.id}
            />
            <TaskInput
              label="Updates"
              points={updates}
              setPoints={setUpdates}
              status={initialData?.status}
              userRole={currentUser?.role}
              isCreator={initialData?.creator === currentUser?.id}
            />
            <TaskInput
              label="Notes"
              points={notes}
              setPoints={setNotes}
              status={initialData?.status}
              userRole={currentUser?.role}
              isCreator={initialData?.creator === currentUser?.id}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="">
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
      />
    </Dialog>
  );
};

export default MoMForm;