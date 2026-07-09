import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";

import { MainLayout, AuthLayout, AppLoading } from "@/components";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Profile from "../pages/auth/Profile";
import Dashboard from "../pages/dashboard/Dashboard";
import Board from "../pages/boards/Board";
import MyTasks from "../pages/tasks/MyTasks";
import Users from "../pages/users/Users";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../hooks";

function RoleHomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppLoading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

function BoardWrapper() {
  const { boardId } = useParams<{ boardId: string }>();
  return <Board boardId={boardId ?? ""} />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<RoleHomeRedirect />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/board/:boardId" element={<BoardWrapper />} />
            <Route path="/board" element={<BoardWrapper />} />
            <Route path="/tasks" element={<MyTasks />} />
            <Route path="/me" element={<Profile />} />
            <Route path="/users" element={<ProtectedRoute roles={["ADMIN"]} />}>
              <Route index element={<Users />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
