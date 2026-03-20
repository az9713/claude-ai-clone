import { createContext, useContext, useState, useCallback } from 'react'
import { api } from '../utils/api.js'

const ProjectContext = createContext()

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [activeProject, setActiveProject] = useState(null)

  const loadProjects = useCallback(async () => {
    try {
      const data = await api.get('/projects')
      setProjects(data.data || [])
    } catch (err) {
      console.error('Failed to load projects:', err)
    }
  }, [])

  const createProject = useCallback(async (projectData) => {
    try {
      const data = await api.post('/projects', projectData)
      const project = data.data
      setProjects(prev => [project, ...prev])
      return project
    } catch (err) {
      console.error('Failed to create project:', err)
      return null
    }
  }, [])

  const updateProject = useCallback(async (id, updates) => {
    try {
      const data = await api.put(`/projects/${id}`, updates)
      const updated = data.data
      setProjects(prev => prev.map(p => p.id === id ? updated : p))
      if (activeProject?.id === id) {
        setActiveProject(updated)
      }
      return updated
    } catch (err) {
      console.error('Failed to update project:', err)
      return null
    }
  }, [activeProject])

  const deleteProject = useCallback(async (id) => {
    try {
      await api.delete(`/projects/${id}`)
      setProjects(prev => prev.filter(p => p.id !== id))
      if (activeProject?.id === id) {
        setActiveProject(null)
      }
    } catch (err) {
      console.error('Failed to delete project:', err)
    }
  }, [activeProject])

  const selectProject = useCallback((project) => {
    setActiveProject(project)
  }, [])

  return (
    <ProjectContext.Provider value={{
      projects, activeProject, loadProjects, createProject, updateProject, deleteProject, selectProject,
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

export const useProjects = () => useContext(ProjectContext)
