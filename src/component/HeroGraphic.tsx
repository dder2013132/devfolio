import { useEffect, useRef } from "react";
import * as THREE from "three";
import styles from "../css/HeroGraphic.module.css";

function HeroGraphic() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width === 0 || height === 0) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    const geometry = new THREE.IcosahedronGeometry(2, 1);

    const material = new THREE.MeshBasicMaterial({
      color: 0x171717,
      wireframe: true,
    });

    const mesh = new THREE.Mesh(geometry, material);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    scene.add(mesh);

    camera.position.z = 5;

    let animationId: number;
    
    let mouseX = 0;
    let mouseY = 0;

    const onPointerMove = (event: PointerEvent) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = (event.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener("pointermove", onPointerMove);

    const animate = () => {
      mesh.rotation.x += 0.003;
      mesh.rotation.y += 0.005;

      mesh.position.x = mouseX * 0.5;
      mesh.position.y = -mouseY * 0.5;

      renderer.render(scene, camera);

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;

      if (width === 0 || height === 0) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height, false);
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      renderer.dispose();
      renderer.domElement.remove();
      geometry.dispose();
      material.dispose();
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <div ref={containerRef} className={styles.container} />;
}

export default HeroGraphic;
