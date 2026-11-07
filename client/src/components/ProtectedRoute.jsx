import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="owner-auth-loading" role="status">
        Checking owner session…
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <Navigate
        to="/owner/login"
        replace
        state={{
          from: { pathname: location.pathname, search: location.search },
        }}
      />
    );
  }

  return <Outlet />;
}
