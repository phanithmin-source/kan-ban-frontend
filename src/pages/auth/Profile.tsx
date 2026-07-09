import { Pencil, X, Check } from "lucide-react";
import { useProfilePage } from "../../hooks";
import { Button, Input } from "@/components";

export default function Profile() {
  const {
    user,
    isEditing,
    setIsEditing,
    serverError,
    userRole,
    register,
    handleSubmit,
    handleCancel,
    errors,
    isSubmitting,
  } = useProfilePage();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-border bg-card/95 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="mb-8 flex flex-col gap-4 rounded-[1.5rem] border border-border bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Profile</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Your account
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Review your account details and keep your profile up to date.
            </p>
          </div>
          <div className="rounded-3xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">
            {userRole}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Personal Info */}
          <section className="rounded-[1.5rem] border border-border bg-muted/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Personal info</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Basic account information used for authentication.
                </p>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  aria-label="Edit profile"
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground shadow-sm transition hover:border-primary/30 hover:text-primary cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-4"
              >
                <div>
                  <label
                    htmlFor="profile-name"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Name
                  </label>
                  <Input
                    id="profile-name"
                    type="text"
                    {...register("name")}
                    autoComplete="name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="profile-email"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Email
                  </label>
                  <Input
                    id="profile-email"
                    type="email"
                    {...register("email")}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>

                {serverError && (
                  <p className="rounded-2xl border border-red-200 bg-red-50/10 px-4 py-3 text-xs text-red-400">
                    {serverError}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="flex-1 justify-center rounded-2xl text-xs"
                  >
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    {isSubmitting ? "Saving…" : "Save changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    className="flex-1 justify-center rounded-2xl text-xs"
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Name</p>
                  <p className="mt-2 text-base font-medium text-foreground">
                    {user?.name ?? "Anonymous"}
                  </p>
                </div>
                <div className="rounded-3xl border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Email</p>
                  <p className="mt-2 text-base font-medium text-foreground">
                    {user?.email ?? "Not available"}
                  </p>
                </div>
                <div className="rounded-3xl border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Role</p>
                  <p className="mt-2 text-base font-medium text-foreground">{userRole}</p>
                </div>
              </div>
            )}
          </section>

          {/* Security */}
          <section className="rounded-[1.5rem] border border-border bg-muted/20 p-6">
            <h2 className="text-lg font-semibold text-foreground">Security</h2>
            <p className="mt-2 text-sm text-muted-foreground">Manage your session and account details.</p>

            <div className="mt-6 grid gap-4">
              <div className="rounded-3xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Session status</p>
                <p className="mt-2 text-base font-medium text-foreground">Active</p>
              </div>
              <div className="rounded-3xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Account ID</p>
                <p className="mt-2 text-base font-medium text-foreground">{user?.id ?? "n/a"}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
