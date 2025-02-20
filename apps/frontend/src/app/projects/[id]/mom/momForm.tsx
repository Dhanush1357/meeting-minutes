import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Loader2,
  Plus,
  Import,
  X,
  Check,
  ChevronDown,
  GripVertical,
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

// Point/Task related types
type Point = {
  text: string;
  completed: boolean;
};

// Props for TaskInput component
type TaskInputProps = {
  label: string;
  points: Point[];
  setPoints: (points: Point[]) => void;
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
};

type MoMFormProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  existingMoMs?: ExistingMoM[];
  loading?: boolean;
  onSubmit: any;
  initialData?: MoMFormData;
  editMode?: boolean;
};

const TaskInput: React.FC<TaskInputProps> = ({ label, points, setPoints }) => {
  const addPoint = () => {
    setPoints([...points, { text: "", completed: false }]);
  };

  const updatePoint = (index: number, value: string) => {
    const newPoints = [...points];
    newPoints[index].text = value;
    setPoints(newPoints);
  };

  const toggleComplete = (index: number) => {
    const newPoints = [...points];
    newPoints[index].completed = !newPoints[index].completed;
    setPoints(newPoints);
  };

  const removePoint = (index: number) => {
    const newPoints = points.filter((_, i) => i !== index);
    setPoints(newPoints);
  };

  return (
    <Card className="shadow-sm border-0 bg-gray-50/50">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addPoint}
            className="hover:bg-gray-100"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {points.map((point, index) => (
          <div
            key={index}
            className={`group relative bg-white rounded-lg border border-transparent transition-all hover:border-gray-200 ${
              point.completed ? "bg-gray-50" : ""
            }`}
          >
            <div className="flex items-center gap-2 p-2">
              <button
                type="button"
                onClick={() => toggleComplete(index)}
                className={`flex-shrink-0 w-5 h-5 rounded border transition-colors ${
                  point.completed
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {point.completed && <Check className="h-3 w-3" />}
              </button>
              <div className="flex-grow">
                <Input
                  value={point.text}
                  onChange={(e) => updatePoint(index, e.target.value)}
                  placeholder={`Add ${label.toLowerCase()} point`}
                  className={`border-0 focus:ring-0 bg-transparent ${
                    point.completed ? "text-gray-500 line-through" : ""
                  }`}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removePoint(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0 h-6 w-6"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </Button>
            </div>
          </div>
        ))}
        {points.length === 0 && (
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
};

const MoMForm: React.FC<MoMFormProps> = ({
  isOpen,
  setIsOpen,
  existingMoMs = [],
  loading,
  onSubmit,
  initialData,
  editMode = false,
}) => {
  const [title, setTitle] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [place, setPlace] = useState("");
  const [discussion, setDiscussion] = useState<Point[]>([]);
  const [openIssues, setOpenIssues] = useState<Point[]>([]);
  const [updates, setUpdates] = useState<Point[]>([]);
  const [notes, setNotes] = useState<Point[]>([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedMoM, setSelectedMoM] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setCompletionDate(initialData.completion_date || "");
      setPlace(initialData.place || "");
      setDiscussion(initialData.discussion || []);
      setOpenIssues(initialData.open_issues || []);
      setUpdates(initialData.updates || []);
      setNotes(initialData.notes || []);
    }
  }, [initialData]);

  const handleImport = () => {
    if (!selectedMoM || !selectedSection) return;

    const momData = existingMoMs.find((mom) => mom.id === selectedMoM);
    if (!momData) return;

    switch (selectedSection) {
      case "discussion":
        setDiscussion([...discussion, ...momData.discussion]);
        break;
      case "open_issues":
        setOpenIssues([...openIssues, ...momData.open_issues]);
        break;
      case "updates":
        setUpdates([...updates, ...momData.updates]);
        break;
      case "notes":
        setNotes([...notes, ...momData.notes]);
        break;
    }
    setImportDialogOpen(false);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit({
      title,
      completion_date: completionDate,
      place,
      discussion,
      open_issues: openIssues,
      updates,
      notes,
    });
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
                className="bg-white hover:bg-gray-50"
              >
                <Import className="mr-2 h-4 w-4" />
                Import from Existing MoM
              </Button>
            </div>
          )}
          <div className="space-y-6">
            <TaskInput
              label="Discussion Points"
              points={discussion}
              setPoints={setDiscussion}
            />
            <TaskInput
              label="Open Issues"
              points={openIssues}
              setPoints={setOpenIssues}
            />
            <TaskInput
              label="Updates"
              points={updates}
              setPoints={setUpdates}
            />
            <TaskInput label="Notes" points={notes} setPoints={setNotes} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editMode ? "Update MoM" : "Create MoM"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Import from Existing MoM
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-base font-medium">Select MoM</Label>
              <div className="relative mt-1">
                <select
                  className="w-full h-10 pl-3 pr-10 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-md"
                  onChange={(e) => setSelectedMoM(e.target.value)}
                >
                  <option value="">Select a MoM</option>
                  {existingMoMs.map((mom) => (
                    <option key={mom.id} value={mom.id}>
                      {mom.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div>
              <Label className="text-base font-medium">Select Section</Label>
              <div className="relative mt-1">
                <select
                  className="w-full h-10 pl-3 pr-10 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-md"
                  onChange={(e) => setSelectedSection(e.target.value)}
                >
                  <option value="">Select a section</option>
                  <option value="discussion">Discussion Points</option>
                  <option value="open_issues">Open Issues</option>
                  <option value="updates">Updates</option>
                  <option value="notes">Notes</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleImport}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Import Selected Items
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default MoMForm;
