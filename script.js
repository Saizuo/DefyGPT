document.addEventListener('DOMContentLoaded', function() {
    // Initialize 3D Globe
    initGlobe();
    
    // Navigation functionality
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Set initial active section
    document.querySelector('.section').classList.add('active');
    
    // Smooth scrolling when clicking navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get target section
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            // Scroll to section
            window.scrollTo({
                top: targetSection.offsetTop,
                behavior: 'smooth'
            });
        });
    });
    
    // Intersection Observer for section visibility
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // If section is in viewport
            if (entry.isIntersecting) {
                // Add active class to make section visible
                entry.target.classList.add('active');
                
                // Update active nav link
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            } else {
                // Optional: if you want sections to hide when not in view
                // entry.target.classList.remove('active');
            }
        });
    }, {
        root: null,
        rootMargin: '-20% 0px -20% 0px', // Adjust this to control when sections become active
        threshold: 0.1
    });
    
    // Observe all sections
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
    
    // Animate timeline items on scroll
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-50px)';
        item.style.transition = 'all 0.5s ease';
        observer.observe(item);
    });
    
    // NFT Countdown timer
    function updateCountdown() {
        const now = new Date();
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + 21);
        
        const days = document.querySelector('.countdown-item:nth-child(1) .countdown-value');
        const hours = document.querySelector('.countdown-item:nth-child(2) .countdown-value');
        const minutes = document.querySelector('.countdown-item:nth-child(3) .countdown-value');
        
        const timeLeft = targetDate - now;
        
        const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hoursLeft = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        days.textContent = daysLeft;
        hours.textContent = hoursLeft;
        minutes.textContent = minutesLeft;
    }
    
    updateCountdown();
    setInterval(updateCountdown, 60000); // Update every minute
});

// 3D Globe Visualization
function initGlobe() {
    // Globe code remains the same as before
    // ...
}


// 3D Globe Visualization
function initGlobe() {
    const container = document.getElementById('globe-container');
    
    // Create scene
    const scene = new THREE.Scene();
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 200;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Create globe
    const globeRadius = 100;
    const globeGeometry = new THREE.SphereGeometry(globeRadius, 64, 64);
    
    // Create globe material with custom shader
    const globeMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            
            uniform vec3 color1;
            uniform vec3 color2;
            uniform float time;
            
            void main() {
                float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
                float glowFactor = sin(time * 0.5) * 0.1 + 0.9;
                
                // Grid pattern
                float latitude = acos(vNormal.y);
                float longitude = atan(vNormal.z, vNormal.x);
                
                float latGrid = smoothstep(0.98, 1.0, cos(latitude * 20.0));
                float longGrid = smoothstep(0.98, 1.0, cos(longitude * 20.0));
                
                float grid = max(latGrid, longGrid) * 0.5;
                
                // Combine colors
                vec3 baseColor = mix(color1, color2, intensity * glowFactor);
                vec3 finalColor = mix(baseColor, vec3(1.0, 0.3, 0.3), grid);
                
                gl_FragColor = vec4(finalColor, intensity * glowFactor);
            }
        `,
        uniforms: {
            color1: { value: new THREE.Color(0x000000) },
            color2: { value: new THREE.Color(0xff1a1a) },
            time: { value: 0 }
        },
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);
    
    // Create atmosphere
    const atmosphereGeometry = new THREE.SphereGeometry(globeRadius + 5, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            
            uniform vec3 glowColor;
            uniform float time;
            
            void main() {
                float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
                float glowFactor = sin(time * 0.3) * 0.1 + 0.9;
                gl_FragColor = vec4(glowColor, intensity * glowFactor * 0.6);
            }
        `,
        uniforms: {
            glowColor: { value: new THREE.Color(0xff1a1a) },
            time: { value: 0 }
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });
    
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);
    
    // Create stars
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
        transparent: true,
        opacity: 0.8
    });
    
    const starsVertices = [];
    for (let i = 0; i < 3000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    
    // Create data points on globe
    const dataPoints = [
        { lat: 40.7128, lng: -74.0060 }, // New York
        { lat: 51.5074, lng: -0.1278 },  // London
        { lat: 35.6762, lng: 139.6503 }, // Tokyo
        { lat: 37.7749, lng: -122.4194 }, // San Francisco
        { lat: -33.8688, lng: 151.2093 }, // Sydney
        { lat: 55.7558, lng: 37.6173 },  // Moscow
        { lat: 19.4326, lng: -99.1332 }, // Mexico City
        { lat: -23.5505, lng: -46.6333 }, // São Paulo
    ];
    
    const pointsGroup = new THREE.Group();
    scene.add(pointsGroup);
    
    dataPoints.forEach(point => {
        const { x, y, z } = latLngToVector3(point.lat, point.lng, globeRadius);
        
        // Create point
        const pointGeometry = new THREE.SphereGeometry(1, 16, 16);
        const pointMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff1a1a,
            transparent: true,
            opacity: 0.8
        });
        
        const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
        pointMesh.position.set(x, y, z);
        pointsGroup.add(pointMesh);
        
        // Create pulse
        const pulseGeometry = new THREE.SphereGeometry(1, 16, 16);
        const pulseMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                
                uniform float time;
                uniform vec3 color;
                
                void main() {
                    float pulse = sin(time * 2.0) * 0.5 + 0.5;
                    gl_FragColor = vec4(color, (1.0 - pulse) * 0.6);
                }
            `,
            uniforms: {
                time: { value: 0 },
                color: { value: new THREE.Color(0xff1a1a) }
            },
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
        pulse.position.set(x, y, z);
        pulse.userData = { initialScale: 1 };
        pointsGroup.add(pulse);
    });
    
    // Helper function to convert lat/lng to 3D coordinates
    function latLngToVector3(lat, lng, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        
        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        return { x, y, z };
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Animation loop
    const clock = new THREE.Clock();
    
    function animate() {
        requestAnimationFrame(animate);
        
        const elapsedTime = clock.getElapsedTime();
        
        // Rotate globe
        globe.rotation.y = elapsedTime * 0.05;
        pointsGroup.rotation.y = elapsedTime * 0.05;
        
        // Update shader uniforms
        globeMaterial.uniforms.time.value = elapsedTime;
        atmosphereMaterial.uniforms.time.value = elapsedTime;
        
        // Update pulse points
        pointsGroup.children.forEach(child => {
            if (child.userData && child.userData.initialScale) {
                const scale = Math.sin(elapsedTime * 2 + child.position.x) * 0.5 + 1.5;
                child.scale.set(scale, scale, scale);
                
                if (child.material.uniforms) {
                    child.material.uniforms.time.value = elapsedTime;
                }
            }
        });
        
        renderer.render(scene, camera);
    }
    
    animate();
}
