import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Loader2, Search, Edit2, Trash2, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import StatePanel from "../../components/common/StatePanel";
import {
  GetUsersDocument,
  UpdateUserDocument,
  DeleteUserDocument,
} from "../../gql/graphql";

// Form validation schema
const editUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface TargetUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Users() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<TargetUser | null>(null);

  const { data, loading, error, refetch } = useQuery(GetUsersDocument);

  const [updateUser, { loading: updating }] = useMutation(UpdateUserDocument, {
    onCompleted: () => {
      setEditingUser(null);
      void refetch();
    },
  });

  const [deleteUser] = useMutation(DeleteUserDocument, {
    onCompleted: () => {
      void refetch();
    },
  });

  // React hook form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
  });

  // Prefill form when opening edit modal
  const handleStartEdit = (user: TargetUser) => {
    setEditingUser(user);
    reset({
      name: user.name,
      email: user.email,
    });
  };

  const handleSave = async (formData: EditUserFormData) => {
    if (!editingUser) return;
    await updateUser({
      variables: {
        id: editingUser.id,
        input: formData,
      },
    });
  };

  const handleDelete = async (id: string) => {
    if (Number(id) === Number(currentUser?.id)) {
      alert("You cannot delete your own admin account.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      await deleteUser({
        variables: { id },
      });
    }
  };

  // Client-side search filtering
  const filteredUsers = useMemo(() => {
    const list = data?.users ?? [];
    if (!search.trim()) return list;

    const term = search.toLowerCase();
    return list.filter(
      (u) =>
        u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
  }, [data, search]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <StatePanel
          icon={<Loader2 className="h-6 w-6 animate-spin text-primary" />}
          title="Loading accounts"
          description="Fetching registered system users..."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <StatePanel
          icon={<AlertTriangle className="h-6 w-6 text-danger" />}
          title="Failed to load accounts"
          description={error.message}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Security Control</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            User Management
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Control member details, view authorization states, and manage system access.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 flex max-w-md items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:border-primary/80 focus-within:ring-1 focus-within:ring-primary/80">
        <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Member</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Email Address</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Role</th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-400">
                  No users matching filter criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-semibold text-slate-900">{member.name}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                    {member.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
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
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(member)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                        aria-label="Edit User"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(member.id)}
                        disabled={Number(member.id) === Number(currentUser?.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-danger transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                        aria-label="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-4 py-10">
          <div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Edit Member Details</h2>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleSave)} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Name</label>
                <input
                  type="text"
                  {...register("name")}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-danger">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Email Address</label>
                <input
                  type="email"
                  {...register("email")}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" variant="primary" disabled={updating} className="w-full">
                  {updating ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingUser(null)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
