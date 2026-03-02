import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./auth/pages/login";
import Signup from "./auth/pages/signup";
import CustomButton from "./component/Buttons/CustomButton";

const AppRoutes = ({
  currentUser,
  isAuthReady,
  handleLoginSuccess,
  handleSaveUser,
  DashboardLayout,
  dashboardProps,
}) => {
  const navigate = useNavigate();

  if (!isAuthReady) {
    return (
      <div className="center">
        <div className="card">
          <h2>Checking session...</h2>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          currentUser?.isLoggedIn ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <div className="center">
              <div className="card">
                <h1>Welcome</h1>
                <div className="button-group">
                  <CustomButton
                    name="Login"
                    type="primary"
                    onClick={() => navigate("/login")}
                    style={{ marginRight: "10px" }}
                  />
                  <CustomButton
                    name="Sign Up"
                    type="default"
                    onClick={() => navigate("/signup")}
                  />
                </div>
              </div>
            </div>
          )
        }
      />

      <Route
        path="/login"
        element={
          currentUser?.isLoggedIn ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login
              onLoginSuccess={handleLoginSuccess}
            />
          )
        }
      />

      <Route
        path="/signup"
        element={
          currentUser?.isLoggedIn ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Signup
              onSaveUser={handleSaveUser}
              onLoginSuccess={handleLoginSuccess}
            />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          currentUser?.isLoggedIn ? (
            <DashboardLayout {...dashboardProps} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
