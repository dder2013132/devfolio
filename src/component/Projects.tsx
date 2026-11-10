import ProjectCard from "./ProjectCard";
import styles from "../css/Projects.module.css"

type ProjectsProps = {
  title: {
    first: string;
    second: string;
  };
};

function Projects({ title }: ProjectsProps) {
  return (
    <section className={styles.Card}>
      <ProjectCard title={title.first} />
      <ProjectCard title={title.second} />
    </section>
  );
}

export default Projects;
