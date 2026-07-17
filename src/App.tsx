import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RootRedirect } from '@/components/RootRedirect'
import { AuthProvider } from '@/context/AuthContext'
import { ProjectsProvider } from '@/context/ProjectsContext'
import { PublishProjectProvider } from '@/context/PublishProjectContext'
import { ShareProjectProvider } from '@/context/ShareProjectContext'
import { LibraryPage } from '@/pages/LibraryPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { PublishedProjectPage } from '@/pages/PublishedProjectPage'
import { ProjectsPage } from '@/pages/ProjectsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProjectsProvider>
          <PublishProjectProvider>
            <ShareProjectProvider>
            <div className="h-full min-h-0">
              <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/published/:projectId" element={<PublishedProjectPage />} />
                <Route
                  path="/library"
                  element={
                    <ProtectedRoute>
                      <LibraryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects"
                  element={
                    <ProtectedRoute>
                      <ProjectsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<RootRedirect />} />
              </Routes>
            </div>
            </ShareProjectProvider>
          </PublishProjectProvider>
        </ProjectsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
