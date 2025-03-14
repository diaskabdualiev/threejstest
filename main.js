// Инициализация Three.js
let scene, camera, renderer;
let particles, particlesMaterial;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let raycaster, mouse;

// Переменные для 3D модели
let modelScene, modelCamera, modelRenderer;
let cube;

// Переменные для проектных моделей
let projectScenes = [], projectCameras = [], projectRenderers = [];
let projectModels = [];

// Переменные для параллакс-эффекта
let scrollY = 0;
let targetScrollY = 0;

// Инициализация сцены
function init() {
    // Инициализация объектов для интерактивности
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Создание основной сцены с фоном из частиц
    initMainScene();
    
    // Создание сцены с 3D моделью
    initModelScene();
    
    // Создание 3D моделей для проектов
    initProjectModels();
    
    // Обработчики событий
    document.addEventListener('mousemove', onDocumentMouseMove);
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('wheel', onDocumentScroll);
    document.addEventListener('touchmove', onDocumentTouchMove);
    window.addEventListener('resize', onWindowResize);
    
    // Запуск анимаций
    animate();
    
    // Добавление параллакс-эффекта
    initParallaxEffect();
}

// Инициализация основной сцены
function initMainScene() {
    // Создание сцены
    scene = new THREE.Scene();

    // Настройка камеры
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 1000;

    // Создание рендерера
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x020A24, 1);
    
    // Добавление canvas в HTML
    document.getElementById('bg-canvas').appendChild(renderer.domElement);

    // Создание частиц
    createParticles();
}

// Инициализация сцены с 3D моделью
function initModelScene() {
    // Получение элемента для рендеринга модели
    const modelContainer = document.getElementById('model-canvas');
    
    if (!modelContainer) return;
    
    // Создание сцены
    modelScene = new THREE.Scene();
    modelScene.background = new THREE.Color(0x1a2a3a);
    
    // Настройка камеры
    modelCamera = new THREE.PerspectiveCamera(75, modelContainer.clientWidth / modelContainer.clientHeight, 0.1, 1000);
    modelCamera.position.z = 5;
    
    // Создание рендерера
    modelRenderer = new THREE.WebGLRenderer({ antialias: true });
    modelRenderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
    modelContainer.appendChild(modelRenderer.domElement);
    
    // Добавление освещения
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    modelScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    modelScene.add(directionalLight);
    
    // Создание геометрии (в данном случае - додекаэдр)
    const geometry = new THREE.DodecahedronGeometry(2, 0);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x3498db,
        flatShading: true,
        wireframe: false,
        shininess: 100
    });
    
    cube = new THREE.Mesh(geometry, material);
    modelScene.add(cube);
    
    // Создание каркаса (wireframe) для объекта
    const wireframeGeometry = new THREE.WireframeGeometry(geometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({ 
        color: 0x64b5f6,
        linewidth: 1
    });
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    cube.add(wireframe);
    
    // Добавляем обработчик для взаимодействия с моделью
    modelContainer.addEventListener('mousemove', onModelMouseMove);
    modelContainer.addEventListener('mousedown', onModelMouseDown);
    modelContainer.addEventListener('mouseup', onModelMouseUp);
    modelContainer.addEventListener('mouseleave', onModelMouseUp);
}

// Инициализация 3D моделей для проектов
function initProjectModels() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach((card, index) => {
        // Создаем контейнер для 3D модели
        const modelContainer = document.createElement('div');
        modelContainer.className = 'project-model-container';
        card.appendChild(modelContainer);
        
        // Создаем сцену для проекта
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a192f);
        projectScenes.push(scene);
        
        // Создаем камеру
        const camera = new THREE.PerspectiveCamera(60, modelContainer.clientWidth / modelContainer.clientHeight, 0.1, 1000);
        camera.position.z = 5;
        projectCameras.push(camera);
        
        // Создаем рендерер
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
        modelContainer.appendChild(renderer.domElement);
        projectRenderers.push(renderer);
        
        // Добавляем освещение
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);
        
        // Создаем разные геометрии для разных проектов
        let geometry, material, mesh;
        
        switch(index) {
            case 0:
                // Проект 1: Тор с эффектом волны
                geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
                material = new THREE.MeshPhongMaterial({ 
                    color: 0xff7e5f,
                    flatShading: false,
                    shininess: 150
                });
                mesh = new THREE.Mesh(geometry, material);
                break;
                
            case 1:
                // Проект 2: Икосаэдр со случайными вершинами
                geometry = new THREE.IcosahedronGeometry(1, 1);
                material = new THREE.MeshStandardMaterial({ 
                    color: 0x7bed9f,
                    metalness: 0.7,
                    roughness: 0.2
                });
                mesh = new THREE.Mesh(geometry, material);
                break;
                
            case 2:
                // Проект 3: Узел
                geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
                material = new THREE.MeshToonMaterial({ 
                    color: 0x70a1ff,
                    gradientMap: null
                });
                mesh = new THREE.Mesh(geometry, material);
                break;
                
            default:
                // Запасной вариант: Сфера
                geometry = new THREE.SphereGeometry(1, 32, 32);
                material = new THREE.MeshNormalMaterial();
                mesh = new THREE.Mesh(geometry, material);
        }
        
        scene.add(mesh);
        projectModels.push(mesh);
        
        // Добавляем обработчики событий для интерактивности
        modelContainer.addEventListener('mousemove', (e) => {
            const rect = modelContainer.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / modelContainer.clientWidth) * 2 - 1;
            const y = -((e.clientY - rect.top) / modelContainer.clientHeight) * 2 + 1;
            
            // Модель следит за курсором
            mesh.rotation.y = x * 2;
            mesh.rotation.x = y;
        });
        
        modelContainer.addEventListener('mouseenter', () => {
            card.classList.add('active-project');
        });
        
        modelContainer.addEventListener('mouseleave', () => {
            card.classList.remove('active-project');
        });
    });
}

// Функция для создания частиц
function createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1500;
    
    // Создание массива координат для частиц
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const scales = new Float32Array(particlesCount);
    
    // Размещение частиц в пространстве
    for (let i = 0; i < particlesCount * 3; i += 3) {
        // Позиции
        positions[i] = (Math.random() - 0.5) * 2000;  // x
        positions[i + 1] = (Math.random() - 0.5) * 2000;  // y
        positions[i + 2] = (Math.random() - 0.5) * 2000;  // z
        
        // Цвета (оттенки синего)
        colors[i] = Math.random() * 0.2;  // r
        colors[i + 1] = Math.random() * 0.5;  // g
        colors[i + 2] = Math.random() * 0.8 + 0.2;  // b
        
        // Масштабы для каждой частицы (для пульсации)
        scales[i / 3] = Math.random();
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
    
    // Материал для частиц
    particlesMaterial = new THREE.PointsMaterial({
        size: 3,
        sizeAttenuation: true,
        transparent: true,
        vertexColors: true,
        opacity: 0.8
    });
    
    // Создание системы частиц
    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
}

// Инициализация параллакс-эффекта
function initParallaxEffect() {
    // Элементы, к которым будем применять параллакс-эффект
    const parallaxElements = document.querySelectorAll('.section, header');
    
    parallaxElements.forEach(element => {
        element.setAttribute('data-parallax', Math.random() * 0.2 + 0.1);
    });
    
    // Обновление положения при скролле
    updateParallaxElements();
}

// Обновление элементов с параллакс-эффектом
function updateParallaxElements() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    parallaxElements.forEach(element => {
        const speed = parseFloat(element.getAttribute('data-parallax'));
        const rect = element.getBoundingClientRect();
        const centerY = rect.top + rect.height / 2 - window.innerHeight / 2;
        
        const translateY = -centerY * speed;
        const rotateX = centerY * 0.01 * speed;
        
        element.style.transform = `translateY(${translateY}px) rotateX(${rotateX}deg)`;
        element.style.transition = 'transform 0.2s ease-out';
    });
}

// Обработчик изменения размера окна
function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    
    // Обновление основной сцены
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Обновление сцены с моделью
    if (modelRenderer && modelCamera) {
        const modelContainer = document.getElementById('model-canvas');
        if (modelContainer) {
            modelCamera.aspect = modelContainer.clientWidth / modelContainer.clientHeight;
            modelCamera.updateProjectionMatrix();
            modelRenderer.setSize(modelContainer.clientWidth, modelContainer.clientHeight);
        }
    }
    
    // Обновление сцен проектов
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        if (projectCameras[index] && projectRenderers[index]) {
            const container = card.querySelector('.project-model-container');
            if (container) {
                projectCameras[index].aspect = container.clientWidth / container.clientHeight;
                projectCameras[index].updateProjectionMatrix();
                projectRenderers[index].setSize(container.clientWidth, container.clientHeight);
            }
        }
    });
    
    // Обновление параллакс-эффекта
    updateParallaxElements();
}

// Обработчик движения мыши
function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.05;
    mouseY = (event.clientY - windowHalfY) * 0.05;
    
    // Обновление координат мыши для взаимодействия с частицами
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Обработчик клика
function onDocumentClick(event) {
    // Взаимодействие с частицами при клике
    raycaster.setFromCamera(mouse, camera);
    
    // Создаем волновой эффект от места клика
    createClickWave(event.clientX, event.clientY);
}

// Создание волнового эффекта при клике
function createClickWave(x, y) {
    // Создаем кольцевую геометрию
    const waveGeometry = new THREE.RingGeometry(0.1, 0.5, 32);
    const waveMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x64b5f6, 
        transparent: true, 
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    
    const wave = new THREE.Mesh(waveGeometry, waveMaterial);
    
    // Преобразуем координаты экрана в 3D координаты
    const vector = new THREE.Vector3();
    vector.set(
        (x / window.innerWidth) * 2 - 1,
        -(y / window.innerHeight) * 2 + 1,
        0.5
    );
    vector.unproject(camera);
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    
    wave.position.copy(pos);
    wave.lookAt(camera.position);
    scene.add(wave);
    
    // Анимация волны
    const waveAnimation = { scale: 0.1, opacity: 0.7 };
    const targetScale = 5;
    
    // Анимация с использованием requestAnimationFrame
    function animateWave() {
        waveAnimation.scale += 0.2;
        waveAnimation.opacity -= 0.02;
        
        wave.scale.set(waveAnimation.scale, waveAnimation.scale, waveAnimation.scale);
        waveMaterial.opacity = waveAnimation.opacity;
        
        if (waveAnimation.scale < targetScale && waveAnimation.opacity > 0) {
            requestAnimationFrame(animateWave);
        } else {
            scene.remove(wave);
            wave.geometry.dispose();
            waveMaterial.dispose();
        }
    }
    
    animateWave();
}

// Обработчик скролла
function onDocumentScroll(event) {
    targetScrollY += event.deltaY * 0.3;
    
    // Обновление параллакс-эффекта
    updateParallaxElements();
}

// Обработчик касания на мобильных устройствах
function onDocumentTouchMove(event) {
    if (event.touches.length > 0) {
        mouseX = (event.touches[0].clientX - windowHalfX) * 0.05;
        mouseY = (event.touches[0].clientY - windowHalfY) * 0.05;
    }
}

// Переменные для взаимодействия с моделью "Обо мне"
let modelDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let modelRotationSpeed = { x: 0, y: 0 };

// Обработчик движения мыши над моделью
function onModelMouseMove(event) {
    const container = document.getElementById('model-canvas');
    const rect = container.getBoundingClientRect();
    
    // Если модель активна для перетаскивания
    if (modelDragging) {
        const currentMousePosition = {
            x: (event.clientX - rect.left) / rect.width,
            y: (event.clientY - rect.top) / rect.height
        };
        
        // Вычисляем изменение позиции
        modelRotationSpeed.x = (currentMousePosition.y - previousMousePosition.y) * 5;
        modelRotationSpeed.y = (currentMousePosition.x - previousMousePosition.x) * 5;
        
        // Обновляем предыдущую позицию
        previousMousePosition = currentMousePosition;
    } else {
        // Легкое следование за курсором, когда не перетаскиваем
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        cube.rotation.y += (x * 0.05 - cube.rotation.y) * 0.05;
        cube.rotation.x += (y * 0.05 - cube.rotation.x) * 0.05;
    }
}

// Обработчик нажатия мыши на модели
function onModelMouseDown(event) {
    const container = document.getElementById('model-canvas');
    const rect = container.getBoundingClientRect();
    
    modelDragging = true;
    
    previousMousePosition = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height
    };
    
    // Изменяем курсор
    container.style.cursor = 'grabbing';
}

// Обработчик отпускания мыши
function onModelMouseUp(event) {
    modelDragging = false;
    
    // Восстанавливаем курсор
    const container = document.getElementById('model-canvas');
    container.style.cursor = 'grab';
}

// Анимация
function animate() {
    requestAnimationFrame(animate);
    
    // Плавное обновление скролла для параллакс-эффекта
    scrollY += (targetScrollY - scrollY) * 0.05;
    
    // Анимация основной сцены
    animateMainScene();
    
    // Анимация модели
    animateModelScene();
    
    // Анимация проектных моделей
    animateProjectModels();
}

// Анимация основной сцены
function animateMainScene() {
    // Плавное вращение частиц
    particles.rotation.x += 0.0005;
    particles.rotation.y += 0.0005;
    
    // Эффект пульсации для частиц
    const time = Date.now() * 0.001;
    const positions = particles.geometry.attributes.position.array;
    const scales = particles.geometry.attributes.scale.array;
    
    for (let i = 0; i < scales.length; i++) {
        const scale = scales[i];
        // Пульсирующий эффект для размера частиц
        particlesMaterial.size = 2.5 + Math.sin(time + scale * 10) * 0.5;
    }
    
    // Интерактивность с мышью
    camera.position.x += (mouseX - camera.position.x) * 0.02;
    camera.position.y += (-mouseY - camera.position.y) * 0.02;
    camera.lookAt(scene.position);
    
    renderer.render(scene, camera);
}

// Анимация модели
function animateModelScene() {
    if (cube && modelRenderer && modelScene && modelCamera) {
        // Применяем инерцию для вращения модели (более плавное движение)
        if (modelDragging) {
            cube.rotation.x += modelRotationSpeed.x;
            cube.rotation.y += modelRotationSpeed.y;
        } else {
            // Затухание скорости вращения
            modelRotationSpeed.x *= 0.95;
            modelRotationSpeed.y *= 0.95;
            cube.rotation.x += modelRotationSpeed.x;
            cube.rotation.y += modelRotationSpeed.y;
            
            // Добавляем небольшое автоматическое вращение
            cube.rotation.y += 0.005;
        }
        
        modelRenderer.render(modelScene, modelCamera);
    }
}

// Анимация проектных моделей
function animateProjectModels() {
    projectModels.forEach((model, index) => {
        if (model && projectRenderers[index] && projectScenes[index] && projectCameras[index]) {
            // Разные типы анимации для разных моделей
            const time = Date.now() * 0.001;
            
            switch(index) {
                case 0:
                    // Тор: деформация волны
                    const torusPositions = model.geometry.attributes.position.array;
                    const torusOriginalGeometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
                    const torusOriginalPositions = torusOriginalGeometry.attributes.position.array;
                    
                    for (let i = 0; i < torusPositions.length; i += 3) {
                        torusPositions[i] = torusOriginalPositions[i] + Math.sin(time * 2 + i * 0.1) * 0.1;
                        torusPositions[i + 1] = torusOriginalPositions[i + 1] + Math.cos(time * 2 + i * 0.05) * 0.1;
                    }
                    
                    model.geometry.attributes.position.needsUpdate = true;
                    model.rotation.x += 0.01;
                    model.rotation.y += 0.01;
                    torusOriginalGeometry.dispose();
                    break;
                    
                case 1:
                    // Икосаэдр: пульсация
                    model.scale.x = 0.9 + Math.sin(time * 2) * 0.1;
                    model.scale.y = 0.9 + Math.sin(time * 2) * 0.1;
                    model.scale.z = 0.9 + Math.sin(time * 2) * 0.1;
                    model.rotation.x += 0.01;
                    model.rotation.z += 0.01;
                    break;
                    
                case 2:
                    // Узел: вращение вокруг оси
                    model.rotation.x += 0.01;
                    model.rotation.y += 0.005;
                    model.rotation.z += 0.008;
                    break;
                    
                default:
                    // Запасной вариант: простое вращение
                    model.rotation.x += 0.01;
                    model.rotation.y += 0.01;
            }
            
            projectRenderers[index].render(projectScenes[index], projectCameras[index]);
        }
    });
}

// Старт приложения
window.onload = init; 