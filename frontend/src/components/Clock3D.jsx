import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { sharedColors } from '../data/clockOptions';

const Clock3D = ({ isExploded = false, clockConfig = {} }) => {
    const mountRef = useRef(null);

    // Refs for state management in animation loop
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const componentsRef = useRef([]);
    const frameIdRef = useRef(null);
    const explodedStateRef = useRef(false); // Valid ref for loop access

    // Interaction Refs
    const isDraggingRef = useRef(false);
    const previousMouseRef = useRef({ x: 0, y: 0 });
    const targetRotationRef = useRef({ x: 0, y: 0.5, z: 0 });
    const targetPositionRef = useRef({ x: 0, y: 0, z: 0 });
    const lastInteractionTimeRef = useRef(Date.now());

    // Constants
    const VALEURS_NORMALES = { rotX: 0, rotY: 0.5, rotZ: 0, posX: 0, posY: 0, posZ: 0 };
    const VALEURS_ECLATEES = { rotX: -0.55, rotY: 0.63, rotZ: 0, posX: -1.90, posY: -0.90, posZ: 0 };
    const DELAI_REINITIALISATION = 3000;
    const SENSIBILITE = 0.005;

    // Helper: Convert color name to hex
    const getColorHex = (colorName) => {
        const colorObj = sharedColors.find(c => c.name === colorName);
        return colorObj ? colorObj.hex : '#2C2C2C'; // Default to black
    };

    // Helper: Convert hex to THREE.Color
    const hexToThreeColor = (hex) => {
        return new THREE.Color(hex);
    };

    // Sync state to ref
    useEffect(() => {
        explodedStateRef.current = isExploded;
        const target = isExploded ? VALEURS_ECLATEES : VALEURS_NORMALES;

        targetRotationRef.current.x = target.rotX;
        targetRotationRef.current.y = target.rotY;
        targetRotationRef.current.z = target.rotZ;

        targetPositionRef.current.x = target.posX;
        targetPositionRef.current.y = target.posY;
        targetPositionRef.current.z = target.posZ;

        lastInteractionTimeRef.current = Date.now();
    }, [isExploded]);

    useEffect(() => {
        if (!mountRef.current) return;

        // --- SVG HELPER ---
        const loader = new SVGLoader();

        // --- SETUP ---
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        // Extract colors from config
        const primaryColor = hexToThreeColor(getColorHex(clockConfig['Couleur Primaire']));
        const secondaryColor = hexToThreeColor(getColorHex(clockConfig['Couleur Secondaire']));
        const hourColor = hexToThreeColor(getColorHex(clockConfig['Heure']));
        const minuteColor = hexToThreeColor(getColorHex(clockConfig['Minute']));
        const secondColor = hexToThreeColor(getColorHex(clockConfig['Seconde']));

        // Adjust camera distance based on viewport size
        const getCameraDistance = (w) => {
            if (w < 400) return 18;
            if (w < 600) return 15;
            return 13;
        };

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, getCameraDistance(width));
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.outputEncoding = THREE.sRGBEncoding;
        mountRef.current.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        scene.add(ambientLight);

        const group = new THREE.Group();
        scene.add(group);

        // --- HELPERS ---
        const createFlatMaterial = (color, priority = 0, opacity = 1) => {
            return new THREE.MeshBasicMaterial({
                color: color,
                side: THREE.DoubleSide,
                transparent: opacity < 1,
                opacity: opacity,
                polygonOffset: true,
                polygonOffsetFactor: -priority,
                polygonOffsetUnits: -1
            });
        };

        const createNeedleGeometry = (wBase, wTip, len) => {
            const shape = new THREE.Shape();
            shape.moveTo(-wBase / 2, 0);
            shape.lineTo(wBase / 2, 0);
            shape.lineTo(wTip / 2, len);
            shape.lineTo(-wTip / 2, len);
            shape.closePath();
            return new THREE.ShapeGeometry(shape);
        };

        const addComponent = (obj, layerIndex) => {
            obj.userData = { indexCouche: layerIndex, zInitial: obj.position.z };
            group.add(obj);
            componentsRef.current.push(obj);
        };

        // --- VISIBILITY CONFIG ---
        const showBackplate = false; // Set to false to hide
        const showPin = true;       // Set to false to hide
        const showGlass = false;     // Set to false to hide

        const showDial = true;
        const showBezel = false;
        const showGraduations = false;
        const showHourHand = true;
        const showMinuteHand = true;
        const showSecondHand = true;

        // --- BUILDING CLOCK ---
        const circleGeo = new THREE.CircleGeometry(5, 64);

        // 1. Back Case (Secondary Color)
        if (showBackplate) {
            const backCase = new THREE.Mesh(circleGeo, createFlatMaterial(secondaryColor, 1));
            backCase.position.z = -0.05;
            addComponent(backCase, 0);
        }

        // 2. Dial (Primary Color)
        if (showDial) {
            const dial = new THREE.Mesh(circleGeo, createFlatMaterial(primaryColor, 0));
            dial.position.z = 0;
            addComponent(dial, 1);
        }

        // 3. Bezel (Darker version of secondary)
        if (showBezel) {
            const bezelColor = secondaryColor.clone().multiplyScalar(0.7);
            const bezelGeo = new THREE.TorusGeometry(5, 0.1, 16, 100);
            const bezel = new THREE.Mesh(bezelGeo, createFlatMaterial(bezelColor, 0.5));
            bezel.position.z = 0.01;
            addComponent(bezel, 2);
        }

        // 4. Graduations (Contrast with primary)
        if (showGraduations) {
            const gradGroup = new THREE.Group();
            const gradColor = primaryColor.clone();
            const isLight = (gradColor.r + gradColor.g + gradColor.b) / 3 > 0.5;
            const gradMainColor = isLight ? new THREE.Color(0x2c3e50) : new THREE.Color(0xffffff);
            const gradMinorColor = gradMainColor.clone().multiplyScalar(0.5);

            for (let i = 0; i < 60; i++) {
                const isHour = i % 5 === 0;
                const w = isHour ? 0.15 : 0.05;
                const h = isHour ? 0.6 : 0.3;
                const geo = new THREE.PlaneGeometry(w, h);
                const mat = createFlatMaterial(isHour ? gradMainColor : gradMinorColor, 1);
                const mesh = new THREE.Mesh(geo, mat);
                const angle = (i / 60) * Math.PI * 2;
                mesh.position.x = Math.sin(angle) * 4.4;
                mesh.position.y = Math.cos(angle) * 4.4;
                mesh.rotation.z = -angle;
                gradGroup.add(mesh);
            }
            gradGroup.position.z = 0.02;
            addComponent(gradGroup, 3);
        }

        // --- NUMBERS (SVG) ---
        // Load numbers based on Format
        // Since we don't have procedural numbers, we only render if SVG loads.
        const format = clockConfig['Format'];
        if (format) {
            loader.load(
                `/img/numbers/${format}.svg`,
                (data) => {
                    const paths = data.paths;
                    const shapes = [];
                    paths.forEach((p) => shapes.push(...SVGLoader.createShapes(p)));

                    if (shapes.length === 0) return;

                    const geo = new THREE.ExtrudeGeometry(shapes, { depth: 0.05, bevelEnabled: false });

                    // --- ViewBox Based Scaling/Centering ---
                    // This preserves the layout relative to the canvas center
                    const xml = data.xml;
                    let viewBox = { x: 0, y: 0, w: 100, h: 100 }; // Default fallback

                    if (xml && xml.getAttribute('viewBox')) {
                        const vb = xml.getAttribute('viewBox').split(/[ ,]+/).map(parseFloat);
                        if (vb.length === 4) {
                            viewBox = { x: vb[0], y: vb[1], w: vb[2], h: vb[3] };
                        }
                    }

                    // 1. Center the geometry based on ViewBox center
                    const centerX = viewBox.x + viewBox.w / 2;
                    const centerY = viewBox.y + viewBox.h / 2;
                    geo.translate(-centerX, -centerY, 0);

                    // 2. Scale to fit clock face
                    // Clock diameter is ~10 units (radius 5).
                    // We assume the SVG canvas represents the full clock face.
                    // Scale factor = TargetSize / ViewBoxSize
                    // Use the smaller dimension to fit? Or typically Width=Height for clock.
                    const scale = 8.5 / viewBox.w; // 8.5 to leave some margin within 10 unit dial
                    geo.scale(scale, -scale, 1); // Flip Y

                    // Color logic
                    const numColorName = clockConfig['Couleur'] || 'Noir & Blanc';
                    const numColorHex = getColorHex(numColorName);
                    const numColor = hexToThreeColor(numColorHex);

                    const mesh = new THREE.Mesh(geo, createFlatMaterial(numColor, 3));
                    mesh.position.z = 0.025;
                    addComponent(mesh, 3);
                }
            );
        }

        // --- SVG HELPER ---
        // const loader = new SVGLoader(); // Moved to top

        const loadHandMesh = (type, color, zPos, fallbackGeoFn, layerIndex, setRef) => {
            const url = `/img/needles/${clockConfig['Style'] || 'Bâton'}.svg`; // Assuming 'Style' is the config key

            // Try to load SVG
            loader.load(
                url,
                (data) => {
                    // Success: Create 3D shape from SVG paths
                    const paths = data.paths;
                    const shapes = [];

                    paths.forEach((path) => {
                        const pathShapes = SVGLoader.createShapes(path);
                        shapes.push(...pathShapes);
                    });

                    if (shapes.length === 0) return;

                    const extrudeSettings = {
                        depth: 0.05, // Thickness
                        bevelEnabled: false
                    };

                    const geometry = new THREE.ExtrudeGeometry(shapes, extrudeSettings);

                    // Center/Pivot adjustment
                    // We assume the SVG is drawn such that we need to center it horizontally
                    // and align the bottom to 0 (pivot point)
                    geometry.computeBoundingBox();
                    const box = geometry.boundingBox;
                    const xSize = box.max.x - box.min.x;
                    const ySize = box.max.y - box.min.y;

                    // Center X, Align Bottom Y to 0
                    geometry.translate(-(box.min.x + xSize / 2), -box.min.y, 0);

                    // Scale down? SVGs might be huge (pixels). 
                    // Our clock is radius ~5 units.
                    // If SVG is 100px tall, it will be huge. 
                    // Heuristic: Scale based on height to match roughly 3-4 units?
                    // Or let user handle it. For now, let's normalize height to ~4 units.
                    const scale = 4 / ySize;
                    geometry.scale(scale, scale, 1);

                    // Flip Y because SVG coordinates are top-down, Three.js is bottom-up?
                    // SVGLoader usually handles this but sometimes we need to flip. 
                    // Actually SVGLoader.createShapes usually results in correct orientation if we convert properly, 
                    // but often Y is inverted. 
                    geometry.scale(1, -1, 1);

                    const mesh = new THREE.Mesh(geometry, createFlatMaterial(color, layerIndex));
                    mesh.position.z = zPos;

                    // Add to scene/group
                    addComponent(mesh, layerIndex);
                    if (setRef) setRef(mesh);
                },
                undefined, // Progress
                (error) => {
                    // Error/Fallback: Use procedural geometry
                    // console.warn('SVG load failed, using fallback:', url);
                    const mesh = new THREE.Mesh(fallbackGeoFn(), createFlatMaterial(color, layerIndex));
                    mesh.position.z = zPos;
                    addComponent(mesh, layerIndex);
                    if (setRef) setRef(mesh);
                }
            );
        };

        // 5. Hands (Custom colors from config)
        let hourHand, minuteHand, secondHand;

        if (showHourHand) {
            // Procedural fallback for Hour
            const fallback = () => createNeedleGeometry(0.35, 0.15, 2.8);
            // We need to set the ref, but loadHandMesh is async for SVG.
            // We pass a setter function.
            const setHourRef = (mesh) => { hourHand = mesh; };

            // Note: Reuse logic. 
            // We should use a specific SVG for Hour vs Minute? 
            // Usually a style pack has "hour.svg", "minute.svg". 
            // User request: "interchangeable... avec des fichiers svg". 
            // Let's assume files are named "{Style}_hour.svg", "{Style}_minute.svg"?
            // Or just "{Style}.svg" and we scale it? 
            // The request says "elements... interchangeable". 
            // Let's try to load specifically named files if possible, or fallback to style.

            // Refined Strategy: 
            // Load `${clockConfig['Style']}_hour.svg`

            const style = clockConfig['Style'] || 'Bâton';

            // Inline modified loader for specific hand types to simplify for now
            loader.load(
                `/img/needles/${style}_hour.svg`,
                (data) => {
                    const paths = data.paths;
                    const shapes = [];
                    paths.forEach((p) => shapes.push(...SVGLoader.createShapes(p)));
                    const geo = new THREE.ExtrudeGeometry(shapes, { depth: 0.05, bevelEnabled: false });
                    geo.computeBoundingBox();
                    const box = geo.boundingBox;
                    geo.translate(-(box.min.x + (box.max.x - box.min.x) / 2), -box.min.y, 0);
                    // Scale to target length ~3
                    const h = box.max.y - box.min.y;
                    const s = 2.8 / (h || 1);
                    geo.scale(s, -s, 1); // Flip Y

                    const mesh = new THREE.Mesh(geo, createFlatMaterial(hourColor, 3));
                    mesh.position.z = 0.03;
                    addComponent(mesh, 4);
                    hourHand = mesh;
                },
                undefined,
                () => {
                    const mesh = new THREE.Mesh(createNeedleGeometry(0.35, 0.15, 2.8), createFlatMaterial(hourColor, 3));
                    mesh.position.z = 0.03;
                    addComponent(mesh, 4);
                    hourHand = mesh;
                }
            );
        }

        if (showMinuteHand) {
            const style = clockConfig['Style'] || 'Bâton';
            loader.load(
                `/img/needles/${style}_minute.svg`,
                (data) => {
                    const paths = data.paths;
                    const shapes = [];
                    paths.forEach((p) => shapes.push(...SVGLoader.createShapes(p)));
                    const geo = new THREE.ExtrudeGeometry(shapes, { depth: 0.05, bevelEnabled: false });
                    geo.computeBoundingBox();
                    const box = geo.boundingBox;
                    geo.translate(-(box.min.x + (box.max.x - box.min.x) / 2), -box.min.y, 0);
                    // Scale to target length ~4
                    const h = box.max.y - box.min.y;
                    const s = 4.0 / (h || 1);
                    geo.scale(s, -s, 1);

                    const mesh = new THREE.Mesh(geo, createFlatMaterial(minuteColor, 4));
                    mesh.position.z = 0.04;
                    addComponent(mesh, 5);
                    minuteHand = mesh;
                },
                undefined,
                () => {
                    const mesh = new THREE.Mesh(createNeedleGeometry(0.25, 0.1, 4.0), createFlatMaterial(minuteColor, 4));
                    mesh.position.z = 0.04;
                    addComponent(mesh, 5);
                    minuteHand = mesh;
                }
            );
        }

        if (showSecondHand) {
            const style = clockConfig['Style'] || 'Bâton';
            loader.load(
                `/img/needles/${style}_second.svg`,
                (data) => {
                    const paths = data.paths;
                    const shapes = [];
                    paths.forEach((p) => shapes.push(...SVGLoader.createShapes(p)));
                    const geo = new THREE.ExtrudeGeometry(shapes, { depth: 0.05, bevelEnabled: false });
                    geo.computeBoundingBox();
                    const box = geo.boundingBox;
                    geo.translate(-(box.min.x + (box.max.x - box.min.x) / 2), -box.min.y, 0);
                    // Scale to target length ~4.5
                    const h = box.max.y - box.min.y;
                    const s = 4.5 / (h || 1);
                    geo.scale(s, -s, 1);

                    const mesh = new THREE.Mesh(geo, createFlatMaterial(secondColor, 5));
                    mesh.position.z = 0.05;
                    addComponent(mesh, 6);
                    secondHand = mesh;
                },
                undefined,
                () => {
                    const mesh = new THREE.Mesh(createNeedleGeometry(0.1, 0.05, 4.5), createFlatMaterial(secondColor, 5));
                    mesh.position.z = 0.05;
                    addComponent(mesh, 6);
                    secondHand = mesh;
                }
            );
        }

        // Pin (matches hour hand)
        if (showPin) {
            const pin = new THREE.Mesh(new THREE.CircleGeometry(0.2, 32), createFlatMaterial(hourColor, 6));
            pin.position.z = 0.06;
            addComponent(pin, 7);
        }

        // 6. Glass (subtle tint based on primary)
        if (showGlass) {
            const glassColor = primaryColor.clone().multiplyScalar(1.2);
            const glass = new THREE.Mesh(circleGeo, createFlatMaterial(glassColor, 0, 0.05));
            glass.position.z = 0.1;
            addComponent(glass, 8);
        }


        // --- ANIMATION ---
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);

            // Time Updates
            const now = new Date();
            const ms = now.getMilliseconds();
            if (secondHand) secondHand.rotation.z = -((now.getSeconds() + ms / 1000) / 60) * Math.PI * 2;
            if (minuteHand) minuteHand.rotation.z = -((now.getMinutes() + now.getSeconds() / 60) / 60) * Math.PI * 2;
            if (hourHand) hourHand.rotation.z = -(((now.getHours() % 12) + now.getMinutes() / 60) / 12) * Math.PI * 2;

            // Physics / Reset logic
            const currentTime = Date.now();
            const isIdle = !isDraggingRef.current && !explodedStateRef.current && (currentTime - lastInteractionTimeRef.current > DELAI_REINITIALISATION);

            if (isIdle) {
                targetRotationRef.current.x += (VALEURS_NORMALES.rotX - targetRotationRef.current.x) * 0.05;
                targetRotationRef.current.y += (VALEURS_NORMALES.rotY - targetRotationRef.current.y) * 0.05;
                targetRotationRef.current.z += (VALEURS_NORMALES.rotZ - targetRotationRef.current.z) * 0.05;

                targetPositionRef.current.x += (VALEURS_NORMALES.posX - targetPositionRef.current.x) * 0.05;
                targetPositionRef.current.y += (VALEURS_NORMALES.posY - targetPositionRef.current.y) * 0.05;
                targetPositionRef.current.z += (VALEURS_NORMALES.posZ - targetPositionRef.current.z) * 0.05;
            }

            // Interpolation
            group.rotation.x += (targetRotationRef.current.x - group.rotation.x) * 0.1;
            group.rotation.y += (targetRotationRef.current.y - group.rotation.y) * 0.1;
            group.rotation.z += (targetRotationRef.current.z - group.rotation.z) * 0.1;

            group.position.x += (targetPositionRef.current.x - group.position.x) * 0.1;
            group.position.y += (targetPositionRef.current.y - group.position.y) * 0.1;
            group.position.z += (targetPositionRef.current.z - group.position.z) * 0.1;

            // Z-Layer Explosion
            componentsRef.current.forEach((comp) => {
                const layerGap = explodedStateRef.current ? 1.5 : 0;
                const zTarget = comp.userData.zInitial + (comp.userData.indexCouche * layerGap);
                comp.position.z += (zTarget - comp.position.z) * 0.1;
            });

            renderer.render(scene, camera);
        };

        animate();

        // Handle Window Resize
        const handleResize = () => {
            if (!mountRef.current || !cameraRef.current) return;
            const w = mountRef.current.clientWidth;
            const h = mountRef.current.clientHeight;
            cameraRef.current.aspect = w / h;
            cameraRef.current.position.z = getCameraDistance(w);
            cameraRef.current.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        // CLEANUP
        return () => {
            cancelAnimationFrame(frameIdRef.current);
            window.removeEventListener('resize', handleResize);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
            componentsRef.current = [];
        };
    }, [clockConfig]);

    // Handlers
    const getPointerPosition = (e) => {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        isDraggingRef.current = true;
        const pos = getPointerPosition(e);
        previousMouseRef.current = pos;
        lastInteractionTimeRef.current = Date.now();
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
    };

    const handleMouseMove = (e) => {
        if (isDraggingRef.current) {
            e.preventDefault();
            const pos = getPointerPosition(e);
            const deltaX = pos.x - previousMouseRef.current.x;
            const deltaY = pos.y - previousMouseRef.current.y;
            targetRotationRef.current.y += deltaX * SENSIBILITE;
            targetRotationRef.current.x += deltaY * SENSIBILITE;
            previousMouseRef.current = pos;
            lastInteractionTimeRef.current = Date.now();
        }
    };

    return (
        <div
            ref={mountRef}
            style={{ position: 'relative', width: '100%', height: '100%', background: 'transparent', overflow: 'visible', cursor: 'grab', touchAction: 'none' }}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            onTouchMove={handleMouseMove}
        />
    );
};

export default Clock3D;
