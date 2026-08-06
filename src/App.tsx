import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RootRedirect } from '@/components/RootRedirect'
import { AuthProvider } from '@/context/AuthContext'
import { CustomMarkerColorsProvider } from '@/context/CustomMarkerColorsContext'
import { ProjectsProvider } from '@/context/ProjectsContext'
import { PublishProjectProvider } from '@/context/PublishProjectContext'
import { ShareProjectProvider } from '@/context/ShareProjectContext'
import { LibraryPage } from '@/pages/LibraryPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { AccountPage } from '@/pages/AccountPage'
import { ActivityPage } from '@/pages/ActivityPage'
import { PublishedProjectPage } from '@/pages/PublishedProjectPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { HelpPage } from '@/pages/HelpPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { TeamPage } from '@/pages/TeamPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CustomMarkerColorsProvider>
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
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <AccountPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/team"
                  element={
                    <ProtectedRoute>
                      <TeamPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/activity"
                  element={
                    <ProtectedRoute>
                      <ActivityPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/help"
                  element={
                    <ProtectedRoute>
                      <HelpPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<RootRedirect />} />
              </Routes>
            </div>
            </ShareProjectProvider>
          </PublishProjectProvider>
        </ProjectsProvider>
        </CustomMarkerColorsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
