import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import AgencyLayout from "./layouts/AgencyLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import IntakesPage from "./pages/IntakesPage";
import AgenciesPage from "./pages/AgenciesPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import ApplicationReviewPage from "./pages/ApplicationReviewPage";
import ApplicationPreviewPage from "./pages/ApplicationPreviewPage";
import AgencyDashboardPage from "./pages/AgencyDashboardPage";
import AgencyApplicationsPage from "./pages/AgencyApplicationsPage";
import NewApplicationPage from "./pages/NewApplicationPage";
import NewLanguageApplicationPage from "./pages/NewLanguageApplicationPage";
import NewGraduateApplicationPage from "./pages/NewGraduateApplicationPage";
import AgencyMaterialsPage from "./pages/AgencyMaterialsPage";
import AgencyHistoryPage from "./pages/AgencyHistoryPage";
import AdminHistoryPage from "./pages/AdminHistoryPage";
import StudentApplicationPage from "./pages/StudentApplicationPage";
import StudentLanguageApplicationPage from "./pages/StudentLanguageApplicationPage";
import StudentGraduateApplicationPage from "./pages/StudentGraduateApplicationPage";
import AgencyRegisterPage from "./pages/AgencyRegisterPage";
import AgencyAccountsPage from "./pages/AgencyAccountsPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/agency-register" element={<AgencyRegisterPage />} />
      <Route
        path="/student/application/:token"
        element={<StudentApplicationPage />}
      />
      <Route
        path="/student/language-application/:token"
        element={<StudentLanguageApplicationPage />}
      />
      <Route
        path="/student/graduate-application/:token"
        element={<StudentGraduateApplicationPage />}
      />

      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="intakes" element={<IntakesPage />} />
        <Route path="agencies" element={<AgenciesPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="history" element={<AdminHistoryPage />} />
        <Route
          path="applications/:id/review"
          element={<ApplicationReviewPage />}
        />
        <Route
          path="applications/:id/preview"
          element={<ApplicationPreviewPage />}
        />
      </Route>

      <Route path="/agency" element={<AgencyLayout />}>
        <Route index element={<Navigate to="/agency/dashboard" replace />} />
        <Route path="dashboard" element={<AgencyDashboardPage />} />
        <Route path="applications" element={<AgencyApplicationsPage />} />
        <Route path="history" element={<AgencyHistoryPage />} />
        <Route path="new-application" element={<NewApplicationPage />} />
        <Route
          path="new-language-application"
          element={<NewLanguageApplicationPage />}
        />
        <Route
          path="new-graduate-application"
          element={<NewGraduateApplicationPage />}
        />
        <Route path="materials" element={<AgencyMaterialsPage />} />
        <Route path="accounts" element={<AgencyAccountsPage />} />
      </Route>
    </Routes>
  );
}

export default App;