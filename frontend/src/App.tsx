import { Navigate, Route, Routes } from "react-router-dom";
import { getRole, getToken } from "./api/client";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import AdminHome from "./pages/AdminHome";
import ApartmentsPage from "./pages/ApartmentsPage";
import ChipsPage from "./pages/ChipsPage";
import RequestsPage from "./pages/RequestsPage";
import PaymentsPage from "./pages/PaymentsPage";
import EchoFloor from "./pages/EchoFloor";
import Inbox from "./pages/Inbox";
import ResidentHome from "./pages/ResidentHome";
import ElevatorsPage from "./pages/ElevatorsPage";

function Guard({ children, role }: { children: React.ReactNode; role?: "admin" | "resident" }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  if (role && getRole() !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function Home() {
  return getRole() === "admin" ? <AdminHome /> : <ResidentHome />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Guard>
            <Layout />
          </Guard>
        }
      >
        <Route index element={<Home />} />
        <Route path="echo" element={<EchoFloor />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="chips" element={<ChipsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route
          path="apartments"
          element={
            <Guard role="admin">
              <ApartmentsPage />
            </Guard>
          }
        />
        <Route path="elevators" element={<ElevatorsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
