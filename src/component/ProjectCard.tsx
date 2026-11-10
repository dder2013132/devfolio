type ProjectCardProps = {
  title: string;
};

function ProjectCard({ title }: ProjectCardProps) {
  return (
    <div className="projectCard">
      <h3>{title}</h3>
    </div>
  );
}

export default ProjectCard;
