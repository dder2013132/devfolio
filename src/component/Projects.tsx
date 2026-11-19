import ProjectCard from "./ProjectCard";
import styles from "../css/Projects.module.css";
import type { Project } from "../types/project";
import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);
interface ProjectsProps {
  projects: Project[];
}

function Projects({ projects }: ProjectsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useGSAP(() => {
    if (projects.length <= 1) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const wheel = wheelRef.current;
      const section = sectionRef.current;

      if (!wheel || !section) return;

      const angleStep = 360 / projects.length;
      const maxRotation = angleStep * (projects.length - 1);

      let lastScrollY = window.scrollY;
      let scrollingDown = false;

      const onScroll = () => {
        scrollingDown = window.scrollY > lastScrollY;
        lastScrollY = window.scrollY;
      };

      const snapToSection = () => {
        if (!scrollingDown) return;

        const distance = section.getBoundingClientRect().top;
        const threshold = window.innerHeight * 0.03;

        if (distance > 1 && distance <= threshold) {
          window.scrollBy({
            top: distance,
            behavior: "smooth",
          });
        }
      };

      window.addEventListener("scroll", onScroll);
      ScrollTrigger.addEventListener("scrollEnd", snapToSection);

      const cards = wheel.querySelectorAll<HTMLElement>(
        `.${styles.cardWrapper}`,
      );

      const updateCards = () => {
        const rotation = Number(gsap.getProperty(wheel, "rotationX"));

        const index =
          (projects.length - Math.round(rotation / angleStep)) %
          projects.length;

        setActiveIndex(index);

        cards.forEach((card, index) => {
          const angle = index * angleStep;
          const totalAngle = angle + rotation;

          const radian = totalAngle * (Math.PI / 180);
          const depth = Math.cos(radian);

          const opacity = gsap.utils.mapRange(-1, 1, 0.15, 1, depth);
          const isInteractive = depth >= 0.95;

          card.inert = !isInteractive;

          gsap.set(card, {
            force3D: false,
            rotationX: -totalAngle,
            opacity,
            pointerEvents: isInteractive ? "auto" : "none",
          });
        });
      };

      updateCards();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
          markers: false,

          snap: {
            snapTo: (progress) => {
              const step = 8 / 9 / (projects.length - 1);
              const nearest = Math.round(progress / step) * step;

              if (progress >= 8 / 9) return progress;

              return Math.abs(progress - nearest) <= step * 0.1
                ? nearest
                : progress;
            },
            inertia: false,
            duration: 0.3,
            delay: 0.15,
            ease: "power2.out",
          },
        },
      });

      tl.to(wheel, {
        rotationX: maxRotation,
        duration: 8,
        ease: "none",
        onUpdate: updateCards,
      });

      tl.to({}, { duration: 1 });

      return () => {
        window.removeEventListener("scroll", onScroll);
        ScrollTrigger.removeEventListener("scrollEnd", snapToSection);

        cards.forEach((card) => {
          card.inert = false;
        });
      };
    });

    return () => mm.revert();
  });

  const displayIndex = ((projects.length - activeIndex) % projects.length) + 1;

  return (
    <div ref={sectionRef} id="Projects" className={styles.scrollArea}>
      <section className={styles.ProjectBackground}>
        <div className={styles.projectHeading}>
          <span>02 / SELECTED WORKS</span>
          <span className={styles.archiveStatus}>
            <span className={styles.statusLight} aria-hidden="true" />
            PROJECT ARCHIVE
          </span>
        </div>
        {projects.length > 0 && (
          <div className={styles.projectCounter}>
            <span className={styles.currentIndex}>
              {String(displayIndex).padStart(2, "0")}
            </span>
            <span className={styles.totalCount}>
              / {String(projects.length).padStart(2, "0")}
            </span>
          </div>
        )}
        <div className={styles.projectProgress}>
          <span>SCROLL PROGRESS</span>

          <div className={styles.progressTrack}>
            {projects.map((project, index) => (
              <div
                key={project.id}
                className={`${styles.progressSegment} ${
                  index < displayIndex ? styles.progressActive : ""
                }`}
              />
            ))}
          </div>
        </div>
        <div className={styles.wheelViewport}>
          <div ref={wheelRef} className={styles.wheel}>
            {projects.length === 0 ? (
              <p>등록된 프로젝트가 없습니다.</p>
            ) : (
              projects.map((project, index) => {
                const angle = index * (360 / projects.length);
                return (
                  <div
                    key={project.id}
                    className={styles.wheelItem}
                    style={{
                      transform: `rotateX(${angle}deg) translateZ(var(--wheel-radius))`,
                    }}
                  >
                    <div
                      className={styles.cardWrapper}
                      style={{
                        transform: `rotateX(${-angle}deg)`,
                      }}
                    >
                      <ProjectCard project={project} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Projects;
