import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Clock3D = ({ isExploded = false }) => {
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

        // --- SETUP ---
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

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

        // --- BUILDING CLOCK ---
        const circleGeo = new THREE.CircleGeometry(5, 64);

        // 1. Back Case
        const backCase = new THREE.Mesh(circleGeo, createFlatMaterial(0x2c3e50, 1));
        backCase.position.z = -0.05;
        addComponent(backCase, 0);

        // 2. Dial
        const dial = new THREE.Mesh(circleGeo, createFlatMaterial(0xffffff, 0));
        dial.position.z = 0;
        addComponent(dial, 1);

        // 3. Bezel
        const bezelGeo = new THREE.TorusGeometry(5, 0.1, 16, 100);
        const bezel = new THREE.Mesh(bezelGeo, createFlatMaterial(0x95a5a6, 0.5));
        bezel.position.z = 0.01;
        addComponent(bezel, 2);

        // 4. Graduations
        const gradGroup = new THREE.Group();
        for (let i = 0; i < 60; i++) {
            const isHour = i % 5 === 0;
            const w = isHour ? 0.15 : 0.05;
            const h = isHour ? 0.6 : 0.3;
            const geo = new THREE.PlaneGeometry(w, h);
            const mat = createFlatMaterial(isHour ? 0x2c3e50 : 0xbdc3c7, 1);
            const mesh = new THREE.Mesh(geo, mat);
            const angle = (i / 60) * Math.PI * 2;
            mesh.position.x = Math.sin(angle) * 4.4;
            mesh.position.y = Math.cos(angle) * 4.4;
            mesh.rotation.z = -angle;
            gradGroup.add(mesh);
        }
        gradGroup.position.z = 0.02;
        addComponent(gradGroup, 3);

        // 5. Hands
        const hourHand = new THREE.Mesh(createNeedleGeometry(0.35, 0.15, 2.8), createFlatMaterial(0x2c3e50, 3));
        hourHand.position.z = 0.03;
        addComponent(hourHand, 4);

        const minuteHand = new THREE.Mesh(createNeedleGeometry(0.25, 0.1, 4.0), createFlatMaterial(0x2c3e50, 4));
        minuteHand.position.z = 0.04;
        addComponent(minuteHand, 5);

        const secondHand = new THREE.Mesh(createNeedleGeometry(0.1, 0.05, 4.5), createFlatMaterial(0xe74c3c, 5));
        secondHand.position.z = 0.05;
        addComponent(secondHand, 6);

        // Pin
        const pin = new THREE.Mesh(new THREE.CircleGeometry(0.2, 32), createFlatMaterial(0x2c3e50, 6));
        pin.position.z = 0.06;
        addComponent(pin, 7);

        // 6. Glass
        const glass = new THREE.Mesh(circleGeo, createFlatMaterial(0xffffff, 0, 0.05));
        glass.position.z = 0.1;
        addComponent(glass, 8);


        // --- ANIMATION ---
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);

            // Time Updates
            const now = new Date();
            const ms = now.getMilliseconds();
            secondHand.rotation.z = -((now.getSeconds() + ms / 1000) / 60) * Math.PI * 2;
            minuteHand.rotation.z = -((now.getMinutes() + now.getSeconds() / 60) / 60) * Math.PI * 2;
            hourHand.rotation.z = -(((now.getHours() % 12) + now.getMinutes() / 60) / 12) * Math.PI * 2;

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
    }, []);

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
