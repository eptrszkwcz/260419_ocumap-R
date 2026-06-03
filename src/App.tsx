import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ProjectsProvider } from '@/context/ProjectsContext'
import { LibraryPage } from '@/pages/LibraryPage'
import { ProjectsPage } from '@/pages/ProjectsPage'

export default function App() {
  return (
    <BrowserRouter>
      <ProjectsProvider>
        <div className="h-full min-h-0">
          <Routes>
            <Route path="/" element={<Navigate to="/library" replace />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="*" element={<Navigate to="/library" replace />} />
          </Routes>
        </div>
      </ProjectsProvider>
    </BrowserRouter>
  )
}
