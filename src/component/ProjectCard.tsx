import styles from "../css/ProjectCard.module.css";
import type { Project } from "../types/project";

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className={styles.projectCard}>
      <div className={styles.projectImage}>
        {/* 프로젝트 이미지 */}
      </div>

      <div className={styles.projectInfo}>
        <h3 className={styles.projectTitle}>
          {project.title}
        </h3>

        <p className={styles.projectCategory}>
          {project.category}
        </p>

        <p className={styles.projectDescription}>
          {project.description}
        </p>

        <div className={styles.projectTechstack}>
          {project.techStack.map((tech) => (
            <span key={tech} className={styles.techTag}>
              {tech}
            </span>
          ))}
        </div>

        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.gitlink}
          >
            View Source ↗
          </a>
        )}
      </div>
    </div>
  );
}

export default ProjectCard;