import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-150 px-4 py-10">
      <Outlet />
    </div>
  );
}
