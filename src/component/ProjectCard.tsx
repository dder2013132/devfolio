import styles from "../css/ProjectCard.module.css"

type ProjectCardProps = {
  title: string;
};

function ProjectCard({ title }: ProjectCardProps) {
  return (
    <div className={styles.projectCard}>
      <h3>{title}</h3>
    </div>
  );
}

export default ProjectCard;
