import ProjectCard from "./ProjectCard";

type ProjectsProps = {
  title: {
    first: string;
    second: string;
  };
};

function Projects({ title }: ProjectsProps) {
  return (
    <section className="Card">
      <ProjectCard title={title.first} />
      <ProjectCard title={title.second} />
    </section>
  );
}

export default Projects;
