class Game3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.car = null;
        this.road = null;
        this.obstacles = [];
        this.roadMarkings = [];
        
        // Game state
        this.gameState = 'start'; // 'start', 'playing', 'gameOver'
        this.score = 0;
        this.speed = 60;
        this.carPosition = { x: 0, z: 0 };
        this.roadSpeed = 0.3;
        
        // Input handling
        this.keys = {};
        this.carTargetX = 0;
        this.carCurrentX = 0;
        
        // Game parameters
        this.roadWidth = 12;
        this.laneWidth = 3;
        this.lanes = [-3, 0, 3]; // Three lanes
        
        // Performance optimization
        this.lastTime = 0;
        this.frameCount = 0;
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.createRoad();
        this.createCar();
        this.setupLighting();
        this.setupEventListeners();
        this.setupUI();
        
        // Start render loop
        this.animate();
    }
    
    setupScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
        
        // Create camera (top-down view)
        this.camera = new THREE.PerspectiveCamera(
            60, // FOV
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 25, 8);
        this.camera.lookAt(0, 0, -10);
        
        // Create renderer
        const canvas = document.getElementById('gameCanvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x87CEEB);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    createRoad() {
        // Main road
        const roadGeometry = new THREE.PlaneGeometry(this.roadWidth, 200);
        const roadMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x444444,
            transparent: true,
            opacity: 0.9
        });
        
        this.road = new THREE.Mesh(roadGeometry, roadMaterial);
        this.road.rotation.x = -Math.PI / 2;
        this.road.position.y = 0;
        this.road.receiveShadow = true;
        this.scene.add(this.road);
        
        // Road shoulders
        const shoulderGeometry = new THREE.PlaneGeometry(30, 200);
        const shoulderMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        
        const leftShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        leftShoulder.rotation.x = -Math.PI / 2;
        leftShoulder.position.set(-21, -0.01, 0);
        this.scene.add(leftShoulder);
        
        const rightShoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
        rightShoulder.rotation.x = -Math.PI / 2;
        rightShoulder.position.set(21, -0.01, 0);
        this.scene.add(rightShoulder);
        
        // Create initial road markings
        this.createRoadMarkings();
    }
    
    createRoadMarkings() {
        const markingGeometry = new THREE.PlaneGeometry(0.3, 2);
        const markingMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        
        // Center line markings
        for (let i = 0; i < 20; i++) {
            const marking = new THREE.Mesh(markingGeometry, markingMaterial);
            marking.rotation.x = -Math.PI / 2;
            marking.position.set(0, 0.01, -i * 8 - 10);
            this.scene.add(marking);
            this.roadMarkings.push(marking);
        }
        
        // Lane divider markings
        for (let lane = 0; lane < 2; lane++) {
            const laneX = (lane === 0) ? -1.5 : 1.5;
            for (let i = 0; i < 20; i++) {
                const marking = new THREE.Mesh(markingGeometry, markingMaterial);
                marking.rotation.x = -Math.PI / 2;
                marking.position.set(laneX, 0.01, -i * 8 - 10);
                this.scene.add(marking);
                this.roadMarkings.push(marking);
            }
        }
    }
    
    createCar() {
        const carGroup = new THREE.Group();
        
        // Car body
        const bodyGeometry = new THREE.BoxGeometry(1.5, 0.6, 3);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x0066FF });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.3;
        body.castShadow = true;
        carGroup.add(body);
        
        // Car roof
        const roofGeometry = new THREE.BoxGeometry(1.2, 0.4, 1.5);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x004499 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(0, 0.7, -0.2);
        roof.castShadow = true;
        carGroup.add(roof);
        
        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        
        const wheelPositions = [
            [-0.8, 0.3, 1.2],
            [0.8, 0.3, 1.2],
            [-0.8, 0.3, -1.2],
            [0.8, 0.3, -1.2]
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos[0], pos[1], pos[2]);
            wheel.castShadow = true;
            carGroup.add(wheel);
        });
        
        // Headlights
        const lightGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const lightMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFAA });
        
        const leftLight = new THREE.Mesh(lightGeometry, lightMaterial);
        leftLight.position.set(-0.5, 0.4, 1.6);
        carGroup.add(leftLight);
        
        const rightLight = new THREE.Mesh(lightGeometry, lightMaterial);
        rightLight.position.set(0.5, 0.4, 1.6);
        carGroup.add(rightLight);
        
        carGroup.position.set(0, 0, 5);
        this.car = carGroup;
        this.scene.add(this.car);
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);
    }
    
    createObstacle(lane) {
        const obstacleGroup = new THREE.Group();
        
        // Random obstacle type
        const types = ['car', 'truck', 'cone'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        if (type === 'car') {
            // Enemy car
            const bodyGeometry = new THREE.BoxGeometry(1.4, 0.5, 2.5);
            const colors = [0xFF0000, 0x00FF00, 0xFFFF00, 0xFF00FF];
            const bodyMaterial = new THREE.MeshLambertMaterial({ 
                color: colors[Math.floor(Math.random() * colors.length)]
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.25;
            body.castShadow = true;
            obstacleGroup.add(body);
            
        } else if (type === 'truck') {
            // Truck
            const bodyGeometry = new THREE.BoxGeometry(1.6, 0.8, 4);
            const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.position.y = 0.4;
            body.castShadow = true;
            obstacleGroup.add(body);
            
        } else {
            // Traffic cone
            const coneGeometry = new THREE.ConeGeometry(0.3, 1, 8);
            const coneMaterial = new THREE.MeshLambertMaterial({ color: 0xFF4500 });
            const cone = new THREE.Mesh(coneGeometry, coneMaterial);
            cone.position.y = 0.5;
            cone.castShadow = true;
            obstacleGroup.add(cone);
        }
        
        obstacleGroup.position.set(this.lanes[lane], 0, -50);
        obstacleGroup.userData = { type: type, lane: lane };
        
        this.scene.add(obstacleGroup);
        this.obstacles.push(obstacleGroup);
    }
    
    setupEventListeners() {
        // Keyboard input
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            
            if (event.code === 'KeyR' && this.gameState === 'gameOver') {
                this.restartGame();
            }
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
        
        // UI buttons
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    setupUI() {
        // Initial UI state
        this.updateUI();
    }
    
    startGame() {
        this.gameState = 'playing';
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('instructions').classList.remove('hidden');
        this.resetGame();
    }
    
    restartGame() {
        this.gameState = 'playing';
        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('instructions').classList.remove('hidden');
        this.resetGame();
    }
    
    resetGame() {
        this.score = 0;
        this.speed = 60;
        this.carTargetX = 0;
        this.carCurrentX = 0;
        this.car.position.x = 0;
        
        // Clear obstacles
        this.obstacles.forEach(obstacle => {
            this.scene.remove(obstacle);
        });
        this.obstacles = [];
        
        this.updateUI();
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('instructions').classList.add('hidden');
        document.getElementById('gameOver').classList.remove('hidden');
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalDistance').textContent = Math.floor(this.score / 10);
    }
    
    updateUI() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('speed').textContent = `Speed: ${this.speed} km/h`;
    }
    
    handleInput() {
        if (this.gameState !== 'playing') return;
        
        // Car steering
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.carTargetX = Math.max(-3, this.carTargetX - 0.2);
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.carTargetX = Math.min(3, this.carTargetX + 0.2);
        }
        
        // Smooth car movement
        this.carCurrentX += (this.carTargetX - this.carCurrentX) * 0.15;
        this.car.position.x = this.carCurrentX;
    }
    
    updateGame(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update score and speed
        this.score += 1;
        this.speed = Math.min(120, 60 + Math.floor(this.score / 500));
        this.roadSpeed = 0.3 + (this.speed - 60) / 200;
        
        // Move road markings
        this.roadMarkings.forEach(marking => {
            marking.position.z += this.roadSpeed;
            if (marking.position.z > 20) {
                marking.position.z -= 160;
            }
        });
        
        // Update obstacles
        this.obstacles.forEach((obstacle, index) => {
            obstacle.position.z += this.roadSpeed;
            
            // Remove obstacles that are too far behind
            if (obstacle.position.z > 20) {
                this.scene.remove(obstacle);
                this.obstacles.splice(index, 1);
            }
        });
        
        // Spawn new obstacles
        if (Math.random() < 0.02 + this.speed / 10000) {
            const lane = Math.floor(Math.random() * 3);
            // Check if lane is clear
            const laneObstacles = this.obstacles.filter(obs => 
                Math.abs(obs.position.x - this.lanes[lane]) < 1 && obs.position.z > -30
            );
            
            if (laneObstacles.length === 0) {
                this.createObstacle(lane);
            }
        }
        
        // Collision detection
        this.checkCollisions();
        
        this.updateUI();
    }
    
    checkCollisions() {
        const carBox = new THREE.Box3().setFromObject(this.car);
        
        this.obstacles.forEach(obstacle => {
            const obstacleBox = new THREE.Box3().setFromObject(obstacle);
            
            if (carBox.intersectsBox(obstacleBox)) {
                this.gameOver();
            }
        });
    }
    
    animate(currentTime = 0) {
        requestAnimationFrame((time) => this.animate(time));
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Limit to 60 FPS
        if (deltaTime < 16.67) return;
        
        this.handleInput();
        this.updateGame(deltaTime);
        
        // Render
        this.renderer.render(this.scene, this.camera);
        
        this.frameCount++;
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new Game3D();
});