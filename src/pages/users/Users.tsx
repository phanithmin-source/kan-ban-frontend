import { AlertTriangle, Loader2, Search, Edit2, Trash2 } from "lucide-react";
import { useUsersPage } from "../../hooks";
import {
  Button,
  StatePanel,
  PageHeader,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Input,
  Select,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  ConfirmationDialog,
} from "@/components";

export default function Users() {
  const {
    currentUser,
    search,
    setSearch,
    editingUser,
    setEditingUser,
    userToDelete,
    setUserToDelete,
    getRoleBadgeClass,
    loading,
    error,
    updating,
    register,
    handleSubmit,
    errors,
    handleStartEdit,
    handleDeleteClick,
    handleConfirmDelete,
    filteredUsers,
  } = useUsersPage();

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
      <PageHeader
        label="Workspace Settings"
        title="User Management"
        description="View and manage user accounts, permissions, and roles within the workspace."
      />

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute top-3.5 left-4 h-5 w-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="pl-12"
          />
        </div>
      </div>

      {/* Users Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                No users matching filter criteria.
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="text-sm font-semibold text-foreground">{member.name}</div>
                </TableCell>
                <TableCell>
                  {member.email}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold border ${getRoleBadgeClass(member.role)}`}
                  >
                    {member.role}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(member)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-primary transition"
                      aria-label="Edit Details"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(member.id)}
                      disabled={String(member.id) === String(currentUser?.id)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-danger transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
                      aria-label="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Edit Modal */}
      <Dialog open={!!editingUser} onOpenChange={(open) => { if (!open) setEditingUser(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Member Details</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="user-edit-name">Name</label>
              <Input
                id="user-edit-name"
                type="text"
                {...register("name")}
                className="mt-2"
                autoComplete="name"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-danger">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="user-edit-email">Email Address</label>
              <Input
                id="user-edit-email"
                type="email"
                {...register("email")}
                className="mt-2"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500" htmlFor="user-edit-role">Role</label>
              <Select
                id="user-edit-role"
                {...register("role")}
                className="mt-2"
              >
                <option value="USER">USER</option>
                <option value="MANAGER">MANAGER</option>
                <option value="ADMIN">ADMIN</option>
              </Select>
              {errors.role && (
                <p className="mt-1 text-xs text-danger">{errors.role.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button type="submit" variant="primary" disabled={updating} className="w-full">
                {updating ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => setEditingUser(null)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete user"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete User"
        variant="danger"
      />
    </div>
  );
}
