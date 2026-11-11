import ProjectCard from "./ProjectCard";
import styles from "../css/Projects.module.css";
import type { Project } from "../types/project";

interface ProjectsProps {
  projects: Project[];
}

function Projects({ projects }: ProjectsProps) {
  return (
    <div className={styles.ProjectBackground}>
      <section className={styles.Card}>
        {projects.length === 0 ? (
          <p>등록된 프로젝트가 없습니다.</p>
        ) : (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </section>
    </div>
  );
}

export default Projects;
