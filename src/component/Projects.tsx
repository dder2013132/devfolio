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

//ScrollTrigger.normalizeScroll(true);

function Projects({ projects }: ProjectsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useGSAP(() => {
    if (!wheelRef.current || !sectionRef.current) return;

    let lastScrollY = window.scrollY;
    let scrollingDown = false;

    const onScroll = () => {
      scrollingDown = window.scrollY > lastScrollY;
      lastScrollY = window.scrollY;
    };

    const snapToSection = () => {
      if (!sectionRef.current || !scrollingDown) return;

      const distance = sectionRef.current.getBoundingClientRect().top;
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

    const cards = wheelRef.current.querySelectorAll(`.${styles.cardWrapper}`);
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
        markers: false,

        snap: {
          snapTo: (progress) => {
            const step = 8 / 9 / 3;
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

    tl.to(wheelRef.current, {
      rotationX: 270,
      duration: 8,
      ease: "none",

      onUpdate: () => {
        const rotation = Number(
          gsap.getProperty(wheelRef.current, "rotationX"),
        );

        const step = 360 / projects.length;

        const index =
          (projects.length - Math.round(rotation / step)) % projects.length;

        setActiveIndex(index);

        cards.forEach((card, index) => {
          const angle = index * (360 / projects.length);
          const totalAngle = angle + rotation;

          const radian = totalAngle * (Math.PI / 180);
          const depth = Math.cos(radian);

          const opacity = gsap.utils.mapRange(-1, 1, 0.15, 1, depth);

          gsap.set(card, {
            force3D: false,
            rotationX: -totalAngle,
            opacity: opacity,
            pointerEvents: depth >= 0.95 ? "auto" : "none",
          });
        });
      },
    });

    tl.to(
      {},
      {
        duration: 1,
      },
    );

    return () => {
      window.removeEventListener("scroll", onScroll);
      ScrollTrigger.removeEventListener("scrollEnd", snapToSection);
    };
  });

  const displayIndex = ((projects.length - activeIndex) % projects.length) + 1;

  return (
    <div ref={sectionRef} id="Projects" className={styles.scrollArea}>
      <section className={styles.ProjectBackground}>
        <div className={styles.projectHeading}>
          <span>02 / SELECTED WORKS</span>
          <span className={styles.archiveStatus}>● PROJECT ARCHIVE</span>
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
