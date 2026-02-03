/**
 * futuristic 3D background animation using Three.js
 */

document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.bg-3d-container');

    if (sections.length === 0) return;

    // Load Three.js from CDN dynamically if not already present
    if (typeof THREE === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = () => initAllBackgrounds();
        document.head.appendChild(script);
    } else {
        initAllBackgrounds();
    }

    function initAllBackgrounds() {
        sections.forEach(container => {
            initBackground(container);
        });
    }

    function initBackground(container) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        renderer.setSize(container.offsetWidth, container.offsetHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Create a grid/particle field
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const count = 2000;

        for (let i = 0; i < count; i++) {
            vertices.push(
                THREE.MathUtils.randFloatSpread(2000), // x
                THREE.MathUtils.randFloatSpread(2000), // y
                THREE.MathUtils.randFloatSpread(2000)  // z
            );
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        const material = new THREE.PointsMaterial({
            color: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || 0x00f3ff,
            size: 2,
            transparent: true,
            opacity: 0.5
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        camera.position.z = 500;

        function animate() {
            requestAnimationFrame(animate);

            points.rotation.x += 0.0005;
            points.rotation.y += 0.001;

            renderer.render(scene, camera);
        }

        animate();

        // Handle resize
        window.addEventListener('resize', () => {
            camera.aspect = container.offsetWidth / container.offsetHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.offsetWidth, container.offsetHeight);
        });
    }
});
