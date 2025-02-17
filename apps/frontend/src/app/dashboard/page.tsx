import { Card } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="grid grid-cols-4 gap-4 p-5">
      <Card title="Total Projects" />
      <Card title="Open MoMs" />
      <Card title="Approved MoMs" />
      <Card title="Closed MoMs" />
    </div>
  );
}
