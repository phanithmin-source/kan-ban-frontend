import { useNavigate } from "react-router-dom";
import {
  Plus,
  LayoutDashboard,
  ListTodo,
  User,
} from "lucide-react";
import { useAuth } from "../../hooks";

interface QuickAction {
  label: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  roles?: ("USER" | "MANAGER" | "ADMIN")[];
}

export default function QuickActions() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      label: "Create Board",
      description: "Start a new project board",
      icon: Plus,
      onClick: () => navigate("/board"),
      roles: ["ADMIN", "MANAGER"],
    },
    {
      label: "Create Task",
      description: "Add a new task quickly",
      icon: LayoutDashboard,
      onClick: () => navigate("/board"),
      roles: ["ADMIN", "MANAGER"],
    },
    {
      label: "My Tasks",
      description: "View your assigned tasks",
      icon: ListTodo,
      onClick: () => navigate("/tasks"),
      roles: ["ADMIN", "MANAGER", "USER"],
    },
    {
      label: "Edit Profile",
      description: "Manage your profile settings",
      icon: User,
      onClick: () => navigate("/me"),
      roles: ["ADMIN", "MANAGER", "USER"],
    },
  ];

  const visibleActions = actions.filter(
    (action) => !action.roles || (user?.role && action.roles.includes(user.role))
  );

  if (visibleActions.length === 0) return null;

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">
        Quick Actions
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        {visibleActions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.label}
              className="flex items-center gap-4 rounded-2xl border border-border p-4 text-left transition hover:border-primary hover:bg-muted hover:shadow-sm cursor-pointer w-full bg-card"
              onClick={action.onClick}
            >
              <div className="rounded-xl bg-primary/10 p-3 shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">
                  {action.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {action.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}