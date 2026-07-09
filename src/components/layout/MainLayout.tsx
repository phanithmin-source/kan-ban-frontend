import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-150">
      <Navbar />
      <Outlet />
    </div>
  );
}
