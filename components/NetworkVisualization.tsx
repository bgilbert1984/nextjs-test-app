// NetworkVisualization.tsx

"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import * as dat from "dat.gui";
import { Client } from 'pg';

interface DataItem {
  id: number;
  name: string;
  created_at: string; // Adjust types as needed
}

interface Unit {
  mesh: THREE.Mesh;
  startNodeIndex: number;
  endNodeIndex: number;
  progress: number;
  speed: number;
  connection: THREE.Line;
}

const NetworkVisualization: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [launching, setLaunching] = useState(false);
  const [data, setData] = useState<DataItem[] | null>(null); // CrateDB data
  const [crateError, setCrateError] = useState<string | null>(null); //CrateDB error


  useEffect(() => {
    // --- CrateDB Data Fetching ---
    async function fetchData() {
      const client = new Client({ connectionString: 'postgres://user_b:a_secret_password@localhost:5432/doc' });
      try {
        await client.connect();
        const result = await client.query('SELECT * FROM doc.mytable;');
        setData(result.rows);
      } catch (error: any) {
        console.error('Failed to fetch data from CrateDB:', error);
        setCrateError(error.message || 'Failed to fetch data from CrateDB');
      } finally {
        await client.end();
      }
    }
    fetchData();


    if (!containerRef.current) return;

    // --- Three.js Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 3, 2);
    scene.add(directionalLight);

    // --- Dat.GUI ---
    const gui = new dat.GUI();
    const params = {
      unitSpeed: 0.1,
      networkScale: 1,
      laserColor: 0xff0000,
      connectionWidth: 0.05,
      crateDBNodeColor: 0x00ff00, // Default green, configurable
    };

    const networkFolder = gui.addFolder("Network");
    networkFolder.add(params, "networkScale", 0.5, 3).onChange(generateNetwork);
    networkFolder.add(params, "connectionWidth", 0.01, 0.2);

    const unitFolder = gui.addFolder("Units");
    unitFolder.add(params, "unitSpeed", 0.01, 0.5);

    const laserFolder = gui.addFolder("Lasers");
    laserFolder.addColor(params, "laserColor").onChange(updateLaserColor);

    const crateDBFolder = gui.addFolder("CrateDB");
    crateDBFolder.addColor(params, "crateDBNodeColor").onChange(updateCrateDBNodeColor);



    // --- Scene Objects ---
    const nodes: THREE.Mesh[] = [];
    const connections: THREE.Line[] = [];
    const nodePositions: THREE.Vector3[] = [];
    const units: Unit[] = [];

    // Materials
    let nodeMaterial = new THREE.MeshLambertMaterial({ color: params.crateDBNodeColor }); // Initialize with default

    function updateCrateDBNodeColor() {
      nodeMaterial.color.set(params.crateDBNodeColor); // Update the material
    }


    function createNode(x: number, y: number, z: number) {
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        nodeMaterial // Now using the shared material
      );
      node.position.set(x, y, z);
      scene.add(node);
      nodes.push(node);
      nodePositions.push(node.position.clone());
      return node;
    }

    function createConnection(startNodeIndex: number, endNodeIndex: number, type: string) {
      const start = nodePositions[startNodeIndex];
      const end = nodePositions[endNodeIndex];

      const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
      const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x0077ff }));

      line.userData = { type, start: startNodeIndex, end: endNodeIndex };
      connections.push(line);
      scene.add(line);
      return line;
    }

    function createUnit(startNodeIndex: number, endNodeIndex: number, speed: number = params.unitSpeed) {
      const unit = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.1, 0.1),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      );

      const connection = connections.find(conn => conn.userData.start === startNodeIndex && conn.userData.end === endNodeIndex);
      if (!connection) {
        console.warn("No connection found between nodes", startNodeIndex, "and", endNodeIndex);
        return null;
      }
      unit.position.copy(nodePositions[startNodeIndex]);
      scene.add(unit);
      units.push({
        mesh: unit,
        startNodeIndex: startNodeIndex,
        endNodeIndex: endNodeIndex,
        progress: 0,
        speed: speed,
        connection: connection
      });
      return unit;

    }


    function generateNetwork() {
      // Clear previous network
      nodes.forEach((node) => scene.remove(node));
      connections.forEach((conn) => scene.remove(conn));
      units.forEach(unit => scene.remove(unit.mesh));
      nodes.length = 0;
      connections.length = 0;
      nodePositions.length = 0;
      units.length = 0;

      // Use CrateDB data if available, otherwise generate a default grid.
      if (data && data.length > 0) {
          //CrateDB
        data.forEach((item, index) => {
          // Simple positioning based on index, adjust as needed
          const x = (index % 5) * 2 * params.networkScale; // Example layout
          const z = Math.floor(index / 5) * 2 * params.networkScale;
          createNode(x, 0, z);
        });

        // Basic connection logic, adjust as needed.  Connects nodes sequentially.
        for (let i = 0; i < data.length - 1; i++) {
          createConnection(i, i + 1, "crate_data");
        }

      } else {
          //Default grid
        const gridSpacing = 2 * params.networkScale;
        const gridSize = 3;

        for (let x = -gridSize; x <= gridSize; x++) {
          for (let z = -gridSize; z <= gridSize; z++) {
            createNode(x * gridSpacing, 0, z * gridSpacing);
          }
        }

        for (let i = 0; i < nodes.length; i++) {
          const x = i % (gridSize * 2 + 1);
          const z = Math.floor(i / (gridSize * 2 + 1));

          if (x < gridSize * 2) createConnection(i, i + 1, "land");
          if (z < gridSize * 2) createConnection(i, i + (gridSize * 2 + 1), "land");
        }
        createConnection(0, nodes.length - 1, "sea");
        createConnection(gridSize, nodes.length - 1 - gridSize, "sea");
      }
    }

    function updateLaserColor() {
      connections.forEach((conn) => {
        if (conn.userData.type === "laser") {
          (conn.material as THREE.LineBasicMaterial).color.set(params.laserColor);
        }
      });
    }

      function updateConnectionWidth() {
        console.warn("Line width adjustments with LineBasicMaterial have limited support.");
    }

    function checkCollisions() {
      for (let i = 0; i < units.length; i++) {
        const unitData = units[i];
        const unitBox = new THREE.Box3().setFromObject(unitData.mesh);

        for (let j = i + 1; j < units.length; j++) {
          const otherUnitData = units[j];
          const otherUnitBox = new THREE.Box3().setFromObject(otherUnitData.mesh);

          if (unitBox.intersectsBox(otherUnitBox)) {
            handleCollision(unitData, otherUnitData);
          }
        }
      }
    }

    function handleCollision(unit1Data: Unit, unit2Data: Unit) {
      scene.remove(unit1Data.mesh);
      scene.remove(unit2Data.mesh);

      const index1 = units.indexOf(unit1Data);
      if (index1 > -1) {
        units.splice(index1, 1);
      }
      const index2 = units.indexOf(unit2Data);
      if (index2 > -1) {
        units.splice(index2, 1);
      }
      createCollisionEffect(unit1Data.mesh.position);
    }

    function createCollisionEffect(position: THREE.Vector3) {
      const explosionGeometry = new THREE.SphereGeometry(0.2, 8, 8);
      const explosionMaterial = new THREE.MeshBasicMaterial({
        color: 0xffa500,
        transparent: true,
        opacity: 1
      });
      const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
      explosion.position.copy(position);
      scene.add(explosion);

      const startTime = Date.now();
      const duration = 500;

      function animateExplosion() {
        const elapsed = Date.now() - startTime;
        if (elapsed < duration) {
          const progress = elapsed / duration;
          explosion.material.opacity = 1 - progress;
          explosion.scale.setScalar(1 + 0.5 * progress);
          requestAnimationFrame(animateExplosion);
        } else {
          scene.remove(explosion);
        }
      }
      animateExplosion();
    }

    // --- User Interaction (Raycasting for Node Selection) ---

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseClick(event: MouseEvent) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(nodes);

      if (intersects.length > 0) {
        const intersectedNode = intersects[0].object as THREE.Mesh;
        const nodeIndex = nodes.indexOf(intersectedNode);

        if (launching) {
          if (selectedNode !== null) {
            createUnit(selectedNode, nodeIndex);
            setSelectedNode(null);
            setLaunching(false);
          } else {
            setSelectedNode(nodeIndex);
          }
        } else {
          console.log("Selected node index:", nodeIndex);
          setSelectedNode(nodeIndex);
        }
      } else {
        setSelectedNode(null);
      }
    }

    document.addEventListener('click', onMouseClick, false);

    // --- Animation Loop ---
    let animationFrameId: number;
    function animate() {
      moveUnits();
      checkCollisions();
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    }

    function moveUnits() {
      for (let i = 0; i < units.length; i++) {
        const unitData = units[i];
        unitData.progress += unitData.speed;

        if (unitData.progress >= 1) {
          scene.remove(unitData.mesh);
          units.splice(i, 1);
          i--;
        } else {
          unitData.mesh.position.lerpVectors(
            nodePositions[unitData.startNodeIndex],
            nodePositions[unitData.endNodeIndex],
            unitData.progress
          );
        }
      }
    }


    // --- Resize Handling ---
    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", handleResize);

    // --- Initial Network Generation ---
    generateNetwork();
    animate();


    // --- Cleanup on Unmount ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      nodes.forEach((node) => scene.remove(node));
      connections.forEach((conn) => scene.remove(conn));
      units.forEach(unit => scene.remove(unit.mesh));
      gui.destroy();
      window.removeEventListener("resize", handleResize);
      document.removeEventListener('click', onMouseClick, false);
    };
  }, [launching, selectedNode, data]);  // Include 'data' in dependencies

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100vh" }}>
      <button
        style={{ position: 'absolute', top: '10px', left: '10px' }}
        onClick={() => setLaunching(true)}
      >
        Launch Unit
      </button>
      {selectedNode !== null && (
        <div style={{ position: 'absolute', top: '40px', left: '10px' }}>
          Selected Node: {selectedNode}
        </div>
      )}
       {crateError && (
        <div style={{ position: 'absolute', top: '70px', left: '10px', color: 'red' }}>
          Error: {crateError}
        </div>
      )}
    </div>
  );
};

export default NetworkVisualization;