import {
  Clock3,
  CheckCircle2,
} from "lucide-react";


interface TaskRowProps {
  title: string;
  board: string;
  status: string;
  priority: string;
}


export default function TaskRow({
  title,
  board,
  status,
  priority,
}: TaskRowProps) {

  const completed = status === "DONE";


  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">

      <div className="flex items-center gap-3">

        {completed ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Clock3 className="h-5 w-5 text-muted-foreground" />
        )}


        <div>
          <p className="font-medium text-foreground">
            {title}
          </p>

          <p className="text-sm text-muted-foreground">
            {board}
          </p>
        </div>

      </div>


      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        {priority}
      </span>

    </div>
  );
}