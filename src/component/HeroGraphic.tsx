import { useEffect, useRef } from "react";
import * as THREE from "three";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import styles from "../css/HeroGraphic.module.css";

function HeroGraphic() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width === 0 || height === 0) return;

    // 1. Scene & Camera & Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    camera.position.z = 9;

    // 2. Geometry & Material
    const profile: THREE.Vector2[] = [
      new THREE.Vector2(1.4, -0.2),
      new THREE.Vector2(1.6, -0.2),
      new THREE.Vector2(1.65, -0.15),
      new THREE.Vector2(1.65, 0.15),
      new THREE.Vector2(1.6, 0.2),
      new THREE.Vector2(1.4, 0.2),
      new THREE.Vector2(1.35, 0.15),
      new THREE.Vector2(1.35, -0.15),
      new THREE.Vector2(1.4, -0.2),
    ];

    const geometry = new THREE.LatheGeometry(profile, 96);

    const coreGeometry = new THREE.SphereGeometry(0.35, 32, 32);

    const material = new THREE.MeshStandardMaterial({
      color: 0x909090,
      metalness: 1,
      roughness: 0.18,
    });

    const coreMaterial = material.clone();

    coreMaterial.color.set(0xff5733);
    coreMaterial.roughness = 0.15;
    coreMaterial.metalness = 0.8;

    // 3. Mesh & Group
    const mesh = new THREE.Mesh(geometry, material);
    const secondMesh = mesh.clone();
    const thirdMesh = mesh.clone();
    const core = new THREE.Mesh(coreGeometry, coreMaterial);

    secondMesh.scale.setScalar(0.75);
    thirdMesh.scale.setScalar(0.5);

    secondMesh.rotation.y = Math.PI / 2;
    thirdMesh.rotation.x = Math.PI / 2;

    const group = new THREE.Group();

    group.add(mesh, secondMesh, thirdMesh, core);

    const boxSize = 6;
    const glassThickness = 0.06;

    const glassGeometry = new THREE.BoxGeometry(
      boxSize,
      boxSize,
      glassThickness,
    );

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0,
      transmission: 0,
      transparent: true,
      opacity: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      depthWrite: false,
    });

    const glassEdges = new THREE.EdgesGeometry(glassGeometry);

    const glassEdgeMaterial = new THREE.LineBasicMaterial({
      color: 0x9dbbb5,
      transparent: true,
      opacity: 0.35,
    });

    const glassOutline = new THREE.LineSegments(glassEdges, glassEdgeMaterial);

    const glass = new THREE.Group();
    const offset = boxSize / 2 - glassThickness / 2;

    const front = new THREE.Mesh(glassGeometry, glassMaterial);
    const rear = front.clone();
    const left = front.clone();
    left.position.set(-offset, 0, 0);
    left.rotation.y = Math.PI / 2;

    const right = front.clone();
    right.position.set(offset, 0, 0);
    right.rotation.y = Math.PI / 2;

    const top = front.clone();
    top.position.set(0, offset, 0);
    top.rotation.x = Math.PI / 2;

    const bottom = front.clone();
    bottom.position.set(0, -offset, 0);
    bottom.rotation.x = Math.PI / 2;

    front.position.z = offset;
    rear.position.z = -offset;

    glass.add(front, rear, left, right, top, bottom);

    for (const panel of glass.children) {
      panel.add(glassOutline.clone());
    }

    group.scale.setScalar(1.6);
    scene.add(group);
    scene.add(glass);

    glass.rotation.set(0.4, 0.6, 0);
    scene.background = new THREE.Color(0xf3f0e7);

    // 4. Environment Mapping
    const hdrLoader = new HDRLoader();

    let disposed = false;
    let environmentTexture: THREE.Texture | undefined;

    hdrLoader.load("/office.hdr", (texture) => {
      if (disposed) {
        texture.dispose();
        return;
      }

      texture.mapping = THREE.EquirectangularReflectionMapping;

      scene.environment = texture;
      environmentTexture = texture;
    });

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // 6. Renderer Setup
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    container.appendChild(renderer.domElement);

    // 7. Pointer Interaction
    let mouseX = 0;
    let mouseY = 0;

    const onPointerMove = (event: PointerEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = (event.clientY / window.innerHeight) * 2 - 1;
    };

    const targetPosition = new THREE.Vector3();

    window.addEventListener("pointermove", onPointerMove);

    // 8. Animation
    let animationId: number;

    const animate = () => {
      group.rotation.x += 0.003;
      group.rotation.y += 0.005;

      glass.rotation.x = THREE.MathUtils.lerp(
        glass.rotation.x,
        0.4 - mouseY * 0.15,
        0.05,
      );

      glass.rotation.y = THREE.MathUtils.lerp(
        glass.rotation.y,
        0.6 + mouseX * 0.15,
        0.05,
      );

      targetPosition.set(mouseX * 0.5, -mouseY * 0.5, 0);

      group.position.lerp(targetPosition, 0.05);

      glass.position.copy(group.position);

      secondMesh.rotation.z += 0.004;
      thirdMesh.rotation.x -= 0.003;

      renderer.render(scene, camera);

      animationId = requestAnimationFrame(animate);
    };

    animate();

    // 9. Responsive Resize
    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;

      if (width === 0 || height === 0) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height, false);
    });

    resizeObserver.observe(container);

    // 10. Cleanup
    return () => {
      disposed = true;

      cancelAnimationFrame(animationId);

      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);

      scene.environment = null;
      environmentTexture?.dispose();

      geometry.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      material.dispose();

      glassGeometry.dispose();
      glassMaterial.dispose();
      glassEdges.dispose();
      glassEdgeMaterial.dispose();

      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <figure className={styles.figure}>
      <div ref={containerRef} className={styles.container} />

      <figcaption className={styles.caption}>
        <div className={styles.captionHeader}>
          <span>FIG. 01 — ORBITAL SYSTEM</span>
          <span className={styles.status}>● ACTIVE</span>
        </div>

        <p className={styles.description}>
          Complexity in motion. Precision by design.
        </p>

        <span className={styles.technology}>
          PROCEDURAL GEOMETRY / THREE.JS / WEBGL
        </span>
      </figcaption>
    </figure>
  );
}

export default HeroGraphic;

/*
 * Three.js Experiment
 * Procedural Trefoil Knot + ExtrudeGeometry
 *
 * Vector3, CatmullRomCurve3, Vector2, Shape,
 * ExtrudeGeometry, EdgesGeometry 실습
 *

const points: THREE.Vector3[] = [];
const pointCount = 48;

for (let i = 0; i < pointCount; i++) {
  const angle = (i / pointCount) * Math.PI * 2;
  const radius = 1.5 + Math.cos(angle * 3) * 0.4;

  const x = Math.cos(angle * 2) * radius;
  const y = Math.sin(angle * 3) * 0.5;
  const z = Math.sin(angle * 2) * radius;

  points.push(new THREE.Vector3(x, y, z));
}

const curve = new THREE.CatmullRomCurve3(points, true);

const shapePoints: THREE.Vector2[] = [
  new THREE.Vector2(-0.2, -0.15),
  new THREE.Vector2(0.2, -0.15),
  new THREE.Vector2(0.2, 0.15),
  new THREE.Vector2(-0.2, 0.15),
];

const shape = new THREE.Shape(shapePoints);

const geometry = new THREE.ExtrudeGeometry(shape, {
  extrudePath: curve,
  steps: 120,
  bevelEnabled: false,
});

const geometry = new THREE.TorusGeometry(1.5, 0.15, 32, 96);

const edges = new THREE.EdgesGeometry(geometry, 45);

const material = new THREE.LineBasicMaterial({
  color: 0x171717,
});

const mesh = new THREE.LineSegments(edges, material);

// Cleanup
geometry.dispose();
edges.dispose();
material.dispose();

*/
