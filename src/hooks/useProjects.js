import { useProjects as useProjectContext } from '../contexts/ProjectContext.jsx'

export function useProjects() {
  return useProjectContext()
}
