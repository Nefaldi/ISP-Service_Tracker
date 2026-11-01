"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assignTechnician } from "@/actions/ticket.actions";
import { Button } from "@/components/ui/button";
import { UserCheck } from "lucide-react";

interface TechnicianOption {
  id: string;
  name: string;
  email: string;
}

interface AssignTechnicianDialogProps {
  ticketId: string;
  currentTechnicianId?: string | null;
  technicians: TechnicianOption[];
}

export function AssignTechnicianDialog({
  ticketId,
  currentTechnicianId,
  technicians,
}: AssignTechnicianDialogProps) {
  const router = useRouter();
  const [selectedTechId, setSelectedTechId] = useState(
    currentTechnicianId || (technicians[0]?.id ?? "")
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAssign = async () => {
    if (!selectedTechId) return;
    setIsLoading(true);

    const res = await assignTechnician({
      ticketId,
      technicianId: selectedTechId,
    });

    setIsLoading(false);
    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
      router.refresh();
    } else {
      alert(res.error || "Gagal menugaskan teknisi.");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      <select
        value={selectedTechId}
        onChange={(e) => setSelectedTechId(e.target.value)}
        className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      >
        <option value="" disabled>
          Pilih Teknisi...
        </option>
        {technicians.map((tech) => (
          <option key={tech.id} value={tech.id}>
            {tech.name} ({tech.email})
          </option>
        ))}
      </select>

      <Button
        size="sm"
        variant="primary"
        onClick={handleAssign}
        isLoading={isLoading}
        disabled={!selectedTechId}
        className="text-xs"
      >
        <UserCheck className="h-3.5 w-3.5" />
        <span>{isSuccess ? "Ditugaskan!" : "Tugaskan"}</span>
      </Button>
    </div>
  );
}
