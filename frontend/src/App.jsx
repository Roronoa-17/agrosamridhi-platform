import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/layout/AppShell";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Weather from "./pages/Weather";
import Mandi from "./pages/Mandi";
import Schemes from "./pages/Schemes";
import Profile from "./pages/Profile";
import AiHub from "./pages/ai/AiHub";
import CropSuggestion from "./pages/ai/CropSuggestion";
import PestDiagnosis from "./pages/ai/PestDiagnosis";
import SoilOcr from "./pages/ai/SoilOcr";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              background: "#1c3d1a",
              color: "#fff",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#6bb058", secondary: "#fff" } },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/mandi" element={<Mandi />} />
            <Route path="/schemes" element={<Schemes />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/ai" element={<AiHub />} />
            <Route path="/ai/crop-suggestion" element={<CropSuggestion />} />
            <Route path="/ai/pest-diagnosis" element={<PestDiagnosis />} />
            <Route path="/ai/soil-ocr" element={<SoilOcr />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
