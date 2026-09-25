import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { MovieDetailPage } from "./pages/MovieDetailPage";
import { MovieFormPage } from "./pages/MovieFormPage";
import { MoviesPage } from "./pages/MoviesPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="movies" element={<MoviesPage />} />
        <Route path="movies/new" element={<MovieFormPage />} />
        <Route path="movies/:movieId" element={<MovieDetailPage />} />
        <Route path="movies/:movieId/edit" element={<MovieFormPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
