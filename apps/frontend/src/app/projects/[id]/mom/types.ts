type Point = {
  id: string;
  text: string;
  completed: boolean;
};

type TaskInputProps = {
  label: string;
  points: Point[];
  setPoints: (points: Point[]) => void;
  userRole: any;
  hasRole: any;
  status?: string;
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
  reference_mom_ids: any;
};

type MoMFormProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  project?: any;
  loading?: boolean;
  onSubmit: any;
  initialData?: MoMFormData;
  editMode?: boolean;
};
