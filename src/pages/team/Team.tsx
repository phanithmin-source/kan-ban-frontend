import { useQuery } from "@apollo/client/react";
import { AlertTriangle, Loader2 } from "lucide-react";
import StatePanel from "../../components/common/StatePanel";
import { GetUsersDocument } from "../../gql/graphql";

function initials(name?: string) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function Team() {
  const { data, loading, error } = useQuery(GetUsersDocument);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <StatePanel
          icon={<Loader2 className="h-6 w-6 animate-spin text-primary" />}
          title="Loading team directory"
          description="Fetching workspace members..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <StatePanel
          icon={<AlertTriangle className="h-6 w-6 text-danger" />}
          title="Failed to load team directory"
          description={error.message}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Team Directory
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          Meet and collaborate with all members in your Kanban workspace.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data?.users.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {initials(member.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{member.name}</p>
              <p className="truncate text-xs text-slate-500">{member.email}</p>
            </div>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold border ${
                member.role === "ADMIN"
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : member.role === "MANAGER"
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}
            >
              {member.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
