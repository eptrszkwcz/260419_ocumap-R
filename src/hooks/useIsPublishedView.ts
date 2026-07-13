import { useMatch } from 'react-router-dom'

export function useIsPublishedView() {
  return useMatch('/published/:projectId') != null
}
