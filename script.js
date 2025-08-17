// Atlas - Sistema de autenticación y validaciones
class AtlasApp {
    constructor() {
        this.currentScreen = 'welcome-screen';
        this.users = this.loadUsers();
        this.currentUser = null;
        this.init();
    }

    // Inicialización de la aplicación
    init() {
        this.bindEvents();
        this.showScreen('welcome-screen');
        this.setupPasswordToggles();
        this.setupFormValidations();
        this.setupDateMask();
        this.createTestUserIfNeeded();
    }

    // Gestión de pantallas
    showScreen(screenId) {
        // Ocultar todas las pantallas
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Mostrar la pantalla solicitada
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        }
    }

    // Vinculación de eventos
    bindEvents() {
        // Botones de navegación principal
        document.getElementById('login-btn').addEventListener('click', () => {
            this.showScreen('login-screen');
        });

        document.getElementById('register-btn').addEventListener('click', () => {
            this.showScreen('register-screen');
        });

        // Botones de regreso
        document.getElementById('back-to-welcome-login').addEventListener('click', () => {
            this.showScreen('welcome-screen');
        });

        document.getElementById('back-to-welcome-register').addEventListener('click', () => {
            this.showScreen('welcome-screen');
        });

        // Enlaces de cambio entre login y registro
        document.getElementById('switch-to-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.showScreen('register-screen');
        });

        document.getElementById('switch-to-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showScreen('login-screen');
        });

        // Formularios
        document.getElementById('login-form').addEventListener('submit', (e) => {
            this.handleLogin(e);
        });

        document.getElementById('register-form').addEventListener('submit', (e) => {
            this.handleRegister(e);
        });

        // Nota: El botón de cerrar sesión ahora está en el menú desplegable

        // Navegación por pestañas
        this.setupTabs();
        
        // Funcionalidades del Feed
        this.setupFeedFunctionality();
        
        // Menú de perfil
        this.setupProfileMenu();
        
        // Configurar botón premium
        this.setupPremiumButton();
        
        // Configurar sección de donación
        this.setupDonationSection();
        
        // Configurar validación de escuela para descuento
        this.setupSchoolValidation();
        
        // Configurar sidebar
        this.setupSidebar();
        
        // Configurar sección de cursos
        this.setupCoursesSection();
        
        // Configurar sistema de creación
        this.setupCreatorSystem();
        
        // Configurar menú hamburguesa
        this.setupHamburgerMenu();
        
        // Configurar edición de perfil
        this.setupProfileEdit();
        
        // Configurar compositor de publicaciones
        this.setupPostComposer();
        
        // Arreglar imágenes de perfil en publicaciones existentes
        this.fixExistingPostAvatars();
        
        // Configurar cursos clickeables
        this.setupCourseCards();
        
        // Configurar botón de regreso en vista detallada
        this.setupBackButton();
        
        // Inicializar datos del usuario
        this.initializeUserData();
        
        // Limpiar duplicados existentes
        this.cleanupDuplicates();
        
        // Inicializar flags de guardado
        this.isSavingCourse = false;
        this.isSavingClass = false;
        this.isPublishing = false;
        
        // Actualizar estado del menú hamburguesa después de inicializar
        setTimeout(() => {
            this.updateHamburgerMenuState();
        }, 100);
        
        // Asegurar textos del dropdown después de la inicialización
        setTimeout(() => {
            this.ensureDropdownTextsVisible();
        }, 100);
    }

    // Configuración de toggles de contraseña
    setupPasswordToggles() {
        document.querySelectorAll('.toggle-password').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const targetId = toggle.getAttribute('data-target');
                const passwordInput = document.getElementById(targetId);
                const icon = toggle.querySelector('i');

                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
    }

    // Configuración de validaciones en tiempo real
    setupFormValidations() {
        // Validación de nombre de usuario en registro
        const usernameInput = document.getElementById('register-username');
        usernameInput.addEventListener('input', () => {
            this.validateUsername(usernameInput.value, 'register-username-error');
        });

        // Validación de correo electrónico
        const emailInput = document.getElementById('register-email');
        emailInput.addEventListener('input', () => {
            this.validateEmail(emailInput.value, 'register-email-error');
        });

        // Validación de fecha de nacimiento
        const birthdateInput = document.getElementById('register-birthdate');
        birthdateInput.addEventListener('input', () => {
            this.validateBirthdate(birthdateInput.value, 'register-birthdate-error');
        });

        // Validación de contraseña
        const passwordInput = document.getElementById('register-password');
        passwordInput.addEventListener('input', () => {
            this.validatePassword(passwordInput.value, 'register-password-error');
        });

        // Validación de nombres
        const nameInput = document.getElementById('register-name');
        nameInput.addEventListener('input', () => {
            this.validateName(nameInput.value, 'register-name-error');
        });

        const lastnameInput = document.getElementById('register-lastname');
        lastnameInput.addEventListener('input', () => {
            this.validateName(lastnameInput.value, 'register-lastname-error');
        });
    }

    // Configuración de máscara para fecha
    setupDateMask() {
        const birthdateInput = document.getElementById('register-birthdate');
        birthdateInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
            if (value.length >= 5) {
                value = value.substring(0, 5) + '/' + value.substring(5, 9);
            }
            
            e.target.value = value;
        });
    }

    // Validaciones específicas
    validateUsername(username, errorElementId) {
        const errorElement = document.getElementById(errorElementId);
        const formGroup = errorElement.closest('.form-group');
        
        if (username.length === 0) {
            this.showError(errorElement, formGroup, '');
            return false;
        }
        
        if (username.length > 20) {
            this.showError(errorElement, formGroup, this.getTranslation('validation.username_max_length') || 'El nombre de usuario no puede tener más de 20 caracteres');
            return false;
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            this.showError(errorElement, formGroup, this.getTranslation('validation.username_invalid_chars') || 'Solo se permiten letras, números y guiones bajos');
            return false;
        }
        
        // Verificar si el usuario ya existe (solo en registro)
        if (errorElementId.includes('register') && this.users.some(user => user.username === username)) {
            this.showError(errorElement, formGroup, this.getTranslation('validation.username_taken') || 'Este nombre de usuario ya está en uso');
            return false;
        }
        
        this.hideError(errorElement, formGroup);
        return true;
    }

    validateEmail(email, errorElementId) {
        const errorElement = document.getElementById(errorElementId);
        const formGroup = errorElement.closest('.form-group');
        
        if (email.length === 0) {
            this.showError(errorElement, formGroup, '');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError(errorElement, formGroup, 'Ingresa un correo electrónico válido');
            return false;
        }
        
        // Verificar si el email ya existe (solo en registro)
        if (errorElementId.includes('register') && this.users.some(user => user.email === email)) {
            this.showError(errorElement, formGroup, 'Este correo electrónico ya está registrado');
            return false;
        }
        
        this.hideError(errorElement, formGroup);
        return true;
    }

    validateBirthdate(birthdate, errorElementId) {
        const errorElement = document.getElementById(errorElementId);
        const formGroup = errorElement.closest('.form-group');
        
        if (birthdate.length === 0) {
            this.showError(errorElement, formGroup, '');
            return false;
        }
        
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = birthdate.match(dateRegex);
        
        if (!match) {
            this.showError(errorElement, formGroup, 'Formato de fecha inválido (DD/MM/AAAA)');
            return false;
        }
        
        const day = parseInt(match[1]);
        const month = parseInt(match[2]);
        const year = parseInt(match[3]);
        
        // Validar rangos básicos
        if (day < 1 || day > 31 || month < 1 || month > 12) {
            this.showError(errorElement, formGroup, 'Fecha inválida');
            return false;
        }
        
        // Crear objeto Date y validar
        const date = new Date(year, month - 1, day);
        if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
            this.showError(errorElement, formGroup, 'Fecha inválida');
            return false;
        }
        
        // Validar edad (debe ser mayor de 12 años y menor de 100)
        const today = new Date();
        const age = today.getFullYear() - year;
        
        if (age < 12) {
            this.showError(errorElement, formGroup, 'Debes tener al menos 12 años para registrarte');
            return false;
        }
        
        if (age > 100) {
            this.showError(errorElement, formGroup, 'Por favor, verifica la fecha de nacimiento');
            return false;
        }
        
        this.hideError(errorElement, formGroup);
        return true;
    }

    validatePassword(password, errorElementId) {
        const errorElement = document.getElementById(errorElementId);
        const formGroup = errorElement.closest('.form-group');
        
        if (password.length === 0) {
            this.showError(errorElement, formGroup, '');
            return false;
        }
        
        if (password.length < 6) {
            this.showError(errorElement, formGroup, 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        
        this.hideError(errorElement, formGroup);
        return true;
    }

    validateName(name, errorElementId) {
        const errorElement = document.getElementById(errorElementId);
        const formGroup = errorElement.closest('.form-group');
        
        if (name.length === 0) {
            this.showError(errorElement, formGroup, '');
            return false;
        }
        
        if (name.length < 2) {
            this.showError(errorElement, formGroup, 'Debe tener al menos 2 caracteres');
            return false;
        }
        
        if (!/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/.test(name)) {
            this.showError(errorElement, formGroup, 'Solo se permiten letras y espacios');
            return false;
        }
        
        this.hideError(errorElement, formGroup);
        return true;
    }

    // Helpers para mostrar/ocultar errores
    showError(errorElement, formGroup, message) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        formGroup.classList.add('invalid');
        formGroup.classList.remove('valid');
    }

    hideError(errorElement, formGroup) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
        formGroup.classList.remove('invalid');
        formGroup.classList.add('valid');
    }

    // Manejo del login
    handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        
        // Limpiar errores previos
        document.getElementById('login-username-error').textContent = '';
        document.getElementById('login-password-error').textContent = '';
        
        // Validaciones básicas
        if (!username) {
            this.showError(
                document.getElementById('login-username-error'),
                document.getElementById('login-username').closest('.form-group'),
                'Ingresa tu nombre de usuario o correo'
            );
            return;
        }
        
        if (!password) {
            this.showError(
                document.getElementById('login-password-error'),
                document.getElementById('login-password').closest('.form-group'),
                'Ingresa tu contraseña'
            );
            return;
        }
        
        // Buscar usuario
        const user = this.users.find(u => 
            u.username === username || u.email === username
        );
        
        if (!user || user.password !== password) {
            this.showNotification('Usuario o contraseña incorrectos', 'error');
            return;
        }
        
        // Login exitoso
        this.currentUser = user;
        const welcomeMsg = this.getTranslation('notifications.welcome');
        const message = welcomeMsg ? welcomeMsg.replace('{name}', user.name) : `¡Bienvenido, ${user.name}!`;
        this.showNotification(message, 'success');
        
        // Actualizar información del usuario en la interfaz
        this.updateUserInterface();
        
        setTimeout(() => {
            this.showScreen('dashboard-screen');
            // Inicializar funcionalidades que requieren el dashboard
            this.setupDarkMode();
            this.setupLanguages();
        }, 1500);
    }

    // Manejo del registro
    handleRegister(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('register-name').value.trim(),
            lastname: document.getElementById('register-lastname').value.trim(),
            username: document.getElementById('register-username').value.trim(),
            birthdate: document.getElementById('register-birthdate').value,
            email: document.getElementById('register-email').value.trim(),
            password: document.getElementById('register-password').value
        };
        
        // Validar todos los campos
        let isValid = true;
        
        isValid &= this.validateName(formData.name, 'register-name-error');
        isValid &= this.validateName(formData.lastname, 'register-lastname-error');
        isValid &= this.validateUsername(formData.username, 'register-username-error');
        isValid &= this.validateBirthdate(formData.birthdate, 'register-birthdate-error');
        isValid &= this.validateEmail(formData.email, 'register-email-error');
        isValid &= this.validatePassword(formData.password, 'register-password-error');
        
        if (!isValid) {
            this.showNotification('Por favor, corrige los errores en el formulario', 'error');
            return;
        }
        
        // Crear nuevo usuario
        const newUser = {
            id: Date.now(),
            name: formData.name,
            lastname: formData.lastname,
            username: formData.username,
            birthdate: formData.birthdate,
            email: formData.email,
            password: formData.password,
            registeredAt: new Date().toISOString()
        };
        
        this.users.push(newUser);
        this.saveUsers();
        
        this.showNotification('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión', 'success');
        
        // Limpiar formulario
        document.getElementById('register-form').reset();
        
        // Cambiar a pantalla de login después de un breve delay
        setTimeout(() => {
            this.showScreen('login-screen');
        }, 2000);
    }

    // Manejo del logout
    handleLogout() {
        this.currentUser = null;
        this.showNotification('Sesión cerrada correctamente', 'success');
        
        setTimeout(() => {
            this.showScreen('welcome-screen');
        }, 1000);
    }

    // Gestión de usuarios en localStorage
    loadUsers() {
        const users = localStorage.getItem('atlas_users');
        return users ? JSON.parse(users) : [];
    }

    saveUsers() {
        localStorage.setItem('atlas_users', JSON.stringify(this.users));
    }

    // Crear usuario de prueba si no existe
    createTestUserIfNeeded() {
        if (this.users.length === 0) {
            const testUser = {
                id: Date.now(),
                name: 'María',
                lastname: 'González',
                username: 'test',
                birthdate: '15/03/2005',
                email: 'test@atlas.com',
                password: '123456',
                registeredAt: new Date().toISOString()
            };
            
            this.users.push(testUser);
            this.saveUsers();
            
            console.log('Usuario de prueba creado:');
            console.log('Usuario: test');
            console.log('Contraseña: 123456');
        }
    }

    // Sistema de notificaciones
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new AtlasApp();
});

// Funciones adicionales para mejorar la experiencia del usuario
document.addEventListener('keydown', (e) => {
    // Cerrar notificaciones con Escape
    if (e.key === 'Escape') {
        const notification = document.getElementById('notification');
        notification.classList.remove('show');
    }
});

// Prevenir el envío de formularios con Enter en campos específicos
document.querySelectorAll('input[type="text"], input[type="email"]').forEach(input => {
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Buscar el siguiente campo o el botón de envío
            const form = input.closest('form');
            const inputs = Array.from(form.querySelectorAll('input, button[type="submit"]'));
            const currentIndex = inputs.indexOf(input);
            const nextInput = inputs[currentIndex + 1];
            
            if (nextInput) {
                nextInput.focus();
            }
        }
    });
});

// Añadir efectos de focus mejorados
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', () => {
        input.parentElement.classList.remove('focused');
    });
});

// Debugging helper (solo en desarrollo)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.atlasDebug = {
        clearUsers: () => {
            localStorage.removeItem('atlas_users');
            console.log('Usuarios eliminados del localStorage');
        },
        getUsers: () => {
            const users = localStorage.getItem('atlas_users');
            console.log('Usuarios almacenados:', users ? JSON.parse(users) : []);
        },
        addTestUser: () => {
            const users = JSON.parse(localStorage.getItem('atlas_users') || '[]');
            users.push({
                id: Date.now(),
                name: 'Usuario',
                lastname: 'Prueba',
                username: 'test',
                birthdate: '01/01/2000',
                email: 'test@atlas.com',
                password: '123456',
                registeredAt: new Date().toISOString()
            });
            localStorage.setItem('atlas_users', JSON.stringify(users));
            console.log('Usuario de prueba añadido');
        }
    };
    
    console.log('Atlas Debug disponible. Usa atlasDebug.clearUsers(), atlasDebug.getUsers(), o atlasDebug.addTestUser()');
}

// Configurar cursos clickeables
AtlasApp.prototype.setupCourseCards = function() {
    const courseCards = document.querySelectorAll('.course-card');
    
    courseCards.forEach(card => {
        card.addEventListener('click', () => {
            const courseId = card.getAttribute('data-course-id');
            if (courseId) {
                this.showCourseDetail(courseId);
            }
        });
    });
};

// Mostrar vista detallada del curso
AtlasApp.prototype.showCourseDetail = function(courseId) {
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostrar la pestaña de detalle del curso
    const courseDetailTab = document.getElementById('course-detail-tab');
    if (courseDetailTab) {
        courseDetailTab.classList.add('active');
        
        // Cambiar la pestaña activa en la navegación
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Agregar clase activa a la pestaña de contenido
        const contentTabBtn = document.querySelector('[data-tab="content"]');
        if (contentTabBtn) {
            contentTabBtn.classList.add('active');
        }
    }
    
    // Cargar datos del curso
    this.loadCourseData(courseId);
};

// Cargar datos del curso
AtlasApp.prototype.loadCourseData = function(courseId) {
    // Datos de los cursos (en un proyecto real vendrían de una API)
    const courseData = {
        'algebra-basica': {
            title: 'Álgebra Básica',
            description: 'Aprende los fundamentos del álgebra desde cero. Este curso te introducirá a los conceptos básicos como variables, ecuaciones lineales, sistemas de ecuaciones y más.',
            learning: 'Al finalizar este curso serás capaz de resolver ecuaciones lineales, trabajar con sistemas de ecuaciones, entender el concepto de variables y aplicar el álgebra en problemas del mundo real.',
            instructor: {
                name: 'Dr. Carlos Mendoza',
                bio: 'Doctor en Matemáticas con más de 15 años de experiencia docente. Especialista en álgebra y matemáticas aplicadas.',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face'
            },
            duration: '8 semanas (32 horas)',
            image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
            type: 'premium',
            classes: [
                { number: 1, title: 'Introducción al Álgebra', topic: 'Conceptos básicos y notación matemática' },
                { number: 2, title: 'Variables y Expresiones', topic: 'Trabajando con variables y expresiones algebraicas' },
                { number: 3, title: 'Ecuaciones Lineales', topic: 'Resolución de ecuaciones de primer grado' },
                { number: 4, title: 'Sistemas de Ecuaciones', topic: 'Métodos de resolución: sustitución y eliminación' },
                { number: 5, title: 'Inecuaciones', topic: 'Resolución de desigualdades lineales' },
                { number: 6, title: 'Aplicaciones Prácticas', topic: 'Problemas del mundo real usando álgebra' }
            ]
        },
        'calculo-diferencial': {
            title: 'Cálculo Diferencial',
            description: 'Explora el fascinante mundo del cálculo diferencial. Aprende sobre límites, derivadas y sus aplicaciones en física, economía y más.',
            learning: 'Comprenderás los conceptos fundamentales del cálculo, serás capaz de calcular derivadas, interpretar su significado geométrico y aplicarlas en problemas prácticos.',
            instructor: {
                name: 'Dra. Ana García',
                bio: 'Doctora en Matemáticas Aplicadas. Investigadora en análisis matemático con amplia experiencia en enseñanza del cálculo.',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face'
            },
            duration: '12 semanas (48 horas)',
            image: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400&h=300&fit=crop',
            type: 'free',
            classes: [
                { number: 1, title: 'Límites y Continuidad', topic: 'Conceptos fundamentales de límites' },
                { number: 2, title: 'Derivadas Básicas', topic: 'Reglas de derivación y técnicas fundamentales' },
                { number: 3, title: 'Regla de la Cadena', topic: 'Derivación de funciones compuestas' },
                { number: 4, title: 'Derivadas Implícitas', topic: 'Derivación de funciones definidas implícitamente' },
                { number: 5, title: 'Aplicaciones de Derivadas', topic: 'Máximos, mínimos y optimización' },
                { number: 6, title: 'Gráficas y Análisis', topic: 'Análisis de funciones usando derivadas' },
                { number: 7, title: 'Problemas de Optimización', topic: 'Aplicaciones prácticas en física y economía' },
                { number: 8, title: 'Derivadas de Orden Superior', topic: 'Segundas y terceras derivadas' }
            ]
        },
        'fisica-basica': {
            title: 'Física Básica',
            description: 'Descubre los principios fundamentales de la física. Desde la mecánica clásica hasta conceptos modernos, este curso te dará una base sólida.',
            learning: 'Entenderás las leyes fundamentales de la naturaleza, serás capaz de resolver problemas de mecánica, comprender el movimiento y aplicar la física en situaciones cotidianas.',
            instructor: {
                name: 'Prof. Luis Rodríguez',
                bio: 'Profesor de Física con más de 20 años de experiencia. Especialista en mecánica clásica y física moderna.',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face'
            },
            duration: '10 semanas (40 horas)',
            image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=300&fit=crop',
            type: 'free',
            classes: [
                { number: 1, title: 'Introducción a la Física', topic: 'Método científico y unidades de medida' },
                { number: 2, title: 'Cinemática', topic: 'Descripción del movimiento en una y dos dimensiones' },
                { number: 3, title: 'Dinámica', topic: 'Leyes de Newton y fuerzas' },
                { number: 4, title: 'Energía y Trabajo', topic: 'Conservación de la energía y trabajo mecánico' },
                { number: 5, title: 'Momentum y Colisiones', topic: 'Conservación del momentum lineal' },
                { number: 6, title: 'Gravitación', topic: 'Ley de gravitación universal' },
                { number: 7, title: 'Ondas', topic: 'Propiedades de las ondas mecánicas' },
                { number: 8, title: 'Termodinámica Básica', topic: 'Calor, temperatura y leyes de la termodinámica' }
            ]
        },
        'matematicas-avanzadas': {
            title: 'Matemáticas Avanzadas',
            description: 'Un curso avanzado que combina análisis matemático, álgebra lineal y teoría de números. Para estudiantes que quieren profundizar en matemáticas superiores.',
            learning: 'Dominarás técnicas avanzadas de análisis matemático, álgebra lineal y teoría de números. Serás capaz de abordar problemas matemáticos complejos y desarrollar pensamiento abstracto.',
            instructor: {
                name: 'Dr. Carlos Mendoza',
                bio: 'Doctor en Matemáticas Puras. Investigador en teoría de números y análisis matemático. Más de 20 años de experiencia en investigación y docencia.',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face'
            },
            duration: '16 semanas (64 horas)',
            image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400&h=300&fit=crop',
            type: 'premium',
            classes: [
                { number: 1, title: 'Análisis Real Avanzado', topic: 'Teoría de conjuntos y números reales' },
                { number: 2, title: 'Sucesiones y Series', topic: 'Convergencia y divergencia de series' },
                { number: 3, title: 'Funciones Continuas', topic: 'Continuidad uniforme y teoremas fundamentales' },
                { number: 4, title: 'Derivabilidad', topic: 'Teoremas del valor medio y aplicaciones' },
                { number: 5, title: 'Integración Avanzada', topic: 'Integrales impropias y teoremas de convergencia' },
                { number: 6, title: 'Álgebra Lineal', topic: 'Espacios vectoriales y transformaciones lineales' },
                { number: 7, title: 'Teoría de Números', topic: 'Números primos y aritmética modular' },
                { number: 8, title: 'Topología Básica', topic: 'Espacios métricos y continuidad' }
            ]
        },
        'historia-universal': {
            title: 'Historia Universal',
            description: 'Un viaje a través del tiempo que te llevará desde las primeras civilizaciones hasta la era moderna. Descubre cómo el pasado ha moldeado nuestro presente.',
            learning: 'Comprenderás los grandes procesos históricos, serás capaz de analizar eventos históricos desde múltiples perspectivas y desarrollarás pensamiento crítico sobre el pasado.',
            instructor: {
                name: 'Prof. Miguel Herrera',
                bio: 'Historiador con especialización en historia antigua y medieval. Más de 18 años de experiencia docente en universidades.',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face'
            },
            duration: '16 semanas (64 horas)',
            image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=300&fit=crop',
            type: 'free',
            classes: [
                { number: 1, title: 'Las Primeras Civilizaciones', topic: 'Mesopotamia, Egipto y el valle del Indo' },
                { number: 2, title: 'Grecia Clásica', topic: 'Democracia ateniense y filosofía griega' },
                { number: 3, title: 'Roma Antigua', topic: 'República e Imperio Romano' },
                { number: 4, title: 'Edad Media', topic: 'Feudalismo y la Iglesia medieval' },
                { number: 5, title: 'Renacimiento', topic: 'Humanismo y arte renacentista' },
                { number: 6, title: 'Revolución Industrial', topic: 'Cambios sociales y económicos' },
                { number: 7, title: 'Guerras Mundiales', topic: 'Conflictos del siglo XX' },
                { number: 8, title: 'Era Contemporánea', topic: 'Globalización y desafíos actuales' }
            ]
        },
        'historia-america-latina': {
            title: 'Historia de América Latina',
            description: 'Explora la rica historia de América Latina, desde las civilizaciones precolombinas hasta la actualidad. Descubre la diversidad cultural y los procesos históricos únicos de la región.',
            learning: 'Comprenderás la historia de América Latina desde múltiples perspectivas, serás capaz de analizar los procesos de colonización, independencia y desarrollo de la región.',
            instructor: {
                name: 'Prof. Miguel Herrera',
                bio: 'Historiador especializado en historia latinoamericana. Investigador en procesos de independencia y desarrollo económico de la región.',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face'
            },
            duration: '14 semanas (56 horas)',
            image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=300&fit=crop',
            type: 'premium',
            classes: [
                { number: 1, title: 'Civilizaciones Precolombinas', topic: 'Mayas, aztecas e incas' },
                { number: 2, title: 'Conquista Española', topic: 'Proceso de colonización y resistencia' },
                { number: 3, title: 'Período Colonial', topic: 'Sociedad colonial y economía extractiva' },
                { number: 4, title: 'Independencias', topic: 'Procesos de emancipación en el siglo XIX' },
                { number: 5, title: 'Siglo XIX', topic: 'Formación de estados nacionales' },
                { number: 6, title: 'Revolución Mexicana', topic: 'Transformaciones sociales y políticas' },
                { number: 7, title: 'Siglo XX', topic: 'Dictaduras, democracias y desarrollo' },
                { number: 8, title: 'América Latina Actual', topic: 'Desafíos y oportunidades del siglo XXI' }
            ]
        }
    };
    
    const course = courseData[courseId];
    if (course) {
        this.displayCourseDetail(course);
    }
};

// Mostrar datos del curso en la interfaz
AtlasApp.prototype.displayCourseDetail = function(course) {
    // Título y descripción
    const titleElement = document.getElementById('course-detail-title');
    const descriptionElement = document.getElementById('course-detail-description');
    if (titleElement) titleElement.textContent = course.title;
    if (descriptionElement) descriptionElement.textContent = course.description;
    
    // Aprendizaje esperado
    const learningElement = document.getElementById('course-detail-learning');
    if (learningElement) learningElement.textContent = course.learning;
    
    // Instructor
    const instructorAvatarElement = document.getElementById('course-detail-instructor-avatar');
    const instructorNameElement = document.getElementById('course-detail-instructor-name');
    const instructorBioElement = document.getElementById('course-detail-instructor-bio');
    
    if (instructorAvatarElement) instructorAvatarElement.src = course.instructor.avatar;
    if (instructorNameElement) instructorNameElement.textContent = course.instructor.name;
    if (instructorBioElement) instructorBioElement.textContent = course.instructor.bio;
    
    // Duración
    const durationElement = document.getElementById('course-detail-duration');
    if (durationElement) {
        const spanElement = durationElement.querySelector('span');
        if (spanElement) spanElement.textContent = course.duration;
    }
    
    // Imagen del curso
    const imageElement = document.getElementById('course-detail-image');
    if (imageElement) imageElement.src = course.image;
    
    // Badge del curso
    const badgeElement = document.getElementById('course-detail-badge');
    if (badgeElement) {
        badgeElement.className = `course-detail-badge ${course.type}`;
        badgeElement.textContent = course.type === 'premium' ? 'Premium' : 'Gratuito';
    }
    
    // Botón de comenzar
    const startBtnElement = document.getElementById('course-start-btn');
    if (startBtnElement) {
        startBtnElement.className = `course-start-btn ${course.type}`;
        startBtnElement.onclick = () => this.handleCourseStart(course.type);
    }
    
    // Lista de clases
    const classesElement = document.getElementById('course-detail-classes');
    if (classesElement) {
        classesElement.innerHTML = '';
        course.classes.forEach(classItem => {
            const classElement = document.createElement('div');
            classElement.className = 'class-item';
            classElement.innerHTML = `
                <div class="class-number">${classItem.number}</div>
                <div class="class-info">
                    <h4>${classItem.title}</h4>
                    <p>${classItem.topic}</p>
                </div>
            `;
            classesElement.appendChild(classElement);
        });
    }
};

// Manejar clic en botón de comenzar curso
AtlasApp.prototype.handleCourseStart = function(courseType) {
    if (courseType === 'premium') {
        alert('¡Este curso requiere una suscripción Premium! 🎓\n\nPara acceder a este contenido exclusivo, necesitas actualizar tu cuenta a Premium.\n\nPrecios Premium (IVA incluido):\n• Mensual: $99.00 MXN (Base: $85.34 + IVA: $13.66)\n• Anual: $1,009.75 MXN (Base: $870.47 + IVA: $139.28) - Ahorra 15%\n\nBeneficios Premium:\n• Acceso a todos los cursos\n• Certificados de finalización\n• Soporte prioritario\n• Contenido exclusivo');
    } else {
        alert('¡Perfecto! 🚀\n\nHas comenzado el curso gratuito.\n\nPróximamente podrás:\n• Acceder a las clases\n• Completar ejercicios\n• Obtener tu certificado\n• Interactuar con otros estudiantes');
    }
};

// Configurar botón de regreso
AtlasApp.prototype.setupBackButton = function() {
    const backBtn = document.getElementById('back-to-courses');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            // Ocultar vista detallada
            document.getElementById('course-detail-tab').classList.remove('active');
            // Mostrar vista de cursos
            document.getElementById('content-tab').classList.add('active');
            
            // Actualizar pestaña activa
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const contentTabBtn = document.querySelector('[data-tab="content"]');
            if (contentTabBtn) {
                contentTabBtn.classList.add('active');
            }
        });
    }
};

// Añadir métodos para las nuevas funcionalidades al prototipo de AtlasApp
AtlasApp.prototype.setupTabs = function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remover clase active de todos los botones y contenidos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activar el botón y contenido seleccionado
            button.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
};

AtlasApp.prototype.setupFeedFunctionality = function() {
    // Configurar botones de reacción
    document.querySelectorAll('.reaction-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleReaction(btn);
        });
    });

    // Configurar botones de comentarios
    document.querySelectorAll('.comment-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleComments(btn);
        });
    });



    // Configurar envío de comentarios
    document.querySelectorAll('.send-comment-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            this.sendComment(btn);
        });
    });

    // Configurar inputs de comentarios (Enter para enviar)
    document.querySelectorAll('.comment-input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const sendBtn = input.parentElement.querySelector('.send-comment-btn');
                this.sendComment(sendBtn);
            }
        });
    });


};

AtlasApp.prototype.handleReaction = function(button) {
    const isActive = button.classList.contains('active');
    
    if (isActive) {
        button.classList.remove('active');
        this.showNotification('Reacción eliminada', 'success');
    } else {
        button.classList.add('active');
        this.showNotification('¡Te gusta esta publicación!', 'success');
    }

    // Aquí podrías enviar la reacción al servidor
    // this.sendReactionToServer(postId, reactionType, isActive);
};

AtlasApp.prototype.toggleComments = function(button) {
    const postCard = button.closest('.post-card');
    const commentsSection = postCard.querySelector('.comments-section');
    
    if (commentsSection.style.display === 'none' || !commentsSection.style.display) {
        commentsSection.style.display = 'block';
        commentsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Enfocar el input de comentario
        const commentInput = commentsSection.querySelector('.comment-input');
        setTimeout(() => commentInput.focus(), 300);
    } else {
        commentsSection.style.display = 'none';
    }
};

AtlasApp.prototype.sendComment = function(button) {
    const commentsSection = button.closest('.comments-section');
    const input = commentsSection.querySelector('.comment-input');
    const commentText = input.value.trim();
    
    if (!commentText) {
        this.showNotification('Escribe un comentario antes de enviar', 'warning');
        return;
    }

    // Crear el nuevo comentario
    const newComment = document.createElement('div');
    newComment.className = 'comment';
    newComment.innerHTML = `
        <div class="comment-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="comment-content">
            <strong>${this.currentUser ? this.currentUser.name : 'Usuario'}</strong>
            <p>${commentText}</p>
            <span class="comment-time">Ahora</span>
        </div>
    `;

    // Insertar antes del input de agregar comentario
    const addCommentDiv = commentsSection.querySelector('.add-comment');
    commentsSection.insertBefore(newComment, addCommentDiv);

    // Limpiar el input
    input.value = '';
    
    // Mostrar animación de entrada
    newComment.style.opacity = '0';
    newComment.style.transform = 'translateY(20px)';
    setTimeout(() => {
        newComment.style.transition = 'all 0.3s ease-in-out';
        newComment.style.opacity = '1';
        newComment.style.transform = 'translateY(0)';
    }, 10);

    this.showNotification('Comentario enviado', 'success');
    
    // Aquí podrías enviar el comentario al servidor
    // this.sendCommentToServer(postId, commentText);
};









// Configuración del menú de perfil
AtlasApp.prototype.setupProfileMenu = function() {
    const profileTrigger = document.getElementById('profile-trigger');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const profileDropdown = document.getElementById('profile-dropdown');

    // Toggle del menú
    profileTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleProfileMenu();
        
        // Ajustar posición del dropdown en móviles después de abrirlo
        setTimeout(() => {
            if (dropdownMenu.classList.contains('show')) {
                this.adjustDropdownPosition(dropdownMenu, profileTrigger);
            }
        }, 10);
    });
    
    // Ajustar posición al redimensionar ventana
    window.addEventListener('resize', () => {
        if (dropdownMenu && dropdownMenu.classList.contains('show')) {
            this.adjustDropdownPosition(dropdownMenu, profileTrigger);
        }
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!profileDropdown.contains(e.target)) {
            this.closeProfileMenu();
        }
    });

    // Opciones del menú
    document.getElementById('profile-option').addEventListener('click', () => {
        this.showProfilePage();
        this.closeProfileMenu();
    });

    document.getElementById('achievements-option').addEventListener('click', () => {
        this.showAchievementsPage();
        this.closeProfileMenu();
    });

    document.getElementById('progress-option').addEventListener('click', () => {
        console.log('🔄 Botón de avances clickeado');
        this.showProgressPage();
        this.closeProfileMenu();
    });

    document.getElementById('logout-option').addEventListener('click', () => {
        this.handleLogout();
        this.closeProfileMenu();
    });
};

AtlasApp.prototype.adjustDropdownPosition = function(dropdownMenu, trigger) {
    // Solo ajustar en pantallas móviles y tablets
    if (window.innerWidth <= 1080) {
        const rect = trigger.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const margin = 16; // Margen de seguridad
        
        // Resetear estilos previos
        dropdownMenu.style.transform = '';
        dropdownMenu.style.left = '';
        dropdownMenu.style.right = '';
        dropdownMenu.style.top = '';
        dropdownMenu.style.bottom = '';
        dropdownMenu.style.marginTop = '';
        dropdownMenu.style.marginBottom = '';
        
        // Obtener dimensiones del dropdown en su posición natural
        const dropdownRect = dropdownMenu.getBoundingClientRect();
        const dropdownWidth = dropdownRect.width;
        
        // Calcular posición ideal alineada al borde derecho de la pantalla
        const idealRight = margin; // Distancia desde el borde derecho de la pantalla
        
        // Verificar si el dropdown se sale por la derecha
        if (dropdownRect.right > viewportWidth - margin) {
            // Usar position fixed para alinearlo al borde derecho de la pantalla
            dropdownMenu.style.position = 'fixed';
            dropdownMenu.style.right = `${idealRight}px`;
            dropdownMenu.style.left = 'auto';
            dropdownMenu.style.top = `${rect.bottom + 8}px`; // 8px de margen desde el trigger
            dropdownMenu.style.transform = '';
            dropdownMenu.style.zIndex = '1002'; // Z-index más alto para position fixed
            
            // Ajustar ancho si es necesario
            if (dropdownWidth > viewportWidth - (margin * 2)) {
                dropdownMenu.style.width = `${viewportWidth - (margin * 2)}px`;
                dropdownMenu.style.left = `${margin}px`;
            }
        } else {
            // Mantener posición absoluta normal
            dropdownMenu.style.position = 'absolute';
            dropdownMenu.style.right = '0';
            dropdownMenu.style.left = 'auto';
            dropdownMenu.style.top = '100%';
            dropdownMenu.style.zIndex = '1001'; // Z-index normal
        }
        
        // Verificar posición vertical después del ajuste horizontal
        const finalDropdownRect = dropdownMenu.getBoundingClientRect();
        
        if (rect.bottom + finalDropdownRect.height > viewportHeight - margin) {
            // Mostrar arriba del trigger
            if (dropdownMenu.style.position === 'fixed') {
                dropdownMenu.style.top = `${rect.top - finalDropdownRect.height - 8}px`;
                dropdownMenu.style.bottom = 'auto';
            } else {
                dropdownMenu.style.top = 'auto';
                dropdownMenu.style.bottom = '100%';
                dropdownMenu.style.marginBottom = '0.5rem';
                dropdownMenu.style.marginTop = '';
            }
        } else {
            // Posición normal (abajo)
            if (dropdownMenu.style.position === 'fixed') {
                dropdownMenu.style.top = `${rect.bottom + 8}px`;
                dropdownMenu.style.bottom = 'auto';
            } else {
                dropdownMenu.style.top = '100%';
                dropdownMenu.style.bottom = 'auto';
                dropdownMenu.style.marginTop = '0.5rem';
                dropdownMenu.style.marginBottom = '';
            }
        }
    }
};

AtlasApp.prototype.toggleProfileMenu = function() {
    const dropdownMenu = document.getElementById('dropdown-menu');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    if (dropdownMenu.classList.contains('show')) {
        this.closeProfileMenu();
    } else {
        this.openProfileMenu();
    }
};

AtlasApp.prototype.openProfileMenu = function() {
    const dropdownMenu = document.getElementById('dropdown-menu');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    dropdownMenu.classList.add('show');
    profileDropdown.classList.add('open');
    
    // Asegurar que los textos sean visibles cuando se abra
    setTimeout(() => {
        this.ensureDropdownTextsVisible();
    }, 50);
};

AtlasApp.prototype.closeProfileMenu = function() {
    const dropdownMenu = document.getElementById('dropdown-menu');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    dropdownMenu.classList.remove('show');
    profileDropdown.classList.remove('open');
    
    // Resetear posición personalizada al cerrar
    this.resetDropdownPosition(dropdownMenu);
};

AtlasApp.prototype.resetDropdownPosition = function(dropdownMenu) {
    // Resetear todos los estilos personalizados
    dropdownMenu.style.position = '';
    dropdownMenu.style.transform = '';
    dropdownMenu.style.left = '';
    dropdownMenu.style.right = '';
    dropdownMenu.style.top = '';
    dropdownMenu.style.bottom = '';
    dropdownMenu.style.width = '';
    dropdownMenu.style.marginTop = '';
    dropdownMenu.style.marginBottom = '';
    dropdownMenu.style.zIndex = ''; // Resetear z-index también
};

AtlasApp.prototype.showProfilePage = function() {
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostrar página de perfil
    document.getElementById('profile-page').classList.add('active');
    
    // Desactivar pestañas de navegación
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
};

AtlasApp.prototype.showAchievementsPage = function() {
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostrar página de logros
    document.getElementById('achievements-page').classList.add('active');
    
    // Desactivar pestañas de navegación
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
};

AtlasApp.prototype.showProgressPage = function() {
    console.log('🔄 showProgressPage llamada');
    
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostrar página de avances
    const progressPage = document.getElementById('progress-page');
    if (progressPage) {
        progressPage.classList.add('active');
        console.log('✅ Página de avances activada');
    } else {
        console.error('❌ No se encontró la página de avances');
    }
    
    // Desactivar pestañas de navegación
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Inicializar página de avances avanzada
    console.log('🚀 Inicializando página de avances avanzada...');
    this.initializeAdvancedProgress();
};

// Inicializar página de avances avanzada
AtlasApp.prototype.initializeAdvancedProgress = function() {
    console.log('🚀 Inicializando página de avances avanzada...');
    
    // Cargar datos de progreso del usuario
    this.loadUserProgressData();
    
    // Configurar gráficos
    this.setupProgressCharts();
    
    // Configurar análisis de IA
    this.setupAIAnalysis();
    
    // Configurar eventos de la página
    this.setupProgressPageEvents();
    
    console.log('✅ Página de avances avanzada inicializada');
};

// Configuración del modo oscuro
AtlasApp.prototype.setupDarkMode = function() {
    // Verificar si estamos en el dashboard
    if (this.currentScreen !== 'dashboard-screen') {
        console.log('No estamos en el dashboard, saltando configuración del modo oscuro');
        return;
    }
    
    const darkModeToggle = document.getElementById('dark-mode-checkbox');
    const darkModeIcon = document.querySelector('#dark-mode-toggle i');
    
    console.log('Setup Dark Mode - Toggle:', darkModeToggle);
    console.log('Setup Dark Mode - Icon:', darkModeIcon);
    
    if (!darkModeToggle) {
        console.error('No se encontró el toggle del modo oscuro');
        // Intentar de nuevo en 1 segundo
        setTimeout(() => {
            this.setupDarkMode();
        }, 1000);
        return;
    }
    
    // Cargar preferencia guardada
    const savedTheme = localStorage.getItem('atlas_theme') || 'light';
    console.log('Tema guardado:', savedTheme);
    this.setTheme(savedTheme);
    darkModeToggle.checked = savedTheme === 'dark';
    
    // Toggle del modo oscuro
    darkModeToggle.addEventListener('change', () => {
        const newTheme = darkModeToggle.checked ? 'dark' : 'light';
        console.log('Cambiando tema a:', newTheme);
        this.setTheme(newTheme);
        this.showNotification(
            newTheme === 'dark' ? 'Modo oscuro activado' : 'Modo claro activado',
            'success'
        );
    });
};

AtlasApp.prototype.setTheme = function(theme) {
    console.log('SetTheme llamado con:', theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('atlas_theme', theme);
    console.log('Atributo data-theme establecido:', document.documentElement.getAttribute('data-theme'));
    
    // Actualizar icono
    const darkModeIcon = document.querySelector('#dark-mode-toggle i');
    if (darkModeIcon) {
        if (theme === 'dark') {
            darkModeIcon.classList.remove('fa-moon');
            darkModeIcon.classList.add('fa-sun');
        } else {
            darkModeIcon.classList.remove('fa-sun');
            darkModeIcon.classList.add('fa-moon');
        }
        console.log('Icono actualizado:', darkModeIcon.className);
    } else {
        console.error('No se encontró el icono del modo oscuro');
    }
};

// Configuración de idiomas
AtlasApp.prototype.setupLanguages = function() {
    const languageSelect = document.getElementById('language-select');
    
    if (!languageSelect) {
        console.error('Language select not found');
        return;
    }
    
    // Cargar idioma guardado
    const savedLanguage = localStorage.getItem('atlas_language') || 'es';
    languageSelect.value = savedLanguage;
    this.currentLanguage = savedLanguage;
    
    // Cargar traducciones del idioma actual
    this.loadTranslations(savedLanguage);
    
    // Cambio de idioma
    languageSelect.addEventListener('change', () => {
        const newLanguage = languageSelect.value;
        this.setLanguage(newLanguage);
    });
};

AtlasApp.prototype.setLanguage = function(language) {
    localStorage.setItem('atlas_language', language);
    this.currentLanguage = language;
    this.loadTranslations(language);
};

AtlasApp.prototype.loadTranslations = async function(language) {
    try {
        const response = await fetch(`translations/${language}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load ${language} translations`);
        }
        
        this.translations = await response.json();
        this.updateTexts();
        
        // Mostrar notificación de cambio de idioma
        if (this.translations.notifications && this.translations.notifications.language_changed) {
            this.showNotification(this.translations.notifications.language_changed, 'success');
        }
        
        console.log(`Traducciones cargadas para: ${language}`);
    } catch (error) {
        console.error('Error loading translations:', error);
        // Fallback a español si hay error
        if (language !== 'es') {
            this.loadTranslations('es');
        }
    }
};

AtlasApp.prototype.updateTexts = function() {
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        const translation = this.getTranslation(key);
        if (translation) {
            element.textContent = translation;
        }
    });
    
    // Actualizar placeholders
    this.updatePlaceholders();
};

AtlasApp.prototype.getTranslation = function(key) {
    if (!this.translations) return null;
    
    const keys = key.split('.');
    let value = this.translations;
    
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return null;
        }
    }
    
    return typeof value === 'string' ? value : null;
};

AtlasApp.prototype.updatePlaceholders = function() {
    // Actualizar placeholder del input de fecha de nacimiento
    const birthdateInput = document.getElementById('register-birthdate');
    if (birthdateInput && this.translations.auth) {
        const format = this.getTranslation('auth.birthdate_format');
        if (format) {
            birthdateInput.placeholder = format.replace('Formato: ', '').replace('Format: ', '').replace('Format : ', '');
        }
    }
    
    // Actualizar placeholder del input de comentario
    const commentInputs = document.querySelectorAll('.comment-input');
    commentInputs.forEach(input => {
        const placeholder = this.getTranslation('feed.comment_placeholder');
        if (placeholder) {
            input.placeholder = placeholder;
        }
    });
    
    // Actualizar placeholder del botón de crear publicación
    const createPostBtn = document.getElementById('open-create-post');
    if (createPostBtn) {
        const placeholder = this.getTranslation('feed.create_post_placeholder');
        if (placeholder) {
            createPostBtn.textContent = placeholder;
        }
    }
};

// Las traducciones ahora se cargan desde archivos JSON

// Inicializar datos del usuario
AtlasApp.prototype.initializeUserData = function() {
    if (this.currentUser) {
        this.updateUserInterface();
        // Si ya hay un usuario logueado, inicializar funcionalidades del dashboard
        this.setupDarkMode();
        this.setupLanguages();
    }
};

AtlasApp.prototype.updateUserInterface = function() {
    const user = this.currentUser;
    const profileData = JSON.parse(localStorage.getItem('profile_data') || '{}');
    
    // Usar datos del perfil si existen, sino usar datos de login
    const displayData = {
        name: profileData.name || (user ? `${user.name} ${user.lastname || ''}`.trim() : 'Usuario'),
        email: profileData.email || (user ? user.email : 'usuario@atlas.com'),
        photo: profileData.photo || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
        coverPhoto: profileData.coverPhoto || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=200&fit=crop',
        career: profileData.career || 'Carrera no especificada',
        educationLevel: profileData.educationLevel || 'high_school',
        bio: profileData.bio || 'Sin biografía disponible.',
        interests: profileData.interests || ['Física', 'Química', 'Matemáticas', 'Ciencias Ambientales', 'Tecnología']
    };
    
    // Actualizar información en el menú desplegable
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const dropdownName = document.getElementById('dropdown-name');
    const dropdownEmail = document.getElementById('dropdown-email');
    
    if (profileName) profileName.textContent = displayData.name;
    if (profileEmail) profileEmail.textContent = displayData.email;
    if (dropdownName) dropdownName.textContent = displayData.name;
    if (dropdownEmail) dropdownEmail.textContent = displayData.email;
    
    // Actualizar información en la página de perfil
    const profileDisplayName = document.getElementById('profile-display-name');
    const profileEmailDisplay = document.getElementById('profile-email-display');
    const profileCareer = document.getElementById('profile-career');
    const profileBio = document.getElementById('profile-bio');
    const subjectsTags = document.getElementById('subjects-tags');
    
    if (profileDisplayName) profileDisplayName.textContent = displayData.name;
    if (profileEmailDisplay) profileEmailDisplay.textContent = displayData.email;
    if (profileCareer) profileCareer.textContent = displayData.career;
    if (profileBio) {
        profileBio.innerHTML = `<p>${displayData.bio}</p>`;
    }
    
    // Actualizar nivel educativo
    const educationInfo = document.querySelector('.education-info');
    if (educationInfo) {
        const levelText = this.getEducationLevelText(displayData.educationLevel);
        educationInfo.innerHTML = `<p><strong>${levelText}</strong></p>`;
    }
    
    // Actualizar temas de interés
    if (subjectsTags) {
        subjectsTags.innerHTML = '';
        displayData.interests.forEach(interest => {
            const tag = document.createElement('span');
            tag.className = 'subject-tag';
            tag.textContent = interest;
            subjectsTags.appendChild(tag);
        });
    }
    
    // Actualizar todas las fotos de perfil
    const profileImages = [
        document.getElementById('user-profile-image'),
        document.querySelector('.dropdown-avatar img'),
        document.querySelector('.sidebar-user-avatar img'),
        document.querySelector('.profile-cover .profile-avatar img')
    ];
    
    profileImages.forEach(img => {
        if (img) img.src = displayData.photo;
    });
    
    // Actualizar foto de portada
    const coverImage = document.getElementById('cover-image');
    if (coverImage) {
        coverImage.src = displayData.coverPhoto;
    }
    
    // Actualizar información del usuario en la sidebar
    this.updateSidebarUserInfo();
    
    // Asegurar que los textos del dropdown sean visibles
    this.ensureDropdownTextsVisible();
};

AtlasApp.prototype.ensureDropdownTextsVisible = function() {
    console.log('🔍 Verificando visibilidad de textos del dropdown...');
    
    // Asegurar que todos los textos del dropdown sean visibles con contenido de respaldo
    const dropdownTexts = {
        'profile-option': 'Perfil',
        'achievements-option': 'Logros',
        'dark-mode-toggle': 'Modo oscuro',
        'logout-option': 'Cerrar sesión'
    };
    
    Object.keys(dropdownTexts).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const span = element.querySelector('span');
            console.log(`📝 Elemento ${id}:`, element, 'Span:', span, 'Texto actual:', span?.textContent);
            
            if (span) {
                // Siempre forzar el texto y estilos
                span.textContent = dropdownTexts[id];
                span.style.display = 'inline';
                span.style.visibility = 'visible';
                span.style.opacity = '1';
                span.style.color = id === 'logout-option' ? '#ef4444' : '#1e293b';
                span.style.fontSize = '0.9rem';
                span.style.fontWeight = '500';
                
                console.log(`✅ Texto actualizado para ${id}: "${span.textContent}"`);
            }
        } else {
            console.log(`❌ No se encontró elemento: ${id}`);
        }
    });
    
    // Asegurar texto del selector de idioma
    const languageSelector = document.querySelector('.language-selector span');
    if (languageSelector) {
        languageSelector.textContent = 'Idioma';
        languageSelector.style.display = 'inline';
        languageSelector.style.visibility = 'visible';
        languageSelector.style.opacity = '1';
        languageSelector.style.color = '#1e293b';
        console.log('✅ Texto de idioma actualizado');
    }
    
    console.log('🎯 Verificación de textos completada');
};

// El método handleLogin ya incluye la actualización de la interfaz

// Configuración de la sección de cursos
AtlasApp.prototype.setupCoursesSection = function() {
    console.log('🎓 Configurando sección de cursos...');
    
    // Configurar búsqueda de cursos
    const searchInput = document.getElementById('course-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            this.filterCourses(e.target.value.toLowerCase());
        });
    }
    
    // Configurar todos los filtros (nivel y tipo) con la misma lógica
    this.setupAllFilters();
    
    // Configurar funcionalidad de rutas de aprendizaje
    this.setupLearningPaths();
    
    // Los clicks en tarjetas de curso se configuran en setupCourseCards()
    // No necesitamos duplicar la funcionalidad aquí
    
    console.log('✅ Sección de cursos configurada correctamente');
};

// Configuración de rutas de aprendizaje
AtlasApp.prototype.setupLearningPaths = function() {
    console.log('🛤️ Configurando rutas de aprendizaje...');
    
    // Configurar enlace para mostrar rutas de aprendizaje
    const showLearningPathsLink = document.getElementById('show-learning-paths');
    if (showLearningPathsLink) {
        showLearningPathsLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleLearningPaths();
        });
    }
    
    // Configurar botones de toggle para cada ruta
    const toggleButtons = document.querySelectorAll('.path-toggle-btn');
    toggleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const pathId = button.dataset.path;
            this.togglePathCourses(pathId);
        });
    });
    
    // Configurar botones de comenzar ruta (por ahora sin funcionalidad)
    const startPathButtons = document.querySelectorAll('.path-start-btn');
    startPathButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const pathId = button.dataset.path;
            this.startLearningPath(pathId);
        });
    });
    
    console.log('✅ Rutas de aprendizaje configuradas correctamente');
};

// Mostrar/ocultar interfaz de rutas de aprendizaje
AtlasApp.prototype.toggleLearningPaths = function() {
    const learningPathsContainer = document.getElementById('learning-paths-container');
    const coursesCategories = document.querySelector('.courses-categories');
    
    if (learningPathsContainer && coursesCategories) {
        if (learningPathsContainer.style.display === 'none') {
            // Mostrar rutas de aprendizaje
            learningPathsContainer.style.display = 'block';
            coursesCategories.style.display = 'none';
            console.log('🛤️ Mostrando rutas de aprendizaje');
        } else {
            // Mostrar categorías de cursos
            learningPathsContainer.style.display = 'none';
            coursesCategories.style.display = 'block';
            console.log('📚 Mostrando categorías de cursos');
        }
    }
};

// Mostrar/ocultar cursos de una ruta específica
AtlasApp.prototype.togglePathCourses = function(pathId) {
    const coursesContainer = document.getElementById(`${pathId}-courses`);
    const toggleButton = document.querySelector(`[data-path="${pathId}"]`);
    
    if (coursesContainer && toggleButton) {
        const isVisible = coursesContainer.style.display !== 'none';
        
        if (isVisible) {
            // Ocultar cursos
            coursesContainer.style.display = 'none';
            toggleButton.innerHTML = '<i class="fas fa-chevron-down"></i><span data-translate="courses.paths.view_courses">Ver cursos</span>';
            console.log(`🛤️ Ocultando cursos de la ruta: ${pathId}`);
        } else {
            // Mostrar cursos
            coursesContainer.style.display = 'block';
            toggleButton.innerHTML = '<i class="fas fa-chevron-up"></i><span data-translate="courses.paths.view_courses">Ocultar cursos</span>';
            console.log(`🛤️ Mostrando cursos de la ruta: ${pathId}`);
        }
    }
};

// Función para comenzar una ruta de aprendizaje (por ahora sin funcionalidad)
AtlasApp.prototype.startLearningPath = function(pathId) {
    console.log(`🚀 Iniciando ruta de aprendizaje: ${pathId}`);
    this.showNotification('Función de comenzar ruta estará disponible próximamente', 'info');
};

AtlasApp.prototype.filterCourses = function(searchTerm) {
    const courseCards = document.querySelectorAll('.course-card');
    let visibleCount = 0;
    
    courseCards.forEach(card => {
        const title = card.querySelector('.course-title').textContent.toLowerCase();
        const instructor = card.querySelector('.instructor-name').textContent.toLowerCase();
        const categorySection = card.closest('.category-section');
        const categoryName = categorySection.querySelector('.category-header h2').textContent.toLowerCase();
        
        const matches = title.includes(searchTerm) || 
                       instructor.includes(searchTerm) || 
                       categoryName.includes(searchTerm);
        
        if (matches) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Ocultar categorías vacías
    const categorySection = document.querySelectorAll('.category-section');
    categorySection.forEach(section => {
        const visibleCourses = section.querySelectorAll('.course-card[style*="display: block"], .course-card:not([style*="display: none"])');
        if (visibleCourses.length === 0 && searchTerm !== '') {
            section.style.display = 'none';
        } else {
            section.style.display = 'block';
        }
    });
    
    console.log(`🔍 Búsqueda "${searchTerm}": ${visibleCount} cursos encontrados`);
};

AtlasApp.prototype.filterCoursesByLevel = function(level) {
    const courseCards = document.querySelectorAll('.course-card');
    let visibleCount = 0;
    
    courseCards.forEach(card => {
        const cardLevel = card.dataset.level;
        
        if (level === 'all' || cardLevel === level) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Mostrar/ocultar categorías según filtro
    const categorySection = document.querySelectorAll('.category-section');
    categorySection.forEach(section => {
        const visibleCourses = section.querySelectorAll('.course-card[style*="display: block"], .course-card:not([style*="display: none"])');
        if (visibleCourses.length === 0 && level !== 'all') {
            section.style.display = 'none';
        } else {
            section.style.display = 'block';
        }
    });
    
    const levelText = level === 'all' ? 'todos los niveles' : `nivel ${level}`;
    console.log(`📊 Filtro aplicado (${levelText}): ${visibleCount} cursos visibles`);
};

AtlasApp.prototype.setupAllFilters = function() {
    const filterContainer = document.querySelector('.filter-buttons');
    if (!filterContainer) return;
    
    // Verificar si los filtros adicionales ya existen para evitar duplicados
    if (filterContainer.querySelector('[data-filter="free"]')) {
        console.log('🔍 Filtros adicionales ya existen, solo configurando eventos');
        this.attachFilterEvents();
        return;
    }
    
    // Crear botones adicionales para tipo de curso
    const freeBtn = document.createElement('button');
    freeBtn.className = 'filter-btn';
    freeBtn.dataset.filter = 'free';
    freeBtn.innerHTML = '<i class="fas fa-heart"></i> Gratis';
    
    const premiumBtn = document.createElement('button');
    premiumBtn.className = 'filter-btn';
    premiumBtn.dataset.filter = 'premium';
    premiumBtn.innerHTML = '<i class="fas fa-crown"></i> Premium';
    
    const atlasBtn = document.createElement('button');
    atlasBtn.className = 'filter-btn';
    atlasBtn.dataset.filter = 'atlas';
    atlasBtn.innerHTML = '<i class="fas fa-graduation-cap"></i> Atlas';
    
    // Agregar al DOM
    filterContainer.appendChild(freeBtn);
    filterContainer.appendChild(premiumBtn);
    filterContainer.appendChild(atlasBtn);
    
    // Configurar eventos para todos los filtros
    this.attachFilterEvents();
    
    console.log('✅ Sistema de filtros unificado configurado');
};

AtlasApp.prototype.attachFilterEvents = function() {
    // Configurar eventos para TODOS los filtros (originales + nuevos)
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        // Remover listeners previos para evitar duplicados
        btn.replaceWith(btn.cloneNode(true));
    });
    
    // Volver a obtener los botones después del clonado
    const newFilterButtons = document.querySelectorAll('.filter-btn');
    newFilterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remover clase active de todos los botones
            newFilterButtons.forEach(b => b.classList.remove('active'));
            // Agregar clase active al botón clickeado
            e.target.classList.add('active');
            
            const filter = e.target.dataset.filter;
            console.log(`🎯 Filtro seleccionado: ${filter}`);
            
            // Usar la función unificada para todos los filtros
            this.applyFilter(filter);
        });
    });
};

AtlasApp.prototype.applyFilter = function(filter) {
    console.log(`🔍 Aplicando filtro: ${filter}`);
    const courseCards = document.querySelectorAll('.course-card');
    let visibleCount = 0;
    
    courseCards.forEach(card => {
        let shouldShow = false;
        
        // Obtener información del curso
        const courseLevel = card.dataset.level;
        const isAtlas = card.classList.contains('atlas-course');
        const isPremium = card.classList.contains('premium-course');
        const hasPremiumBadge = card.querySelector('.premium-badge') !== null;
        
        const courseTitle = card.querySelector('.course-title')?.textContent || 'Sin título';
        
        // Lógica unificada para todos los filtros
        switch(filter) {
            // Filtros por nivel (originales)
            case 'all':
                shouldShow = true;
                break;
            case 'basic':
                shouldShow = courseLevel === 'basic';
                break;
            case 'intermediate':
                shouldShow = courseLevel === 'intermediate';
                break;
            case 'advanced':
                shouldShow = courseLevel === 'advanced';
                break;
            
            // Filtros por tipo (nuevos)
            case 'free':
                // Cursos gratis = todos los que NO tienen badge premium
                shouldShow = !hasPremiumBadge && !isPremium;
                break;
            case 'premium':
                // Cursos premium = los que tienen badge premium
                shouldShow = hasPremiumBadge || isPremium;
                break;
            case 'atlas':
                // Cursos Atlas = solo los que tienen la clase atlas-course
                shouldShow = isAtlas;
                break;
            
            default:
                shouldShow = true;
                break;
        }
        
        if (shouldShow) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Mostrar/ocultar categorías según cursos visibles
    const categorySection = document.querySelectorAll('.category-section');
    categorySection.forEach(section => {
        const visibleCourses = section.querySelectorAll('.course-card:not([style*="display: none"])');
        if (visibleCourses.length === 0 && filter !== 'all') {
            section.style.display = 'none';
        } else {
            section.style.display = 'block';
        }
    });
    
    // Mensaje de resultado
    const filterMessages = {
        'all': 'todos los cursos',
        'basic': 'cursos básicos',
        'intermediate': 'cursos intermedios',
        'advanced': 'cursos avanzados',
        'free': 'cursos gratuitos',
        'premium': 'cursos premium',
        'atlas': 'cursos Atlas'
    };
    
    const message = filterMessages[filter] || `filtro ${filter}`;
    console.log(`🎯 Filtro aplicado (${message}): ${visibleCount} cursos visibles`);
};

// Mantener funciones originales para compatibilidad
AtlasApp.prototype.filterCoursesByLevel = function(level) {
    // Redirigir a la función unificada
    this.applyFilter(level);
};

AtlasApp.prototype.filterCoursesByType = function(type) {
    // Redirigir a la función unificada
    this.applyFilter(type);
};



// Configuración del menú hamburguesa
AtlasApp.prototype.setupHamburgerMenu = function() {
    console.log('🍔 Configurando menú hamburguesa...');
    
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const hamburgerContainer = document.getElementById('hamburger-menu-container');
    const hamburgerDropdown = document.getElementById('hamburger-dropdown');
    const verificationOption = document.getElementById('verification-option');
    
    if (!hamburgerBtn || !hamburgerContainer || !hamburgerDropdown) return;
    
    // Toggle dropdown hamburguesa
    hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburgerContainer.classList.toggle('open');
    });
    
    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!hamburgerContainer.contains(e.target)) {
            hamburgerContainer.classList.remove('open');
        }
    });
    
    // Opción de verificación
    if (verificationOption) {
        verificationOption.addEventListener('click', () => {
            console.log('🎓 Accediendo a verificación desde hamburguesa');
            hamburgerContainer.classList.remove('open');
            
            // Resetear formulario si se está rehaciendo la verificación
            const isVerified = localStorage.getItem('instructor_verified') === 'true';
            if (isVerified) {
                this.resetVerificationForm();
            }
            
            this.showScreen('instructor-verification-screen');
        });
    }
    
    // Actualizar estado inicial
    this.updateHamburgerMenuState();
    
    console.log('✅ Menú hamburguesa configurado');
};

AtlasApp.prototype.updateHamburgerMenuState = function() {
    const verificationText = document.getElementById('verification-text');
    const isVerified = localStorage.getItem('instructor_verified') === 'true';
    
    if (verificationText) {
        if (isVerified) {
            verificationText.textContent = 'Rehacer verificación';
            verificationText.setAttribute('data-translate', 'hamburger.redo_verification');
        } else {
            verificationText.textContent = 'Hacer verificación';
            verificationText.setAttribute('data-translate', 'hamburger.verification');
        }
    }
    
    // Mostrar/ocultar botón crear según verificación
    this.updateCreateButtonVisibility();
};

AtlasApp.prototype.updateCreateButtonVisibility = function() {
    const createDropdown = document.getElementById('create-dropdown');
    const isVerified = localStorage.getItem('instructor_verified') === 'true';
    
    if (createDropdown) {
        if (isVerified) {
            createDropdown.style.display = 'inline-block';
            console.log('✅ Botón Crear mostrado - Usuario verificado');
        } else {
            createDropdown.style.display = 'none';
            console.log('🔒 Botón Crear oculto - Usuario no verificado');
        }
    }
};

AtlasApp.prototype.resetVerificationForm = function() {
    console.log('🔄 Reseteando formulario de verificación...');
    
    // Resetear al primer paso
    const steps = document.querySelectorAll('.verification-step');
    steps.forEach(step => step.classList.remove('active'));
    const firstStep = document.getElementById('academic-step');
    if (firstStep) firstStep.classList.add('active');
    
    // Resetear botones
    this.updateVerificationButtons();
    
    // Limpiar todos los campos del formulario
    const formInputs = document.querySelectorAll('#instructor-verification-screen input, #instructor-verification-screen select, #instructor-verification-screen textarea');
    formInputs.forEach(input => {
        if (input.type === 'file') {
            input.value = '';
            // Resetear el label del archivo
            const label = input.nextElementSibling;
            if (label && label.classList.contains('file-upload-label')) {
                const originalContent = {
                    'academic-document': '<i class="fas fa-cloud-upload-alt"></i><span>Subir título, certificado o constancia</span>',
                    'instructor-photo': '<i class="fas fa-camera"></i><span>Subir foto profesional</span>'
                };
                
                const content = originalContent[input.id];
                if (content) {
                    label.innerHTML = content;
                    label.style.borderColor = '';
                    label.style.backgroundColor = '';
                    label.style.color = '';
                }
            }
        } else {
            input.value = '';
        }
        
        // Limpiar estilos de error
        input.style.borderColor = '';
    });
    
    // Limpiar localStorage de verificación para permitir rehacer
    localStorage.removeItem('instructor_verified');
    localStorage.removeItem('instructor_data');
    
    // Actualizar estado del menú
    this.updateHamburgerMenuState();
    
    console.log('✅ Formulario de verificación reseteado');
};

// Configuración del sistema de creación
AtlasApp.prototype.setupCreatorSystem = function() {
    console.log('🎨 Configurando sistema de creación...');
    
    // Configurar dropdown del botón crear
    this.setupCreateDropdown();
    
    // Configurar verificación de instructor
    this.setupInstructorVerification();
    
    // Configurar creador de cursos
    this.setupCourseCreator();
    
    // Configurar creador de clases
    this.setupClassCreator();
    
    console.log('✅ Sistema de creación configurado');
};

AtlasApp.prototype.setupCreateDropdown = function() {
    const createBtn = document.getElementById('create-btn');
    const createDropdown = document.getElementById('create-dropdown');
    const createMenu = document.getElementById('create-menu');
    const createCourseOption = document.getElementById('create-course-option');
    const createClassOption = document.getElementById('create-class-option');
    
    if (!createBtn || !createDropdown || !createMenu) return;
    
    // Toggle dropdown
    createBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        createDropdown.classList.toggle('open');
    });
    
    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!createDropdown.contains(e.target)) {
            createDropdown.classList.remove('open');
        }
    });
    
    // Opciones del dropdown
    if (createCourseOption) {
        createCourseOption.addEventListener('click', () => {
            console.log('🎓 Iniciando creación de curso');
            createDropdown.classList.remove('open');
            this.startCourseCreation();
        });
    }
    
    if (createClassOption) {
        createClassOption.addEventListener('click', () => {
            console.log('📚 Iniciando creación de clase');
            createDropdown.classList.remove('open');
            this.startClassCreation();
        });
    }
};

AtlasApp.prototype.startCourseCreation = function() {
    // Verificar si el usuario ya está verificado como instructor
    const isVerified = localStorage.getItem('instructor_verified') === 'true';
    
    if (isVerified) {
        this.showScreen('course-creator-screen');
        this.loadPreviousCourses();
    } else {
        this.showScreen('instructor-verification-screen');
    }
};

AtlasApp.prototype.startClassCreation = function() {
    // Verificar si el usuario ya está verificado como instructor
    const isVerified = localStorage.getItem('instructor_verified') === 'true';
    
    if (isVerified) {
        this.showScreen('class-creator-screen');
        this.loadPreviousClasses();
    } else {
        this.showScreen('instructor-verification-screen');
    }
};

AtlasApp.prototype.setupInstructorVerification = function() {
    const verificationBackBtn = document.getElementById('verification-back-btn');
    const prevStepBtn = document.getElementById('prev-step-btn');
    const nextStepBtn = document.getElementById('next-step-btn');
    const submitVerificationBtn = document.getElementById('submit-verification-btn');
    
    // Botón volver
    if (verificationBackBtn) {
        verificationBackBtn.addEventListener('click', () => {
            this.showScreen('dashboard-screen');
        });
    }
    
    // Navegación entre pasos
    if (prevStepBtn) {
        prevStepBtn.addEventListener('click', () => {
            this.previousVerificationStep();
        });
    }
    
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', () => {
            this.nextVerificationStep();
        });
    }
    
    if (submitVerificationBtn) {
        submitVerificationBtn.addEventListener('click', () => {
            this.submitInstructorVerification();
        });
    }
    
    // Configurar validación de archivos
    this.setupFileValidation();
    
    // Configurar validación de campos bancarios
    this.setupBankingValidation();
};

AtlasApp.prototype.nextVerificationStep = function() {
    const currentStep = document.querySelector('.verification-step.active');
    const currentStepId = currentStep.id;
    
    // Validar paso actual antes de continuar
    if (!this.validateCurrentStep(currentStepId)) {
        return;
    }
    
    let nextStep;
    switch(currentStepId) {
        case 'academic-step':
            nextStep = document.getElementById('personal-step');
            break;
        case 'personal-step':
            nextStep = document.getElementById('banking-step');
            break;
    }
    
    if (nextStep) {
        currentStep.classList.remove('active');
        nextStep.classList.add('active');
        
        this.updateVerificationButtons();
    }
};

AtlasApp.prototype.previousVerificationStep = function() {
    const currentStep = document.querySelector('.verification-step.active');
    const currentStepId = currentStep.id;
    
    let prevStep;
    switch(currentStepId) {
        case 'personal-step':
            prevStep = document.getElementById('academic-step');
            break;
        case 'banking-step':
            prevStep = document.getElementById('personal-step');
            break;
    }
    
    if (prevStep) {
        currentStep.classList.remove('active');
        prevStep.classList.add('active');
        
        this.updateVerificationButtons();
    }
};

AtlasApp.prototype.updateVerificationButtons = function() {
    const currentStep = document.querySelector('.verification-step.active');
    const currentStepId = currentStep.id;
    const prevBtn = document.getElementById('prev-step-btn');
    const nextBtn = document.getElementById('next-step-btn');
    const submitBtn = document.getElementById('submit-verification-btn');
    
    // Actualizar botón anterior
    if (prevBtn) {
        prevBtn.disabled = currentStepId === 'academic-step';
    }
    
    // Mostrar/ocultar botones según el paso
    if (currentStepId === 'banking-step') {
        if (nextBtn) nextBtn.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'flex';
    } else {
        if (nextBtn) nextBtn.style.display = 'flex';
        if (submitBtn) submitBtn.style.display = 'none';
    }
};

AtlasApp.prototype.validateCurrentStep = function(stepId) {
    const step = document.getElementById(stepId);
    const requiredFields = step.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#ef4444';
            isValid = false;
            
            // Remover el error después de 3 segundos
            setTimeout(() => {
                field.style.borderColor = '';
            }, 3000);
        } else {
            field.style.borderColor = '';
        }
    });
    
    if (!isValid) {
        this.showNotification('Por favor complete todos los campos requeridos', 'error');
    }
    
    return isValid;
};

AtlasApp.prototype.setupFileValidation = function() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const label = input.nextElementSibling;
            
            if (file) {
                // Validar tamaño (máx 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    this.showNotification('El archivo es demasiado grande (máx. 5MB)', 'error');
                    input.value = '';
                    return;
                }
                
                // Actualizar texto del label
                label.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <span>${file.name}</span>
                `;
                label.style.borderColor = '#10b981';
                label.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
                label.style.color = '#10b981';
            }
        });
    });
};

AtlasApp.prototype.setupBankingValidation = function() {
    const accountNumber = document.getElementById('account-number');
    const clabe = document.getElementById('clabe');
    
    if (accountNumber) {
        accountNumber.addEventListener('input', (e) => {
            // Solo números
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
    
    if (clabe) {
        clabe.addEventListener('input', (e) => {
            // Solo números, máximo 18 dígitos
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 18);
        });
    }
};

AtlasApp.prototype.submitInstructorVerification = function() {
    // Validar todos los pasos
    const steps = ['academic-step', 'personal-step', 'banking-step'];
    let allValid = true;
    
    for (const stepId of steps) {
        if (!this.validateCurrentStep(stepId)) {
            allValid = false;
            break;
        }
    }
    
    if (!allValid) return;
    
    // Simular envío de verificación
    const submitBtn = document.getElementById('submit-verification-btn');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Enviando...</span>';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        // Marcar como verificado
        localStorage.setItem('instructor_verified', 'true');
        localStorage.setItem('instructor_data', JSON.stringify({
            educationLevel: document.getElementById('education-level').value,
            institution: document.getElementById('institution-name').value,
            field: document.getElementById('career-field').value,
            name: document.getElementById('instructor-name').value,
            email: document.getElementById('instructor-email').value,
            verificationDate: new Date().toISOString()
        }));
        
        this.showNotification('¡Verificación enviada exitosamente! Te contactaremos pronto.', 'success');
        
        // Actualizar estado del menú hamburguesa
        this.updateHamburgerMenuState();
        
        // Redirigir al dashboard
        setTimeout(() => {
            this.showScreen('dashboard-screen');
        }, 2000);
        
    }, 2000);
};

AtlasApp.prototype.setupClassCreator = function() {
    const classCreatorBackBtn = document.getElementById('class-creator-back-btn');
    const saveClassDraftBtn = document.getElementById('save-class-draft-btn');
    const submitClassBtn = document.getElementById('submit-class-btn');
    
    // Botón volver
    if (classCreatorBackBtn) {
        classCreatorBackBtn.addEventListener('click', () => {
            // Limpiar variables de edición y guardado
            this.editingClassIndex = undefined;
            this.isSavingClass = false;
            this.showScreen('dashboard-screen');
        });
    }
    
    // Guardar borrador de clase
    if (saveClassDraftBtn) {
        saveClassDraftBtn.addEventListener('click', () => {
            this.saveSingleClass(true);
        });
    }
    
    // Enviar clase para revisión
    if (submitClassBtn) {
        submitClassBtn.addEventListener('click', () => {
            this.saveSingleClass(false);
        });
    }
    
    // Configurar validación de archivos para clase individual
    this.setupSingleClassFileValidation();
};

AtlasApp.prototype.setupCourseCreator = function() {
    const creatorBackBtn = document.getElementById('creator-back-btn');
    const addClassBtn = document.getElementById('add-class-btn');
    const saveDraftBtn = document.getElementById('save-draft-btn');
    const submitCourseBtn = document.getElementById('submit-course-btn');
    
    // Botón volver
    if (creatorBackBtn) {
        creatorBackBtn.addEventListener('click', () => {
            // Limpiar variables de edición y guardado
            this.editingCourseIndex = undefined;
            this.isSavingCourse = false;
            this.showScreen('dashboard-screen');
        });
    }
    
    // Agregar clase
    if (addClassBtn) {
        addClassBtn.addEventListener('click', () => {
            this.addCourseClass();
        });
    }
    
    // Guardar borrador
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', () => {
            this.saveCourse(true);
        });
    }
    
    // Enviar para revisión
    if (submitCourseBtn) {
        submitCourseBtn.addEventListener('click', () => {
            this.saveCourse(false);
        });
    }
    
    // Inicializar con dos clases por defecto
    this.addCourseClass();
    this.addCourseClass();
};

AtlasApp.prototype.addCourseClass = function() {
    const classesContainer = document.getElementById('course-classes-container');
    const classCount = classesContainer.children.length + 1;
    
    const classElement = document.createElement('div');
    classElement.className = 'course-class';
    classElement.innerHTML = `
        <div class="class-header">
            <h3>Clase ${classCount}</h3>
            <button type="button" class="btn-danger" onclick="this.closest('.course-class').remove()">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="class-content">
            <div class="form-row">
                <div class="form-group">
                    <label>Título de la clase</label>
                    <input type="text" class="class-title" placeholder="Ej: Ecuaciones lineales básicas" required>
                </div>
                <div class="form-group">
                    <label>Duración (minutos)</label>
                    <input type="number" class="class-duration" placeholder="30" min="5" max="180" required>
                </div>
            </div>
            <div class="form-group">
                <label>Video de la clase</label>
                <div class="file-upload">
                    <input type="file" class="class-video" accept=".mp4,.avi,.mov,.wmv" required>
                    <label class="file-upload-label">
                        <i class="fas fa-video"></i>
                        <span>Subir video de la clase</span>
                    </label>
                </div>
                <small class="form-help">Formatos: MP4, AVI, MOV, WMV (máx. 100MB)</small>
            </div>
            <div class="form-group">
                <label>Archivos de apoyo (opcional)</label>
                <div class="file-upload">
                    <input type="file" class="class-files" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" multiple>
                    <label class="file-upload-label">
                        <i class="fas fa-paperclip"></i>
                        <span>Subir archivos de apoyo</span>
                    </label>
                </div>
                <small class="form-help">PDF, Word, PowerPoint, TXT (máx. 10MB c/u)</small>
            </div>
            <div class="form-group">
                <label>Descripción de la clase</label>
                <textarea class="class-description" rows="3" placeholder="Describe qué se enseñará en esta clase..." required></textarea>
            </div>
        </div>
    `;
    
    classesContainer.appendChild(classElement);
    
    // Configurar validación de archivos para esta clase
    this.setupClassFileValidation(classElement);
};

AtlasApp.prototype.setupClassFileValidation = function(classElement) {
    const videoInput = classElement.querySelector('.class-video');
    const filesInput = classElement.querySelector('.class-files');
    
    if (videoInput) {
        videoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const label = e.target.nextElementSibling;
            
            if (file) {
                // Validar tamaño de video (máx 100MB)
                if (file.size > 100 * 1024 * 1024) {
                    this.showNotification('El video es demasiado grande (máx. 100MB)', 'error');
                    e.target.value = '';
                    return;
                }
                
                label.innerHTML = `<i class="fas fa-check-circle"></i><span>${file.name}</span>`;
                label.style.borderColor = '#10b981';
                label.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
            }
        });
    }
    
    if (filesInput) {
        filesInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            const label = e.target.nextElementSibling;
            
            if (files.length > 0) {
                // Validar tamaño de cada archivo (máx 10MB)
                for (const file of files) {
                    if (file.size > 10 * 1024 * 1024) {
                        this.showNotification(`${file.name} es demasiado grande (máx. 10MB)`, 'error');
                        e.target.value = '';
                        return;
                    }
                }
                
                const fileText = files.length === 1 ? files[0].name : `${files.length} archivos`;
                label.innerHTML = `<i class="fas fa-check-circle"></i><span>${fileText}</span>`;
                label.style.borderColor = '#10b981';
                label.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
            }
        });
    }
};

AtlasApp.prototype.saveCourse = function(isDraft = false) {
    // Prevenir múltiples envíos
    if (this.isSavingCourse) {
        console.log('⏳ Ya se está guardando un curso, ignorando clic adicional');
        return;
    }
    
    // Validar información básica
    const basicInfo = this.validateBasicCourseInfo();
    if (!basicInfo.isValid) {
        this.isSavingCourse = false;
        return;
    }
    
    // Validar unidades y clases
    const courseContent = this.validateCourseContent();
    if (!courseContent.isValid) {
        this.isSavingCourse = false;
        return;
    }
    
    // Marcar como guardando
    this.isSavingCourse = true;
    
    // Simular guardado
    const saveBtn = isDraft ? document.getElementById('save-draft-btn') : document.getElementById('submit-course-btn');
    const originalText = saveBtn.innerHTML;
    
    saveBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>${isDraft ? 'Guardando...' : 'Enviando...'}</span>`;
    saveBtn.disabled = true;
    
    setTimeout(() => {
        const courseData = {
            ...basicInfo.data,
            ...courseContent.data,
            isDraft,
            createdAt: new Date().toISOString(),
            instructor: JSON.parse(localStorage.getItem('instructor_data') || '{}')
        };
        
        // Guardar en localStorage (evitar duplicados)
        const courses = JSON.parse(localStorage.getItem('my_courses') || '[]');
        
        // Generar un ID único para el curso si no existe o si está editando usar el ID existente
        if (this.editingCourseIndex !== undefined) {
            // Si estamos editando, usar el ID del curso existente
            const existingCourse = courses[this.editingCourseIndex];
            courseData.id = existingCourse ? existingCourse.id : (Date.now() + '_' + Math.random().toString(36).substr(2, 9));
        } else if (!courseData.id) {
            courseData.id = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        
        // Verificar si el curso ya existe (por ID)
        const existingIndex = courses.findIndex(course => course.id === courseData.id);
        if (existingIndex >= 0) {
            // Actualizar curso existente
            courses[existingIndex] = courseData;
        } else {
            // Agregar nuevo curso
            courses.push(courseData);
        }
        
        localStorage.setItem('my_courses', JSON.stringify(courses));
        
        const message = this.editingCourseIndex !== undefined ? 
            (isDraft ? '¡Curso actualizado como borrador!' : '¡Curso actualizado y enviado para revisión!') :
            (isDraft ? '¡Borrador guardado exitosamente!' : '¡Curso enviado para revisión! Te contactaremos pronto.');
        
        this.showNotification(message, 'success');
        
        // Limpiar variable de edición
        this.editingCourseIndex = undefined;
        
        // Liberar flag de guardado
        this.isSavingCourse = false;
        
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
        
        // Limpiar formulario después de guardar exitosamente
        if (!isDraft) {
            setTimeout(() => {
                this.clearCourseForm();
                this.showScreen('dashboard-screen');
            }, 2000);
        } else {
            // Para borradores, limpiar después de un breve delay
            setTimeout(() => {
                this.clearCourseForm();
            }, 1000);
        }
        
    }, 2000);
};

AtlasApp.prototype.clearCourseForm = function() {
    console.log('🧹 Limpiando formulario de curso...');
    
    // Limpiar campos básicos
    const titleField = document.getElementById('course-title');
    const descField = document.getElementById('course-description');
    const categoryField = document.getElementById('course-category');
    const levelField = document.getElementById('course-level');
    const priceField = document.getElementById('course-price');
    const imageField = document.getElementById('course-image');
    const durationField = document.getElementById('course-duration');
    
    if (titleField) titleField.value = '';
    if (descField) descField.value = '';
    if (categoryField) categoryField.value = '';
    if (levelField) levelField.value = '';
    if (priceField) priceField.value = '';
    if (imageField) imageField.value = '';
    if (durationField) durationField.value = '';
    
    // Limpiar container de clases y agregar dos clases por defecto
    const classesContainer = document.getElementById('course-classes-container');
    if (classesContainer) {
        // Antes de limpiar, resetear estilos de archivos de clases existentes
        const classVideoLabels = classesContainer.querySelectorAll('.class-video + label');
        const classFilesLabels = classesContainer.querySelectorAll('.class-files + label');
        
        classVideoLabels.forEach(label => {
            label.innerHTML = `
                <i class="fas fa-video"></i>
                <span>Subir video de la clase</span>
            `;
            label.style.borderColor = '';
            label.style.backgroundColor = '';
            label.style.color = '';
        });
        
        classFilesLabels.forEach(label => {
            label.innerHTML = `
                <i class="fas fa-paperclip"></i>
                <span>Subir archivos de apoyo</span>
            `;
            label.style.borderColor = '';
            label.style.backgroundColor = '';
            label.style.color = '';
        });
        
        // Ahora limpiar y agregar clases vacías por defecto
        classesContainer.innerHTML = '';
        this.addCourseClass();
        this.addCourseClass();
    }
    
    // Limpiar contenedores de datos dinámicos
    const previousCoursesGrid = document.getElementById('previous-courses-grid');
    if (previousCoursesGrid) {
        // Recargar los cursos anteriores para mostrar el estado actualizado
        setTimeout(() => {
            this.loadPreviousCourses();
        }, 500);
    }
    
    // Restaurar labels originales de archivos y resetear estilos visuales
    const imageLabel = document.querySelector('label[for="course-image"]');
    if (imageLabel) {
        // Restaurar contenido HTML original
        imageLabel.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <span>Subir imagen del curso</span>
        `;
        // Resetear estilos CSS a estado original
        imageLabel.style.borderColor = '';
        imageLabel.style.backgroundColor = '';
        imageLabel.style.color = '';
    }
    
    // Limpiar mensajes de error o validación si existen
    const errorMessages = document.querySelectorAll('#course-creator-screen .error-message, #course-creator-screen .validation-message');
    errorMessages.forEach(msg => {
        msg.textContent = '';
        msg.style.display = 'none';
    });
    
    // Limpiar notificaciones temporales
    const notifications = document.querySelectorAll('#course-creator-screen .notification, #course-creator-screen .temp-message');
    notifications.forEach(notif => {
        notif.remove();
    });
    
    console.log('✅ Formulario de curso limpiado completamente');
};

AtlasApp.prototype.validateBasicCourseInfo = function() {
    const title = document.getElementById('course-title').value.trim();
    const category = document.getElementById('course-category').value;
    const level = document.getElementById('course-level').value;
    const duration = document.getElementById('course-duration').value;
    const description = document.getElementById('course-description').value.trim();
    const image = document.getElementById('course-image').files[0];
    
    if (!title || !category || !level || !duration || !description || !image) {
        this.showNotification('Por favor complete toda la información básica del curso', 'error');
        return { isValid: false };
    }
    
    return {
        isValid: true,
        data: {
            title,
            category,
            level,
            duration: parseInt(duration),
            description,
            image: image.name
        }
    };
};

AtlasApp.prototype.validateCourseContent = function() {
    const classes = document.querySelectorAll('#course-classes-container .course-class');
    
    if (classes.length < 2) {
        this.showNotification('El curso debe tener al menos 2 clases', 'error');
        return { isValid: false };
    }
    
    const classesData = [];
    
    for (const classEl of classes) {
        const classTitle = classEl.querySelector('.class-title').value.trim();
        const classDuration = classEl.querySelector('.class-duration').value;
        const classVideo = classEl.querySelector('.class-video').files[0];
        const classDescription = classEl.querySelector('.class-description').value.trim();
        const classFiles = Array.from(classEl.querySelector('.class-files').files);
        
        if (!classTitle || !classDuration || !classVideo || !classDescription) {
            this.showNotification('Todas las clases deben tener título, duración, video y descripción', 'error');
            return { isValid: false };
        }
        
        classesData.push({
            title: classTitle,
            duration: parseInt(classDuration),
            video: classVideo.name,
            description: classDescription,
            files: classFiles.map(f => f.name)
        });
    }
    
    return {
        isValid: true,
        data: {
            classes: classesData
        }
    };
};

// Funciones para manejo de clases individuales
AtlasApp.prototype.setupSingleClassFileValidation = function() {
    const videoInput = document.getElementById('single-class-video');
    const filesInput = document.getElementById('single-class-files');
    const imageInput = document.getElementById('single-class-image');
    
    if (videoInput) {
        videoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const label = e.target.nextElementSibling;
            
            if (file) {
                if (file.size > 100 * 1024 * 1024) {
                    this.showNotification('El video es demasiado grande (máx. 100MB)', 'error');
                    e.target.value = '';
                    return;
                }
                
                label.innerHTML = `<i class="fas fa-check-circle"></i><span>${file.name}</span>`;
                label.style.borderColor = '#10b981';
                label.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
            }
        });
    }
    
    if (filesInput) {
        filesInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            const label = e.target.nextElementSibling;
            
            if (files.length > 0) {
                for (const file of files) {
                    if (file.size > 10 * 1024 * 1024) {
                        this.showNotification(`${file.name} es demasiado grande (máx. 10MB)`, 'error');
                        e.target.value = '';
                        return;
                    }
                }
                
                const fileText = files.length === 1 ? files[0].name : `${files.length} archivos`;
                label.innerHTML = `<i class="fas fa-check-circle"></i><span>${fileText}</span>`;
                label.style.borderColor = '#10b981';
                label.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
            }
        });
    }
    
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const label = e.target.nextElementSibling;
            
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    this.showNotification('La imagen es demasiado grande (máx. 5MB)', 'error');
                    e.target.value = '';
                    return;
                }
                
                label.innerHTML = `<i class="fas fa-check-circle"></i><span>${file.name}</span>`;
                label.style.borderColor = '#10b981';
                label.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
            }
        });
    }
};

AtlasApp.prototype.saveSingleClass = function(isDraft = false) {
    // Prevenir múltiples envíos
    if (this.isSavingClass) {
        console.log('⏳ Ya se está guardando una clase, ignorando clic adicional');
        return;
    }
    
    // Validar información de la clase
    const classInfo = this.validateSingleClassInfo();
    if (!classInfo.isValid) {
        this.isSavingClass = false;
        return;
    }
    
    // Marcar como guardando
    this.isSavingClass = true;
    
    // Simular guardado
    const saveBtn = isDraft ? document.getElementById('save-class-draft-btn') : document.getElementById('submit-class-btn');
    const originalText = saveBtn.innerHTML;
    
    saveBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>${isDraft ? 'Guardando...' : 'Enviando...'}</span>`;
    saveBtn.disabled = true;
    
    setTimeout(() => {
        const classData = {
            ...classInfo.data,
            isDraft,
            type: 'single_class',
            createdAt: new Date().toISOString(),
            instructor: JSON.parse(localStorage.getItem('instructor_data') || '{}')
        };
        
        // Guardar en localStorage (evitar duplicados)
        const classes = JSON.parse(localStorage.getItem('my_classes') || '[]');
        
        // Generar un ID único para la clase si no existe o si está editando usar el ID existente
        if (this.editingClassIndex !== undefined) {
            // Si estamos editando, usar el ID de la clase existente
            const existingClass = classes[this.editingClassIndex];
            classData.id = existingClass ? existingClass.id : (Date.now() + '_' + Math.random().toString(36).substr(2, 9));
        } else if (!classData.id) {
            classData.id = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        
        // Verificar si la clase ya existe (por ID)
        const existingIndex = classes.findIndex(cls => cls.id === classData.id);
        if (existingIndex >= 0) {
            // Actualizar clase existente
            classes[existingIndex] = classData;
        } else {
            // Agregar nueva clase
            classes.push(classData);
        }
        
        localStorage.setItem('my_classes', JSON.stringify(classes));
        
        const message = this.editingClassIndex !== undefined ?
            (isDraft ? '¡Clase actualizada como borrador!' : '¡Clase actualizada y enviada para revisión!') :
            (isDraft ? '¡Clase guardada como borrador!' : '¡Clase enviada para revisión! Te contactaremos pronto.');
        
        this.showNotification(message, 'success');
        
        // Limpiar variable de edición
        this.editingClassIndex = undefined;
        
        // Liberar flag de guardado
        this.isSavingClass = false;
        
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
        
        // Actualizar lista de clases anteriores
        this.loadPreviousClasses();
        
        // Limpiar formulario después de guardar exitosamente
        if (!isDraft) {
            setTimeout(() => {
                this.clearClassForm();
                this.showScreen('dashboard-screen');
            }, 2000);
        } else {
            // Para borradores, limpiar después de un breve delay
            setTimeout(() => {
                this.clearClassForm();
            }, 1000);
        }
        
    }, 2000);
};

AtlasApp.prototype.clearClassForm = function() {
    console.log('🧹 Limpiando formulario de clase...');
    
    // Limpiar campos básicos
    const titleField = document.getElementById('single-class-title');
    const categoryField = document.getElementById('single-class-category');
    const levelField = document.getElementById('single-class-level');
    const durationField = document.getElementById('single-class-duration');
    const descriptionField = document.getElementById('single-class-description');
    const videoField = document.getElementById('single-class-video');
    const filesField = document.getElementById('single-class-files');
    const imageField = document.getElementById('single-class-image');
    
    if (titleField) titleField.value = '';
    if (categoryField) categoryField.value = '';
    if (levelField) levelField.value = '';
    if (durationField) durationField.value = '';
    if (descriptionField) descriptionField.value = '';
    if (videoField) videoField.value = '';
    if (filesField) filesField.value = '';
    if (imageField) imageField.value = '';
    
    // Limpiar contenedores de datos dinámicos
    const previousClassesGrid = document.getElementById('previous-classes-grid');
    if (previousClassesGrid) {
        // Recargar las clases anteriores para mostrar el estado actualizado
        setTimeout(() => {
            this.loadPreviousClasses();
        }, 500);
    }
    
    // Restaurar labels originales de archivos y resetear estilos visuales
    const videoLabel = document.querySelector('label[for="single-class-video"]');
    const filesLabel = document.querySelector('label[for="single-class-files"]');
    const imageLabel = document.querySelector('label[for="single-class-image"]');
    
    if (videoLabel) {
        // Restaurar contenido HTML original
        videoLabel.innerHTML = `
            <i class="fas fa-video"></i>
            <span>Subir video de la clase</span>
        `;
        // Resetear estilos CSS a estado original
        videoLabel.style.borderColor = '';
        videoLabel.style.backgroundColor = '';
        videoLabel.style.color = '';
    }
    
    if (filesLabel) {
        // Restaurar contenido HTML original
        filesLabel.innerHTML = `
            <i class="fas fa-paperclip"></i>
            <span>Subir archivos de apoyo</span>
        `;
        // Resetear estilos CSS a estado original
        filesLabel.style.borderColor = '';
        filesLabel.style.backgroundColor = '';
        filesLabel.style.color = '';
    }
    
    if (imageLabel) {
        // Restaurar contenido HTML original
        imageLabel.innerHTML = `
            <i class="fas fa-image"></i>
            <span>Subir imagen representativa</span>
        `;
        // Resetear estilos CSS a estado original
        imageLabel.style.borderColor = '';
        imageLabel.style.backgroundColor = '';
        imageLabel.style.color = '';
    }
    
    // Limpiar mensajes de error o validación si existen
    const errorMessages = document.querySelectorAll('#class-creator-screen .error-message, #class-creator-screen .validation-message');
    errorMessages.forEach(msg => {
        msg.textContent = '';
        msg.style.display = 'none';
    });
    
    // Limpiar notificaciones temporales
    const notifications = document.querySelectorAll('#class-creator-screen .notification, #class-creator-screen .temp-message');
    notifications.forEach(notif => {
        notif.remove();
    });
    
    console.log('✅ Formulario de clase limpiado completamente');
};

AtlasApp.prototype.validateSingleClassInfo = function() {
    const title = document.getElementById('single-class-title').value.trim();
    const category = document.getElementById('single-class-category').value;
    const level = document.getElementById('single-class-level').value;
    const duration = document.getElementById('single-class-duration').value;
    const description = document.getElementById('single-class-description').value.trim();
    const video = document.getElementById('single-class-video').files[0];
    const image = document.getElementById('single-class-image').files[0];
    const files = Array.from(document.getElementById('single-class-files').files);
    
    if (!title || !category || !level || !duration || !description || !video || !image) {
        this.showNotification('Por favor complete todos los campos requeridos', 'error');
        return { isValid: false };
    }
    
    return {
        isValid: true,
        data: {
            title,
            category,
            level,
            duration: parseInt(duration),
            description,
            video: video.name,
            image: image.name,
            files: files.map(f => f.name)
        }
    };
};

AtlasApp.prototype.loadPreviousClasses = function() {
    const classes = JSON.parse(localStorage.getItem('my_classes') || '[]');
    const container = document.getElementById('previous-classes-grid');
    const section = document.getElementById('previous-classes-section');
    
    if (!container || !section) return;
    
    if (classes.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    container.innerHTML = '';
    
    classes.forEach((classData, index) => {
        const classCard = document.createElement('div');
        classCard.className = 'previous-content-card';
        classCard.innerHTML = `
            <div class="content-card-image">
                <i class="fas fa-play-circle"></i>
            </div>
            <div class="content-card-info">
                <h4>${classData.title}</h4>
                <p><i class="fas fa-clock"></i> ${classData.duration} min</p>
                <p><i class="fas fa-tag"></i> ${classData.level}</p>
                <span class="content-status ${classData.isDraft ? 'draft' : 'review'}">${classData.isDraft ? 'Borrador' : 'En revisión'}</span>
            </div>
            <div class="content-card-actions">
                <button class="btn-secondary" data-action="edit-class" data-index="${index}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-danger" data-action="delete-class" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(classCard);
    });
    
    // Agregar event listeners para los botones de editar y eliminar clases
    const editButtons = container.querySelectorAll('[data-action="edit-class"]');
    const deleteButtons = container.querySelectorAll('[data-action="delete-class"]');
    
    editButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.getAttribute('data-index'));
            this.editClass(index);
        });
    });
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.getAttribute('data-index'));
            this.deleteClass(index);
        });
    });
};

AtlasApp.prototype.loadPreviousCourses = function() {
    const courses = JSON.parse(localStorage.getItem('my_courses') || '[]');
    const container = document.getElementById('previous-courses-grid');
    const section = document.getElementById('previous-courses-section');
    
    if (!container || !section) return;
    
    if (courses.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    container.innerHTML = '';
    
    courses.forEach((courseData, index) => {
        // Calcular total de clases (nueva estructura sin unidades)
        const totalClasses = courseData.classes ? courseData.classes.length : 
                           (courseData.units ? courseData.units.reduce((acc, unit) => acc + unit.classes.length, 0) : 0);
        
        // Calcular duración total
        let totalDuration = 0;
        if (courseData.classes) {
            totalDuration = courseData.classes.reduce((acc, cls) => acc + cls.duration, 0);
        } else if (courseData.units) {
            totalDuration = courseData.units.reduce((acc, unit) => 
                acc + unit.classes.reduce((acc2, cls) => acc2 + cls.duration, 0), 0);
        }
        
        const courseCard = document.createElement('div');
        courseCard.className = 'previous-content-card';
        courseCard.innerHTML = `
            <div class="content-card-image">
                <i class="fas fa-book"></i>
            </div>
            <div class="content-card-info">
                <h4>${courseData.title}</h4>
                <p><i class="fas fa-play"></i> ${totalClasses} clases</p>
                <p><i class="fas fa-clock"></i> ${totalDuration} min total</p>
                <span class="content-status ${courseData.isDraft ? 'draft' : 'review'}">${courseData.isDraft ? 'Borrador' : 'En revisión'}</span>
            </div>
            <div class="content-card-actions">
                <button class="btn-secondary" data-action="edit-course" data-index="${index}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-danger" data-action="delete-course" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(courseCard);
    });
    
    // Agregar event listeners para los botones de editar y eliminar cursos
    const editButtons = container.querySelectorAll('[data-action="edit-course"]');
    const deleteButtons = container.querySelectorAll('[data-action="delete-course"]');
    
    editButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.getAttribute('data-index'));
            this.editCourse(index);
        });
    });
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.getAttribute('data-index'));
            this.deleteCourse(index);
        });
    });
};

AtlasApp.prototype.editClass = function(index) {
    console.log('🔧 Editando clase con índice:', index);
    const classes = JSON.parse(localStorage.getItem('my_classes') || '[]');
    const classData = classes[index];
    
    if (!classData) {
        this.showNotification('Clase no encontrada', 'error');
        console.error('❌ Clase no encontrada en índice:', index);
        return;
    }
    
    console.log('🎓 Datos de la clase a editar:', classData);
    
    // Guardar el índice de la clase que se está editando
    this.editingClassIndex = index;
    
    // Ir a la pantalla de creación de clases
    this.showScreen('class-creator-screen');
    
    // Cargar los datos de la clase en el formulario
    setTimeout(() => {
        this.loadClassDataForEdit(classData);
    }, 200);
};

AtlasApp.prototype.loadClassDataForEdit = function(classData) {
    console.log('📝 Cargando datos de la clase para edición:', classData);
    
    // Cargar información básica de la clase
    const titleField = document.getElementById('single-class-title');
    const categoryField = document.getElementById('single-class-category');
    const levelField = document.getElementById('single-class-level');
    const durationField = document.getElementById('single-class-duration');
    const descriptionField = document.getElementById('single-class-description');
    
    if (titleField) titleField.value = classData.title || '';
    if (categoryField) categoryField.value = classData.category || '';
    if (levelField) levelField.value = classData.level || '';
    if (durationField) durationField.value = classData.duration || '';
    if (descriptionField) descriptionField.value = classData.description || '';
    
    console.log('✅ Campos básicos de clase cargados');
    
    // Actualizar etiquetas de archivos existentes
    const videoLabel = document.querySelector('label[for="single-class-video"] span');
    if (videoLabel && classData.video) {
        videoLabel.textContent = `Archivo actual: ${classData.video}`;
        console.log('📹 Video label actualizado');
    }
    
    const filesLabel = document.querySelector('label[for="single-class-files"] span');
    if (filesLabel && classData.files && classData.files.length > 0) {
        filesLabel.textContent = `${classData.files.length} archivos actuales`;
        console.log('📎 Files label actualizado');
    }
    
    const imageLabel = document.querySelector('label[for="single-class-image"] span');
    if (imageLabel && classData.image) {
        imageLabel.textContent = `Imagen actual: ${classData.image}`;
        console.log('🖼️ Image label actualizado');
    }
    
    this.showNotification('Clase cargada para edición', 'info');
};

AtlasApp.prototype.deleteClass = function(index) {
    console.log('🗑️ Intentando eliminar clase con índice:', index);
    if (confirm('¿Estás seguro de que quieres eliminar esta clase?')) {
        const classes = JSON.parse(localStorage.getItem('my_classes') || '[]');
        console.log('📚 Clases antes de eliminar:', classes.length);
        classes.splice(index, 1);
        localStorage.setItem('my_classes', JSON.stringify(classes));
        console.log('📚 Clases después de eliminar:', classes.length);
        this.loadPreviousClasses();
        this.showNotification('Clase eliminada exitosamente', 'success');
    }
};

AtlasApp.prototype.editCourse = function(index) {
    console.log('🔧 Editando curso con índice:', index);
    const courses = JSON.parse(localStorage.getItem('my_courses') || '[]');
    const courseData = courses[index];
    
    if (!courseData) {
        this.showNotification('Curso no encontrado', 'error');
        console.error('❌ Curso no encontrado en índice:', index);
        return;
    }
    
    console.log('📚 Datos del curso a editar:', courseData);
    
    // Guardar el índice del curso que se está editando
    this.editingCourseIndex = index;
    
    // Ir a la pantalla de creación de cursos
    this.showScreen('course-creator-screen');
    
    // Cargar los datos del curso en el formulario
    setTimeout(() => {
        this.loadCourseDataForEdit(courseData);
    }, 200);
};

AtlasApp.prototype.loadCourseDataForEdit = function(courseData) {
    console.log('📝 Cargando datos del curso para edición:', courseData);
    
    // Cargar información básica
    const titleField = document.getElementById('course-title');
    const descField = document.getElementById('course-description');
    const categoryField = document.getElementById('course-category');
    const levelField = document.getElementById('course-level');
    const priceField = document.getElementById('course-price');
    
    if (titleField) titleField.value = courseData.title || '';
    if (descField) descField.value = courseData.description || '';
    if (categoryField) categoryField.value = courseData.category || '';
    if (levelField) levelField.value = courseData.level || '';
    if (priceField) priceField.value = courseData.price || '';
    
    console.log('✅ Campos básicos cargados');
    
    // Limpiar clases existentes
    const classesContainer = document.getElementById('course-classes-container');
    if (classesContainer) {
        classesContainer.innerHTML = '';
        console.log('🧹 Container de clases limpiado');
    }
    
    // Cargar clases del curso
    if (courseData.classes && courseData.classes.length > 0) {
        console.log(`📚 Cargando ${courseData.classes.length} clases`);
        courseData.classes.forEach((classData, index) => {
            this.addCourseClassWithData(classData, index);
        });
    } else {
        console.log('➕ No hay clases, agregando dos por defecto');
        // Si no hay clases, agregar dos por defecto
        this.addCourseClass();
        this.addCourseClass();
    }
    
    this.showNotification('Curso cargado para edición', 'info');
};

AtlasApp.prototype.addCourseClassWithData = function(classData, index) {
    const classesContainer = document.getElementById('course-classes-container');
    const classCount = index + 1;
    
    const classElement = document.createElement('div');
    classElement.className = 'course-class';
    classElement.innerHTML = `
        <div class="class-header">
            <h3>Clase ${classCount}</h3>
            <button type="button" class="btn-danger" onclick="this.closest('.course-class').remove()">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        
        <div class="class-content">
            <div class="form-group">
                <label>Título de la clase</label>
                <input type="text" class="class-title" value="${classData.title || ''}" placeholder="Ej: Introducción al tema" required>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Duración (minutos)</label>
                    <input type="number" class="class-duration" value="${classData.duration || ''}" placeholder="30" min="5" max="180" required>
                </div>
            </div>
            
            <div class="form-group">
                <label>Descripción de la clase</label>
                <textarea class="class-description" rows="3" placeholder="Describe qué se enseñará en esta clase..." required>${classData.description || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label>Video de la clase</label>
                <div class="file-upload">
                    <input type="file" class="class-video" accept=".mp4,.avi,.mov,.wmv">
                    <label class="file-upload-label">
                        <i class="fas fa-video"></i>
                        <span>${classData.video ? `Archivo actual: ${classData.video}` : 'Subir video de la clase'}</span>
                    </label>
                </div>
                <small class="form-help">Formatos: MP4, AVI, MOV, WMV (máx. 100MB)</small>
            </div>
            
            <div class="form-group">
                <label>Archivos de apoyo (opcional)</label>
                <div class="file-upload">
                    <input type="file" class="class-files" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" multiple>
                    <label class="file-upload-label">
                        <i class="fas fa-paperclip"></i>
                        <span>${classData.files && classData.files.length > 0 ? `${classData.files.length} archivos actuales` : 'Subir archivos de apoyo'}</span>
                    </label>
                </div>
                <small class="form-help">PDF, Word, PowerPoint, TXT (máx. 10MB c/u)</small>
            </div>
        </div>
    `;
    
    classesContainer.appendChild(classElement);
};

AtlasApp.prototype.deleteCourse = function(index) {
    console.log('🗑️ Intentando eliminar curso con índice:', index);
    if (confirm('¿Estás seguro de que quieres eliminar este curso?')) {
        const courses = JSON.parse(localStorage.getItem('my_courses') || '[]');
        console.log('📚 Cursos antes de eliminar:', courses.length);
        courses.splice(index, 1);
        localStorage.setItem('my_courses', JSON.stringify(courses));
        console.log('📚 Cursos después de eliminar:', courses.length);
        this.loadPreviousCourses();
        this.showNotification('Curso eliminado exitosamente', 'success');
    }
};

AtlasApp.prototype.showNotification = function(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Detectar si estamos en el contexto de validación de escuela
    const schoolValidationSection = document.querySelector('.school-validation-section');
    let notificationPosition = {};
    
    if (schoolValidationSection && schoolValidationSection.getBoundingClientRect) {
        const rect = schoolValidationSection.getBoundingClientRect();
        // Posicionar sobre el contenedor de validación, esquina superior derecha
        notificationPosition = {
            position: 'absolute',
            top: `${rect.top + 20}px`,
            right: `${window.innerWidth - rect.right + 180}px`
        };
        
        // Agregar la notificación al contenedor de validación
        schoolValidationSection.appendChild(notification);
    } else {
        // Posición por defecto (esquina superior derecha de la pantalla)
        notificationPosition = {
            position: 'fixed',
            top: '20px',
            right: '20px'
        };
        
        // Agregar al body
        document.body.appendChild(notification);
    }
    
    // Estilos inline
    Object.assign(notification.style, {
        ...notificationPosition,
        padding: '1rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        color: 'white',
        fontWeight: '500',
        zIndex: '9999',
        maxWidth: '400px',
        animation: 'slideInRight 0.3s ease-out',
        background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
    });
    
    // La notificación ya se agregó en la lógica anterior
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
};

// Configuración de edición de perfil
AtlasApp.prototype.setupProfileEdit = function() {
    console.log('👤 Configurando edición de perfil...');
    
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const profileEditModal = document.getElementById('profile-edit-modal');
    const closeProfileEditModal = document.getElementById('close-profile-edit-modal');
    const cancelProfileEdit = document.getElementById('cancel-profile-edit');
    const saveProfileChanges = document.getElementById('save-profile-changes');
    const interestsInput = document.getElementById('edit-profile-interests');
    const changePhotoBtn = document.getElementById('change-photo-btn');
    const profilePhotoInput = document.getElementById('edit-profile-photo');
    const changeCoverBtn = document.getElementById('change-cover-btn');
    const coverPhotoInput = document.getElementById('edit-cover-photo');
    
    // Abrir modal de edición
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            this.openProfileEditModal();
        });
    }
    
    // Cerrar modal
    if (closeProfileEditModal) {
        closeProfileEditModal.addEventListener('click', () => {
            this.closeProfileEditModal();
        });
    }
    
    if (cancelProfileEdit) {
        cancelProfileEdit.addEventListener('click', () => {
            this.closeProfileEditModal();
        });
    }
    
    // Guardar cambios
    if (saveProfileChanges) {
        saveProfileChanges.addEventListener('click', () => {
            this.saveProfileChanges();
        });
    }
    
    // Manejar entrada de intereses
    if (interestsInput) {
        interestsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = e.target.value.trim();
                if (value) {
                    this.addInterestTag(value);
                    e.target.value = '';
                }
            }
        });
    }
    
    // Manejar cambio de foto
    if (changePhotoBtn) {
        changePhotoBtn.addEventListener('click', () => {
            profilePhotoInput.click();
        });
    }
    
    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', (e) => {
            this.handlePhotoChange(e, 'profile');
        });
    }
    
    // Manejar cambio de portada
    if (changeCoverBtn) {
        changeCoverBtn.addEventListener('click', () => {
            coverPhotoInput.click();
        });
    }
    
    if (coverPhotoInput) {
        coverPhotoInput.addEventListener('change', (e) => {
            this.handlePhotoChange(e, 'cover');
        });
    }
    
    // Cerrar modal al hacer clic fuera
    if (profileEditModal) {
        profileEditModal.addEventListener('click', (e) => {
            if (e.target === profileEditModal) {
                this.closeProfileEditModal();
            }
        });
    }
    
    console.log('✅ Edición de perfil configurada');
};

// Función de utilidad para limpiar duplicados existentes
AtlasApp.prototype.cleanupDuplicates = function() {
    // Limpiar cursos duplicados
    const courses = JSON.parse(localStorage.getItem('my_courses') || '[]');
    const uniqueCourses = [];
    const seenTitles = new Set();
    
    courses.forEach(course => {
        const key = `${course.title}_${course.createdAt}`;
        if (!seenTitles.has(key)) {
            seenTitles.add(key);
            // Agregar ID si no existe
            if (!course.id) {
                course.id = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }
            uniqueCourses.push(course);
        }
    });
    
    if (uniqueCourses.length !== courses.length) {
        localStorage.setItem('my_courses', JSON.stringify(uniqueCourses));
        console.log(`🧹 Limpiados ${courses.length - uniqueCourses.length} cursos duplicados`);
    }
    
    // Limpiar clases duplicadas
    const classes = JSON.parse(localStorage.getItem('my_classes') || '[]');
    const uniqueClasses = [];
    const seenClassTitles = new Set();
    
    classes.forEach(cls => {
        const key = `${cls.title}_${cls.createdAt}`;
        if (!seenClassTitles.has(key)) {
            seenClassTitles.add(key);
            // Agregar ID si no existe
            if (!cls.id) {
                cls.id = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }
            uniqueClasses.push(cls);
        }
    });
    
    if (uniqueClasses.length !== classes.length) {
        localStorage.setItem('my_classes', JSON.stringify(uniqueClasses));
        console.log(`🧹 Limpiadas ${classes.length - uniqueClasses.length} clases duplicadas`);
    }
};

AtlasApp.prototype.openProfileEditModal = function() {
    const modal = document.getElementById('profile-edit-modal');
    if (!modal) return;
    
    // Cargar datos actuales del perfil
    this.loadCurrentProfileData();
    
    // Mostrar modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Animar entrada
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
};

AtlasApp.prototype.closeProfileEditModal = function() {
    const modal = document.getElementById('profile-edit-modal');
    if (!modal) return;
    
    // Animar salida
    modal.classList.remove('active');
    
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
};

AtlasApp.prototype.loadCurrentProfileData = function() {
    // Obtener datos actuales del localStorage o valores por defecto
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const profileData = JSON.parse(localStorage.getItem('profile_data') || '{}');
    
    // Cargar datos básicos (usar datos de login si existen)
    const nameInput = document.getElementById('edit-profile-name');
    const emailInput = document.getElementById('edit-profile-email');
    const careerInput = document.getElementById('edit-profile-career');
    const educationLevelSelect = document.getElementById('edit-profile-education-level');
    const bioTextarea = document.getElementById('edit-profile-bio');
    const currentPhoto = document.getElementById('current-profile-photo');
    
    if (nameInput) nameInput.value = profileData.name || userData.name || userData.username || 'María González';
    if (emailInput) emailInput.value = profileData.email || userData.email || 'maria.gonzalez@atlas.com';
    if (careerInput) careerInput.value = profileData.career || 'Ingeniería en Sistemas Computacionales';
    if (educationLevelSelect) educationLevelSelect.value = profileData.educationLevel || 'high_school';
    if (bioTextarea) bioTextarea.value = profileData.bio || 'Estudiante apasionada por las ciencias y la tecnología. Me encanta participar en proyectos de energías renovables y compartir conocimiento con mi comunidad educativa.';
    
    // Cargar foto actual
    if (currentPhoto) {
        currentPhoto.src = profileData.photo || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face';
    }
    
    // Cargar foto de portada actual
    const currentCover = document.getElementById('current-cover-photo');
    if (currentCover) {
        currentCover.src = profileData.coverPhoto || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=150&fit=crop';
    }
    
    // Cargar intereses
    const interests = profileData.interests || ['Física', 'Química', 'Matemáticas', 'Ciencias Ambientales', 'Tecnología'];
    this.loadInterestTags(interests);
};

AtlasApp.prototype.handlePhotoChange = function(event, type) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar tamaño según tipo
    const maxSize = type === 'cover' ? 5 * 1024 * 1024 : 2 * 1024 * 1024; // 5MB para portada, 2MB para perfil
    const sizeText = type === 'cover' ? '5MB' : '2MB';
    
    if (file.size > maxSize) {
        this.showNotification(`La imagen es demasiado grande (máx. ${sizeText})`, 'error');
        event.target.value = '';
        return;
    }
    
    // Validar tipo
    if (!file.type.startsWith('image/')) {
        this.showNotification('Por favor selecciona una imagen válida', 'error');
        event.target.value = '';
        return;
    }
    
    // Crear FileReader para preview
    const reader = new FileReader();
    reader.onload = (e) => {
        if (type === 'profile') {
            const currentPhoto = document.getElementById('current-profile-photo');
            if (currentPhoto) {
                currentPhoto.src = e.target.result;
            }
            // Guardar la imagen en base64 temporalmente
            this.tempPhotoData = e.target.result;
        } else if (type === 'cover') {
            const currentCover = document.getElementById('current-cover-photo');
            if (currentCover) {
                currentCover.src = e.target.result;
            }
            // Guardar la imagen de portada en base64 temporalmente
            this.tempCoverData = e.target.result;
        }
    };
    
    reader.readAsDataURL(file);
};

AtlasApp.prototype.loadInterestTags = function(interests) {
    const container = document.getElementById('interests-tags');
    if (!container) return;
    
    container.innerHTML = '';
    
    interests.forEach(interest => {
        this.createInterestTag(interest, container);
    });
};

AtlasApp.prototype.addInterestTag = function(interest) {
    if (!interest) return;
    
    const container = document.getElementById('interests-tags');
    if (!container) return;
    
    // Verificar que no exista ya
    const existingTags = Array.from(container.querySelectorAll('.interest-tag span')).map(span => span.textContent);
    if (existingTags.includes(interest)) {
        this.showNotification('Este tema ya está agregado', 'info');
        return;
    }
    
    this.createInterestTag(interest, container);
};

AtlasApp.prototype.createInterestTag = function(interest, container) {
    const tag = document.createElement('div');
    tag.className = 'interest-tag';
    tag.innerHTML = `
        <span>${interest}</span>
        <button type="button" class="remove-tag" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(tag);
};

AtlasApp.prototype.saveProfileChanges = function() {
    const nameInput = document.getElementById('edit-profile-name');
    const emailInput = document.getElementById('edit-profile-email');
    const careerInput = document.getElementById('edit-profile-career');
    const bioTextarea = document.getElementById('edit-profile-bio');
    const interestTags = document.querySelectorAll('#interests-tags .interest-tag span');
    
    // Validar campos requeridos incluyendo email y nivel educativo
    const educationLevelSelect = document.getElementById('edit-profile-education-level');
    
    if (!nameInput.value.trim() || !emailInput.value.trim() || !careerInput.value.trim() || !educationLevelSelect.value) {
        this.showNotification('Por favor completa todos los campos requeridos', 'error');
        return;
    }
    
    // Validar que el email coincida con el del login
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    if (userData.email && emailInput.value.trim() !== userData.email) {
        this.showNotification('El correo electrónico debe coincidir con tu correo de inicio de sesión', 'error');
        return;
    }
    
    // Recopilar intereses
    const interests = Array.from(interestTags).map(span => span.textContent);
    
    // Crear objeto de datos del perfil
    const profileData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        career: careerInput.value.trim(),
        educationLevel: educationLevelSelect.value,
        bio: bioTextarea.value.trim(),
        interests: interests,
        photo: this.tempPhotoData || document.getElementById('current-profile-photo').src,
        coverPhoto: this.tempCoverData || document.getElementById('current-cover-photo').src,
        updatedAt: new Date().toISOString()
    };
    
    // Simular guardado con loading
    const saveBtn = document.getElementById('save-profile-changes');
    const originalText = saveBtn.innerHTML;
    
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Guardando...</span>';
    saveBtn.disabled = true;
    
    setTimeout(() => {
        // Guardar en localStorage
        localStorage.setItem('profile_data', JSON.stringify(profileData));
        
        // También actualizar user_data para sincronizar con login
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        userData.name = profileData.name;
        userData.email = profileData.email;
        userData.photo = profileData.photo;
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        // Actualizar interfaz
        this.updateProfileDisplay(profileData);
        
        // Limpiar fotos temporales
        this.tempPhotoData = null;
        this.tempCoverData = null;
        
        // Restaurar botón
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
        
        // Cerrar modal
        this.closeProfileEditModal();
        
        // Notificar éxito
        this.showNotification('¡Perfil actualizado exitosamente!', 'success');
        
    }, 1500);
};

AtlasApp.prototype.updateProfileDisplay = function(profileData) {
    // Actualizar nombre
    const profileDisplayName = document.getElementById('profile-display-name');
    const profileName = document.getElementById('profile-name');
    const dropdownName = document.getElementById('dropdown-name');
    
    if (profileDisplayName) profileDisplayName.textContent = profileData.name;
    if (profileName) profileName.textContent = profileData.name;
    if (dropdownName) dropdownName.textContent = profileData.name;
    
    // Actualizar email
    const profileEmailDisplay = document.getElementById('profile-email-display');
    const profileEmail = document.getElementById('profile-email');
    const dropdownEmail = document.getElementById('dropdown-email');
    
    if (profileEmailDisplay) profileEmailDisplay.textContent = profileData.email;
    if (profileEmail) profileEmail.textContent = profileData.email;
    if (dropdownEmail) dropdownEmail.textContent = profileData.email;
    
    // Actualizar foto de perfil en todos los lugares
    if (profileData.photo) {
        const profileImages = [
            document.getElementById('user-profile-image'),
            document.querySelector('.dropdown-avatar img'),
            document.querySelector('.sidebar-user-avatar img'),
            document.querySelector('.profile-cover .profile-avatar img'),
            document.querySelector('.profile-avatar-large img')
        ];
        
        profileImages.forEach(img => {
            if (img) img.src = profileData.photo;
        });
    }
    
    // Actualizar foto de portada
    if (profileData.coverPhoto) {
        const coverImage = document.getElementById('cover-image');
        if (coverImage) {
            coverImage.src = profileData.coverPhoto;
        }
    }
    
    // Actualizar carrera
    const profileCareer = document.getElementById('profile-career');
    if (profileCareer) profileCareer.textContent = profileData.career;
    
    // Actualizar nivel educativo
    if (profileData.educationLevel) {
        const educationInfo = document.querySelector('.education-info');
        if (educationInfo) {
            const levelText = this.getEducationLevelText(profileData.educationLevel);
            educationInfo.innerHTML = `<p><strong>${levelText}</strong></p>`;
        }
    }
    
    // Actualizar biografía
    const profileBio = document.getElementById('profile-bio');
    if (profileBio) {
        profileBio.innerHTML = `<p>${profileData.bio || 'Sin biografía disponible.'}</p>`;
    }
    
    // Actualizar temas de interés
    const subjectsTags = document.getElementById('subjects-tags');
    if (subjectsTags && profileData.interests) {
        subjectsTags.innerHTML = '';
        profileData.interests.forEach(interest => {
            const tag = document.createElement('span');
            tag.className = 'subject-tag';
            tag.textContent = interest;
            subjectsTags.appendChild(tag);
        });
    }
    
    // Actualizar sidebar si existe
    this.updateSidebarUserInfo();
};

AtlasApp.prototype.getEducationLevelText = function(level) {
    const levels = {
        'high_school': 'Bachillerato',
        'technical': 'Técnico',
        'university': 'Universidad',
        'graduate': 'Posgrado'
    };
    return levels[level] || 'No especificado';
};

// ===== COMPOSITOR DE PUBLICACIONES =====

AtlasApp.prototype.setupPostComposer = function() {
    console.log('📝 Configurando compositor de publicaciones...');
    
    // Elementos principales
    const openCreatePostBtn = document.getElementById('open-create-post');
    const addPhotoBtn = document.getElementById('add-photo-btn');
    const createPostModal = document.getElementById('create-post-modal');
    const closeCreatePostModal = document.getElementById('close-create-post-modal');
    const cancelCreatePost = document.getElementById('cancel-create-post');
    const publishPostBtn = document.getElementById('publish-post-btn');
    
    // Elementos del modal
    const postTextarea = document.getElementById('post-text');
    const charCount = document.getElementById('char-count');
    const addImageBtn = document.getElementById('add-image-btn');
    const postMediaInput = document.getElementById('post-media-input');
    const postMediaPreview = document.getElementById('post-media-preview');
    const mediaContainer = document.getElementById('media-container');
    const removeMediaBtn = document.getElementById('remove-media-btn');
    
    // Variables para manejar archivos
    this.selectedPostFiles = [];
    
    // Abrir modal
    if (openCreatePostBtn) {
        openCreatePostBtn.addEventListener('click', () => {
            this.openCreatePostModal();
        });
    }
    
    // Abrir modal desde el botón de foto
    if (addPhotoBtn) {
        addPhotoBtn.addEventListener('click', () => {
            this.openCreatePostModal();
            setTimeout(() => {
                if (postMediaInput) postMediaInput.click();
            }, 100);
        });
    }
    
    // Cerrar modal
    if (closeCreatePostModal) {
        closeCreatePostModal.addEventListener('click', () => {
            this.closeCreatePostModal();
        });
    }
    
    if (cancelCreatePost) {
        cancelCreatePost.addEventListener('click', () => {
            this.closeCreatePostModal();
        });
    }
    
    // Contador de caracteres
    if (postTextarea) {
        postTextarea.addEventListener('input', () => {
            this.updateCharacterCount();
            this.updatePublishButton();
        });
    }
    
    // Subir imágenes
    if (addImageBtn) {
        addImageBtn.addEventListener('click', () => {
            if (postMediaInput) postMediaInput.click();
        });
    }
    
    if (postMediaInput) {
        postMediaInput.addEventListener('change', (e) => {
            this.handlePostMediaUpload(e);
        });
    }
    
    // Remover medios
    if (removeMediaBtn) {
        removeMediaBtn.addEventListener('click', () => {
            this.removeAllPostMedia();
        });
    }
    
    // Publicar post con protección extra
    if (publishPostBtn) {
        publishPostBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.publishPost();
        });
        
        // Prevenir doble clic
        publishPostBtn.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    }
    
    console.log('✅ Compositor de publicaciones configurado');
};

AtlasApp.prototype.openCreatePostModal = function() {
    const modal = document.getElementById('create-post-modal');
    const modalUserName = document.getElementById('modal-user-name');
    const modalUserAvatar = document.getElementById('modal-user-avatar');
    
    // Actualizar información del usuario en el modal
    const userData = JSON.parse(localStorage.getItem('profile_data') || localStorage.getItem('user_data') || '{}');
    if (modalUserName) {
        modalUserName.textContent = userData.name || 'Usuario';
    }
    if (modalUserAvatar && userData.photo) {
        modalUserAvatar.src = userData.photo;
        // Forzar estilos correctos con máxima prioridad
        modalUserAvatar.style.cssText = `
            width: 50px !important;
            height: 50px !important;
            border-radius: 50% !important;
            object-fit: cover !important;
            display: block !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            outline: none !important;
            box-sizing: border-box !important;
            clip-path: circle(25px at 50% 50%) !important;
        `;
    }
    
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Focus en el textarea
        setTimeout(() => {
            const postTextarea = document.getElementById('post-text');
            if (postTextarea) {
                postTextarea.focus();
            }
        }, 100);
    }
};

AtlasApp.prototype.closeCreatePostModal = function() {
    const modal = document.getElementById('create-post-modal');
    
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Limpiar formulario
        this.clearPostForm();
        
        // Resetear flag de publicación por si acaso
        this.isPublishing = false;
    }
};

AtlasApp.prototype.clearPostForm = function() {
    const postTextarea = document.getElementById('post-text');
    const charCount = document.getElementById('char-count');
    const publishBtn = document.getElementById('publish-post-btn');
    
    if (postTextarea) postTextarea.value = '';
    if (charCount) charCount.textContent = '0';
    if (publishBtn) publishBtn.disabled = true;
    
    // Limpiar archivos seleccionados
    this.selectedPostFiles = [];
    this.removeAllPostMedia();
    
    // Resetear flag de publicación por seguridad
    this.isPublishing = false;
};

AtlasApp.prototype.updateCharacterCount = function() {
    const postTextarea = document.getElementById('post-text');
    const charCount = document.getElementById('char-count');
    const charCountContainer = document.querySelector('.character-count');
    
    if (postTextarea && charCount) {
        const count = postTextarea.value.length;
        charCount.textContent = count;
        
        // Cambiar color según la cantidad
        if (charCountContainer) {
            charCountContainer.classList.remove('warning', 'error');
            
            if (count > 1800) {
                charCountContainer.classList.add('error');
            } else if (count > 1500) {
                charCountContainer.classList.add('warning');
            }
        }
    }
};

AtlasApp.prototype.updatePublishButton = function() {
    const postTextarea = document.getElementById('post-text');
    const publishBtn = document.getElementById('publish-post-btn');
    
    if (postTextarea && publishBtn) {
        const hasText = postTextarea.value.trim().length > 0;
        const hasMedia = this.selectedPostFiles.length > 0;
        
        publishBtn.disabled = !(hasText || hasMedia);
    }
};

AtlasApp.prototype.handlePostMediaUpload = function(event) {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    // Validar archivos - SOLO IMÁGENES
    for (const file of files) {
        // Solo permitir imágenes
        if (!file.type.startsWith('image/')) {
            this.showNotification('Solo se permiten imágenes', 'error');
            return;
        }
        
        // Validar tamaño (máximo 10MB por imagen)
        if (file.size > 10 * 1024 * 1024) {
            this.showNotification('La imagen es demasiado grande (máx. 10MB)', 'error');
            return;
        }
    }
    
    // Limitar a 4 imágenes máximo
    const totalFiles = this.selectedPostFiles.length + files.length;
    if (totalFiles > 4) {
        this.showNotification('Máximo 4 imágenes por publicación', 'error');
        return;
    }
    
    // Agregar archivos
    files.forEach(file => {
        this.selectedPostFiles.push(file);
    });
    
    // Actualizar vista previa
    this.updateMediaPreview();
    this.updatePublishButton();
    
    // Limpiar input para permitir seleccionar los mismos archivos de nuevo
    event.target.value = '';
};

AtlasApp.prototype.updateMediaPreview = function() {
    const postMediaPreview = document.getElementById('post-media-preview');
    const mediaContainer = document.getElementById('media-container');
    
    if (!postMediaPreview || !mediaContainer) return;
    
    if (this.selectedPostFiles.length === 0) {
        postMediaPreview.style.display = 'none';
        return;
    }
    
    postMediaPreview.style.display = 'block';
    mediaContainer.innerHTML = '';
    
    // Configurar grid según cantidad de imágenes
    mediaContainer.className = 'media-container';
    if (this.selectedPostFiles.length === 1) {
        mediaContainer.classList.add('single');
    } else if (this.selectedPostFiles.length === 2) {
        mediaContainer.classList.add('double');
    } else {
        mediaContainer.classList.add('multiple');
    }
    
    // Crear elementos de vista previa para imágenes
    this.selectedPostFiles.forEach((file, index) => {
        const mediaItem = document.createElement('div');
        mediaItem.className = 'media-item';
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'media-item-remove';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.addEventListener('click', () => {
            this.removePostMedia(index);
        });
        
        // Solo crear elementos de imagen
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = 'Vista previa';
        mediaItem.appendChild(img);
        
        mediaItem.appendChild(removeBtn);
        mediaContainer.appendChild(mediaItem);
    });
};

AtlasApp.prototype.removePostMedia = function(index) {
    this.selectedPostFiles.splice(index, 1);
    this.updateMediaPreview();
    this.updatePublishButton();
};

AtlasApp.prototype.removeAllPostMedia = function() {
    this.selectedPostFiles = [];
    this.updateMediaPreview();
    this.updatePublishButton();
};

AtlasApp.prototype.publishPost = function() {
    // PROTECCIÓN MÚLTIPLE CONTRA PUBLICACIONES DUPLICADAS
    if (this.isPublishing) {
        console.log('⏳ Ya se está publicando, ignorando clic adicional');
        return;
    }
    
    const postTextarea = document.getElementById('post-text');
    const publishBtn = document.getElementById('publish-post-btn');
    
    if (!postTextarea || !publishBtn) return;
    
    // Verificar si el botón ya está deshabilitado
    if (publishBtn.disabled) {
        console.log('⏳ Botón ya deshabilitado, ignorando clic');
        return;
    }
    
    const text = postTextarea.value.trim();
    const hasMedia = this.selectedPostFiles.length > 0;
    
    if (!text && !hasMedia) {
        this.showNotification('Escribe algo o agrega una imagen para publicar', 'error');
        return;
    }
    
    // Marcar como publicando
    this.isPublishing = true;
    
    // Deshabilitar botón mientras se publica
    publishBtn.disabled = true;
    const originalText = publishBtn.innerHTML;
    publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Publicando...</span>';
    
    // Simular publicación
    setTimeout(() => {
        const postData = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            text: text,
            images: this.selectedPostFiles.map(file => ({
                name: file.name,
                url: URL.createObjectURL(file) // En producción sería una URL real
            })),
            author: JSON.parse(localStorage.getItem('profile_data') || localStorage.getItem('user_data') || '{}'),
            timestamp: new Date().toISOString(),
            likes: 0,
            comments: []
        };
        
        // Guardar en localStorage
        const posts = JSON.parse(localStorage.getItem('user_posts') || '[]');
        posts.unshift(postData); // Agregar al inicio
        localStorage.setItem('user_posts', JSON.stringify(posts));
        
        // Agregar al feed
        this.addPostToFeed(postData);
        
        // Mostrar notificación
        this.showNotification('¡Publicación creada exitosamente!', 'success');
        
        // Cerrar modal
        this.closeCreatePostModal();
        
        // Restaurar botón
        publishBtn.innerHTML = originalText;
        publishBtn.disabled = false;
        
        // Liberar flag de publicación
        this.isPublishing = false;
        
    }, 1000); // Reducido a 1 segundo para respuesta más rápida
};

AtlasApp.prototype.addPostToFeed = function(postData) {
    const feedPosts = document.getElementById('feed-posts');
    if (!feedPosts) return;
    
    const postElement = this.createPostElement(postData);
    feedPosts.insertBefore(postElement, feedPosts.firstChild);
};

AtlasApp.prototype.createPostElement = function(postData) {
    const article = document.createElement('article');
    article.className = 'post-card';
    article.dataset.postId = postData.id;
    
    const timeAgo = this.getTimeAgo(new Date(postData.timestamp));
    
    // Crear HTML para imágenes con tamaños apropiados
    let imagesHTML = '';
    if (postData.images && postData.images.length > 0) {
        imagesHTML = '<div class="post-images';
        
        // Agregar clase según cantidad de imágenes
        if (postData.images.length === 1) {
            imagesHTML += ' single-image';
        } else if (postData.images.length === 2) {
            imagesHTML += ' two-images';
        } else if (postData.images.length === 3) {
            imagesHTML += ' three-images';
        } else {
            imagesHTML += ' four-images';
        }
        
        imagesHTML += '">';
        
        postData.images.forEach((image, index) => {
            imagesHTML += `<div class="post-image-container">
                <img src="${image.url}" alt="Imagen de publicación" class="post-image">
            </div>`;
        });
        
        imagesHTML += '</div>';
    }
    
    article.innerHTML = `
        <div class="post-header">
            <div class="post-user">
                <div class="user-avatar">
                    <img src="${postData.author.photo || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'}" alt="${postData.author.name || 'Usuario'}">
                </div>
                <div class="user-info">
                    <h3>${postData.author.name || 'Usuario'}</h3>
                    <p>${timeAgo}</p>
                </div>
            </div>
            <button class="post-options-btn">
                <i class="fas fa-ellipsis-h"></i>
            </button>
        </div>
        
        ${postData.text ? `<div class="post-content"><p>${postData.text}</p></div>` : ''}
        
        ${imagesHTML}
        
        <div class="post-stats">
            <span class="stat-item">
                <i class="fas fa-heart"></i>
                ${postData.likes} reacciones
            </span>
            <span class="stat-item">
                <i class="fas fa-comment"></i>
                ${postData.comments.length} comentarios
            </span>
        </div>
        
        <div class="post-actions">
            <button class="action-btn reaction-btn" data-reaction="like">
                <i class="fas fa-heart"></i>
                <span>Me gusta</span>
            </button>
            <button class="action-btn comment-btn">
                <i class="fas fa-comment"></i>
                <span>Comentar</span>
            </button>
        </div>
    `;
    
    // Forzar estilos circulares en la imagen de perfil
    setTimeout(() => {
        const avatarImg = article.querySelector('.user-avatar img');
        if (avatarImg) {
            avatarImg.style.cssText = `
                width: 40px !important;
                height: 40px !important;
                border-radius: 50% !important;
                object-fit: cover !important;
                display: block !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                outline: none !important;
                box-sizing: border-box !important;
                clip-path: circle(20px at 50% 50%) !important;
            `;
        }
    }, 10);
    
    return article;
};

AtlasApp.prototype.getTimeAgo = function(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Ahora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
    
    return date.toLocaleDateString();
};

AtlasApp.prototype.fixExistingPostAvatars = function() {
    console.log('🔧 Arreglando avatares en publicaciones existentes...');
    
    // Buscar todas las imágenes de perfil en publicaciones
    const postAvatars = document.querySelectorAll('.post-card .post-user .user-avatar img');
    
    postAvatars.forEach(avatarImg => {
        if (avatarImg) {
            avatarImg.style.cssText = `
                width: 40px !important;
                height: 40px !important;
                border-radius: 50% !important;
                object-fit: cover !important;
                display: block !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                outline: none !important;
                box-sizing: border-box !important;
                clip-path: circle(20px at 50% 50%) !important;
            `;
        }
    });
    
    console.log(`✅ ${postAvatars.length} avatares arreglados en publicaciones`);
};

// Configuración del botón premium
AtlasApp.prototype.setupPremiumButton = function() {
    const premiumBtn = document.getElementById('premium-btn');
    if (premiumBtn) {
        premiumBtn.addEventListener('click', () => {
            this.showPremiumModal();
        });
    }
    
    // Configurar modal premium
    this.setupPremiumModal();
};

// Configuración del modal premium
AtlasApp.prototype.setupPremiumModal = function() {
    const modal = document.getElementById('premium-modal');
    const closeBtn = document.getElementById('close-premium-modal');
    const upgradeBtn = document.getElementById('upgrade-to-premium');
    const trialBtn = document.getElementById('start-free-trial');
    
    if (!modal) return;
    
    // Cerrar modal
    closeBtn.addEventListener('click', () => {
        this.closePremiumModal();
    });
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            this.closePremiumModal();
        }
    });
    
    // Cerrar modal con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            this.closePremiumModal();
        }
    });
    
    // Botón de actualizar a premium
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', () => {
            this.processPremiumUpgrade();
        });
    }
    
    // Botón de prueba gratuita
    if (trialBtn) {
        trialBtn.addEventListener('click', () => {
            this.startFreeTrial();
        });
    }
    
    // Configurar sección de pago
    this.setupPaymentSection();
};

AtlasApp.prototype.showPremiumModal = function() {
    const modal = document.getElementById('premium-modal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
};

AtlasApp.prototype.closePremiumModal = function() {
    const modal = document.getElementById('premium-modal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
};

AtlasApp.prototype.processPremiumUpgrade = function() {
    // Mostrar sección de pago
    this.showPaymentSection();
};

AtlasApp.prototype.startFreeTrial = function() {
    // Simular inicio de prueba gratuita
    const trialBtn = document.getElementById('start-free-trial');
    const originalText = trialBtn.innerHTML;
    
    trialBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Iniciando...</span>';
    trialBtn.disabled = true;
    
    setTimeout(() => {
        this.showNotification('¡Prueba gratuita activada! Disfruta 7 días de Atlas Premium.', 'success');
        this.closePremiumModal();
        
        // Restaurar botón
        trialBtn.innerHTML = originalText;
        trialBtn.disabled = false;
        
        // Aquí podrías activar la prueba gratuita
        // this.currentUser.trialStartDate = new Date();
        // this.updateUserInterface();
        
    }, 2000);
};

// Configuración de la sección de pago
AtlasApp.prototype.setupPaymentSection = function() {
    const backBtn = document.getElementById('back-to-premium');
    const completePaymentBtn = document.getElementById('complete-payment');
    const billingRadios = document.querySelectorAll('input[name="billing"]');
    const cardNumberInput = document.getElementById('card-number');
    const expiryInput = document.getElementById('expiry-date');
    const cvvInput = document.getElementById('cvv');
    
    // Botón de volver
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            this.hidePaymentSection();
        });
    }
    
    // Botón de completar pago
    if (completePaymentBtn) {
        completePaymentBtn.addEventListener('click', () => {
            this.processPayment();
        });
    }
    
    // Cambio de ciclo de facturación
    billingRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            this.updatePricingSummary(radio.value);
        });
    });
    
    // Formatear número de tarjeta
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (e) => {
            this.formatCardNumber(e.target);
        });
    }
    
    // Formatear fecha de vencimiento
    if (expiryInput) {
        expiryInput.addEventListener('input', (e) => {
            this.formatExpiryDate(e.target);
        });
    }
    
    // Validar CVV
    if (cvvInput) {
        cvvInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
};

AtlasApp.prototype.showPaymentSection = function() {
    const premiumCta = document.querySelector('.premium-cta');
    const planComparison = document.querySelector('.plan-comparison');
    const premiumBenefits = document.querySelector('.premium-benefits');
    const paymentSection = document.getElementById('premium-payment-section');
    
    if (premiumCta) premiumCta.style.display = 'none';
    if (planComparison) planComparison.style.display = 'none';
    if (premiumBenefits) premiumBenefits.style.display = 'none';
    if (paymentSection) {
        paymentSection.style.display = 'block';
        // Pre-llenar email si está disponible
        const billingEmail = document.getElementById('billing-email');
        if (billingEmail && this.currentUser) {
            billingEmail.value = this.currentUser.email;
        }
    }
};

AtlasApp.prototype.hidePaymentSection = function() {
    const premiumCta = document.querySelector('.premium-cta');
    const planComparison = document.querySelector('.plan-comparison');
    const premiumBenefits = document.querySelector('.premium-benefits');
    const paymentSection = document.getElementById('premium-payment-section');
    
    if (premiumCta) premiumCta.style.display = 'block';
    if (planComparison) planComparison.style.display = 'block';
    if (premiumBenefits) premiumBenefits.style.display = 'block';
    if (paymentSection) paymentSection.style.display = 'none';
};

AtlasApp.prototype.updatePricingSummary = function(billingCycle) {
    const subscriptionAmount = document.getElementById('subscription-amount');
    const taxAmount = document.getElementById('tax-amount');
    const totalAmount = document.getElementById('total-amount');
    
    let price, tax, total;
    
    if (billingCycle === 'yearly') {
        // Precio mensual: $99.00 (IVA incluido)
        // Precio base mensual: $85.34
        // IVA mensual: $13.66
        // Para anual: ($85.34 * 12 meses * 0.85) = $870.47 (precio base)
        // IVA anual: $870.47 * 0.16 = $139.28
        // Total anual: $870.47 + $139.28 = $1,009.75
        price = 1009.75; // Precio final anual con IVA incluido
        tax = 139.28;    // IVA sobre el precio base anual
        total = 1009.75; // Total igual al precio (IVA incluido)
    } else {
        price = 99.00;   // Precio final mensual con IVA incluido
        tax = 13.66;     // IVA sobre el precio base mensual ($85.34)
        total = 99.00;   // Total igual al precio (IVA incluido)
    }
    
    if (subscriptionAmount) subscriptionAmount.textContent = `$${price.toFixed(2)}`;
    if (taxAmount) taxAmount.textContent = `$${tax.toFixed(2)}`;
    if (totalAmount) totalAmount.textContent = `$${total.toFixed(2)}`;
};

AtlasApp.prototype.formatCardNumber = function(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    input.value = value;
};

AtlasApp.prototype.formatExpiryDate = function(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
};

AtlasApp.prototype.validatePaymentForm = function() {
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const expiryDate = document.getElementById('expiry-date').value;
    const cvv = document.getElementById('cvv').value;
    const cardholderName = document.getElementById('cardholder-name').value;
    const billingEmail = document.getElementById('billing-email').value;
    
    if (!cardNumber || cardNumber.length < 13) {
        this.showNotification('Por favor ingresa un número de tarjeta válido', 'error');
        return false;
    }
    
    if (!expiryDate || expiryDate.length !== 5) {
        this.showNotification('Por favor ingresa una fecha de vencimiento válida', 'error');
        return false;
    }
    
    if (!cvv || cvv.length < 3) {
        this.showNotification('Por favor ingresa un CVV válido', 'error');
        return false;
    }
    
    if (!cardholderName.trim()) {
        this.showNotification('Por favor ingresa el nombre del titular', 'error');
        return false;
    }
    
    if (!billingEmail || !billingEmail.includes('@')) {
        this.showNotification('Por favor ingresa un email válido', 'error');
        return false;
    }
    
    return true;
};

AtlasApp.prototype.processPayment = function() {
    if (!this.validatePaymentForm()) {
        return;
    }
    
    const completePaymentBtn = document.getElementById('complete-payment');
    const originalText = completePaymentBtn.innerHTML;
    
    completePaymentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Procesando pago...</span>';
    completePaymentBtn.disabled = true;
    
    // Simular procesamiento de pago
    setTimeout(() => {
        this.showNotification('¡Pago procesado exitosamente! Bienvenido a Atlas Premium.', 'success');
        this.closePremiumModal();
        
        // Restaurar botón
        completePaymentBtn.innerHTML = originalText;
        completePaymentBtn.disabled = false;
        
        // Limpiar formulario
        this.clearPaymentForm();
        this.hidePaymentSection();
        
        // Aquí podrías actualizar el estado del usuario a premium
        // this.currentUser.isPremium = true;
        // this.updateUserInterface();
        
    }, 3000);
};

AtlasApp.prototype.clearPaymentForm = function() {
    document.getElementById('card-number').value = '';
    document.getElementById('expiry-date').value = '';
    document.getElementById('cvv').value = '';
    document.getElementById('cardholder-name').value = '';
    document.getElementById('billing-email').value = '';
    document.querySelector('input[name="billing"][value="monthly"]').checked = true;
    this.updatePricingSummary('monthly');
};

// Configuración de la sidebar
AtlasApp.prototype.setupSidebar = function() {
    // Actualizar información del usuario en sidebar
    this.updateSidebarUserInfo();
    
    // Configurar botones de sidebar
    const sidebarProfileBtn = document.getElementById('sidebar-profile-btn');
    const sidebarAchievementsBtn = document.getElementById('sidebar-achievements-btn');
    const sidebarProgressBtn = document.getElementById('sidebar-progress-btn');
    const sidebarLogoutBtn = document.getElementById('sidebar-logout-btn');
    
    if (sidebarProfileBtn) {
        sidebarProfileBtn.addEventListener('click', () => {
            this.showProfilePage();
        });
    }
    
    if (sidebarAchievementsBtn) {
        sidebarAchievementsBtn.addEventListener('click', () => {
            this.showAchievementsPage();
        });
    }
    
    if (sidebarProgressBtn) {
        sidebarProgressBtn.addEventListener('click', () => {
            console.log('🔄 Botón de avances del sidebar clickeado');
            this.showProgressPage();
        });
    }
    
    if (sidebarLogoutBtn) {
        sidebarLogoutBtn.addEventListener('click', () => {
            this.logout();
        });
    }
    
    // Configurar toggle de modo oscuro en sidebar
    this.setupSidebarDarkMode();
    
    // Configurar selector de idioma en sidebar
    this.setupSidebarLanguage();
};

AtlasApp.prototype.updateSidebarUserInfo = function() {
    if (!this.currentUser) return;
    
    const sidebarName = document.getElementById('sidebar-profile-name');
    const sidebarEmail = document.getElementById('sidebar-profile-email');
    
    if (sidebarName) {
        sidebarName.textContent = `${this.currentUser.name} ${this.currentUser.lastname}`;
    }
    
    if (sidebarEmail) {
        sidebarEmail.textContent = this.currentUser.email;
    }
};

AtlasApp.prototype.setupSidebarDarkMode = function() {
    const sidebarToggle = document.getElementById('sidebar-dark-mode-toggle');
    
    if (sidebarToggle) {
        // Sincronizar con el estado actual
        const currentTheme = localStorage.getItem('theme');
        sidebarToggle.checked = currentTheme === 'dark';
        
        sidebarToggle.addEventListener('change', (e) => {
            const theme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            
            // Sincronizar con el toggle del header si existe
            const headerToggle = document.getElementById('dark-mode-toggle');
            if (headerToggle) {
                headerToggle.checked = e.target.checked;
            }
        });
    }
};

AtlasApp.prototype.setupSidebarLanguage = function() {
    const languageOptions = document.querySelectorAll('.sidebar-language-options .language-option');
    
    languageOptions.forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.getAttribute('data-lang');
            
            // Remover clase active de todas las opciones
            languageOptions.forEach(opt => opt.classList.remove('active'));
            
            // Agregar clase active a la opción seleccionada
            option.classList.add('active');
            
            // Cambiar idioma
            this.setLanguage(lang);
        });
    });
    
    // Sincronizar con el idioma actual
    const currentLang = localStorage.getItem('language') || 'es';
    languageOptions.forEach(option => {
        if (option.getAttribute('data-lang') === currentLang) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
};

AtlasApp.prototype.logout = function() {
    localStorage.removeItem('currentUser');
    this.currentUser = null;
    this.showScreen('welcome-screen');
    this.showNotification(this.getTranslation('notifications.logout_success') || 'Sesión cerrada correctamente', 'success');
};

// Configuración de la sección de donación
AtlasApp.prototype.setupDonationSection = function() {
    // Configurar selector de tipo de donación
    const donationTypeBtns = document.querySelectorAll('.donation-type-btn');
    donationTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            this.switchDonationType(btn.getAttribute('data-type'));
        });
    });

    // Configurar búsqueda de usuario
    const userSearchInput = document.getElementById('user-search');
    if (userSearchInput) {
        userSearchInput.addEventListener('input', (e) => {
            this.searchUsers(e.target.value);
        });
    }

    // Configurar selección de usuarios destacados
    const featuredBtns = document.querySelectorAll('.select-featured-btn');
    featuredBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const userCard = e.target.closest('.featured-user-card');
            this.selectFeaturedUser(userCard);
        });
    });

    // Configurar selector de membresías
    const membershipBtns = document.querySelectorAll('.membership-btn');
    membershipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            this.selectMembershipAmount(btn);
        });
    });

    // Configurar cantidad personalizada
    const customInput = document.getElementById('custom-membership-amount');
    const customPrice = document.getElementById('custom-price');
    if (customInput && customPrice) {
        customInput.addEventListener('input', (e) => {
            this.updateCustomPrice(e.target.value, customPrice);
        });
    }

    // Configurar confirmación de donación
    const confirmBtn = document.getElementById('confirm-donation-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            this.processMembershipDonation();
        });
    }

    // Configurar donación masiva
    const bulkInput = document.getElementById('bulk-membership-amount');
    const bulkPrice = document.getElementById('bulk-price');
    if (bulkInput && bulkPrice) {
        bulkInput.addEventListener('input', (e) => {
            this.updateBulkPrice(e.target.value, bulkPrice);
        });
    }

    // Configurar confirmación de donación masiva
    const confirmBulkBtn = document.getElementById('confirm-bulk-donation-btn');
    if (confirmBulkBtn) {
        confirmBulkBtn.addEventListener('click', () => {
            this.processBulkDonation();
        });
    }

    // Variables para el estado de la donación
    this.selectedUser = null;
    this.selectedAmount = 0;
            this.membershipPrice = 25.00; // Precio base por membresía en pesos mexicanos
    
    // Sistema de precios con descuentos por mayoreo
    this.bulkPricingTiers = [
        { min: 1, max: 20, price: 25.00, discount: 0 },
        { min: 21, max: 35, price: 25.00, discount: 0 },
        { min: 36, max: 50, price: 25.00, discount: 0 }
    ];
};

AtlasApp.prototype.switchDonationType = function(type) {
    // Actualizar botones
    document.querySelectorAll('.donation-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('active');

    // Mostrar/ocultar secciones
    document.querySelectorAll('.donation-section').forEach(section => {
        section.classList.remove('active');
    });

    if (type === 'specific') {
        document.getElementById('specific-donation').classList.add('active');
    } else if (type === 'bulk') {
        document.getElementById('bulk-donation').classList.add('active');
    }

    // Resetear selección
    this.resetDonationSelection();
};

AtlasApp.prototype.searchUsers = function(query) {
    const searchResults = document.getElementById('search-results');
    
    if (!query || query.length < 2) {
        searchResults.classList.remove('show');
        return;
    }

    // Simular búsqueda de usuarios
    const mockUsers = [
        { id: 1, name: 'María González', email: 'maria@atlas.com', avatar: 'M' },
        { id: 2, name: 'Carlos Mendoza', email: 'carlos@atlas.com', avatar: 'C' },
        { id: 3, name: 'Ana García', email: 'ana@atlas.com', avatar: 'A' },
        { id: 4, name: 'Luis Rodríguez', email: 'luis@atlas.com', avatar: 'L' },
        { id: 5, name: 'Sofia Martín', email: 'sofia@atlas.com', avatar: 'S' }
    ];

    const filteredUsers = mockUsers.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
    );

    this.displaySearchResults(filteredUsers);
};

AtlasApp.prototype.displaySearchResults = function(users) {
    const searchResults = document.getElementById('search-results');
    
    if (users.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No se encontraron usuarios</div>';
    } else {
        searchResults.innerHTML = users.map(user => `
            <div class="search-result-item" data-user-id="${user.id}">
                <div class="search-result-avatar">${user.avatar}</div>
                <div class="search-result-info">
                    <h4>${user.name}</h4>
                    <p>${user.email}</p>
                </div>
            </div>
        `).join('');

        // Añadir event listeners a los resultados
        searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const userId = item.getAttribute('data-user-id');
                const user = users.find(u => u.id == userId);
                this.selectUser(user);
            });
        });
    }
    
    searchResults.classList.add('show');
};

AtlasApp.prototype.selectUser = function(user) {
    this.selectedUser = user;
    
    // Ocultar resultados de búsqueda
    document.getElementById('search-results').classList.remove('show');
    document.getElementById('user-search').value = '';
    
    // Mostrar usuario seleccionado
    const selectedUserContainer = document.getElementById('selected-user-container');
    const selectedUserCard = document.getElementById('selected-user-card');
    
    selectedUserCard.innerHTML = `
        <div class="selected-user-avatar">
            <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--primary-color); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 1.5rem;">
                ${user.avatar}
            </div>
        </div>
        <div class="selected-user-info">
            <h4>${user.name}</h4>
            <p>${user.email}</p>
        </div>
    `;
    
    selectedUserContainer.style.display = 'block';
    this.showMembershipSelector();
};

AtlasApp.prototype.selectFeaturedUser = function(userCard) {
    // Remover selección anterior
    document.querySelectorAll('.featured-user-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Seleccionar nuevo usuario
    userCard.classList.add('selected');
    
    // Obtener datos del usuario
    const userId = userCard.getAttribute('data-user-id');
    const userName = userCard.querySelector('h4').textContent;
    const userInfo = userCard.querySelector('p').textContent;
    
    this.selectedUser = {
        id: userId,
        name: userName,
        email: userInfo,
        avatar: userName.charAt(0)
    };
    
    this.showMembershipSelector();
};

AtlasApp.prototype.showMembershipSelector = function() {
    const membershipSelector = document.getElementById('membership-selector');
    membershipSelector.style.display = 'block';
    
    // Seleccionar automáticamente 1 membresía
    this.selectedAmount = 1;
    const singleMembershipBtn = document.querySelector('.single-membership');
    if (singleMembershipBtn) {
        singleMembershipBtn.classList.add('selected');
    }
    
    // Mostrar resumen inmediatamente
    this.updateDonationSummary();
    
    // Scroll suave hacia el selector
    membershipSelector.scrollIntoView({ behavior: 'smooth' });
};

AtlasApp.prototype.selectMembershipAmount = function(btn) {
    // Remover selección anterior
    document.querySelectorAll('.membership-btn').forEach(button => {
        button.classList.remove('selected');
    });
    
    // Seleccionar nuevo botón
    btn.classList.add('selected');
    
    // Obtener cantidad
    this.selectedAmount = parseInt(btn.getAttribute('data-amount'));
    
    // Limpiar input personalizado
    document.getElementById('custom-membership-amount').value = '';
    
    this.updateDonationSummary();
};

AtlasApp.prototype.updateCustomPrice = function(amount, priceElement) {
    const numAmount = parseInt(amount);
    
    if (numAmount >= 11 && numAmount <= 50) {
        const totalPrice = (numAmount * this.membershipPrice).toFixed(2);
        priceElement.textContent = `$${totalPrice}`;
        
        // Remover selección de botones predefinidos
        document.querySelectorAll('.membership-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        this.selectedAmount = numAmount;
        this.updateDonationSummary();
    } else {
        priceElement.textContent = '$0.00';
        this.selectedAmount = 0;
        this.hideDonationSummary();
    }
};

AtlasApp.prototype.updateDonationSummary = function() {
    if (!this.selectedUser || this.selectedAmount === 0) {
        this.hideDonationSummary();
        return;
    }
    
    const summary = document.getElementById('donation-summary');
    const userName = document.getElementById('summary-user-name');
    const membershipCount = document.getElementById('summary-membership-count');
    const totalPrice = document.getElementById('summary-total-price');
    
    userName.textContent = this.selectedUser.name;
    membershipCount.textContent = this.selectedAmount;
    totalPrice.textContent = `$${(this.selectedAmount * this.membershipPrice).toFixed(2)}`;
    
    summary.style.display = 'block';
    
    // Scroll suave hacia el resumen
    summary.scrollIntoView({ behavior: 'smooth' });
};

AtlasApp.prototype.hideDonationSummary = function() {
    document.getElementById('donation-summary').style.display = 'none';
};

AtlasApp.prototype.processMembershipDonation = function() {
    if (!this.selectedUser) {
        this.showNotification(this.getTranslation('donation.select_user_first') || 'Por favor, selecciona un usuario primero', 'warning');
        return;
    }
    
    if (this.selectedAmount === 0) {
        this.showNotification(this.getTranslation('donation.select_amount_first') || 'Por favor, selecciona una cantidad de membresías', 'warning');
        return;
    }
    
    // Validar cantidad personalizada si es necesaria
    const customAmount = document.getElementById('custom-membership-amount').value;
    if (customAmount && (customAmount < 11 || customAmount > 50)) {
        this.showNotification(this.getTranslation('donation.invalid_custom_amount') || 'La cantidad personalizada debe estar entre 11 y 50', 'warning');
        return;
    }
    
    const confirmBtn = document.getElementById('confirm-donation-btn');
    const originalText = confirmBtn.innerHTML;
    
    // Mostrar estado de carga
    confirmBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>${this.getTranslation('donation.processing_donation') || 'Procesando donación...'}</span>`;
    confirmBtn.disabled = true;
    
    // Simular procesamiento
    setTimeout(() => {
        const successMessage = this.getTranslation('donation.donation_success') || '¡Donación realizada con éxito! {user} ha recibido {amount} membresías.';
        const message = successMessage.replace('{user}', this.selectedUser.name).replace('{amount}', this.selectedAmount);
        
        this.showNotification(message, 'success');
        
        // Restaurar botón
        confirmBtn.innerHTML = originalText;
        confirmBtn.disabled = false;
        
        // Resetear formulario
        this.resetDonationSelection();
        
    }, 2000);
};

AtlasApp.prototype.resetDonationSelection = function() {
    this.selectedUser = null;
    this.selectedAmount = 0;
    
    // Ocultar elementos
    document.getElementById('selected-user-container').style.display = 'none';
    document.getElementById('membership-selector').style.display = 'none';
    document.getElementById('search-results').classList.remove('show');
    document.getElementById('bulk-donation-summary').style.display = 'none';
    
    // Limpiar formularios
    document.getElementById('user-search').value = '';
    document.getElementById('custom-membership-amount').value = '';
    document.getElementById('custom-price').textContent = '$0.00';
    document.getElementById('bulk-membership-amount').value = '';
    document.getElementById('bulk-price').textContent = '$0.00';
    document.getElementById('bulk-discount').style.display = 'none';
    
    // Remover selecciones
    document.querySelectorAll('.membership-btn.selected').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelectorAll('.featured-user-card.selected').forEach(card => {
        card.classList.remove('selected');
    });
};

// Funciones para donación masiva
AtlasApp.prototype.getBulkPrice = function(amount) {
    for (const tier of this.bulkPricingTiers) {
        if (amount >= tier.min && amount <= tier.max) {
            return {
                unitPrice: tier.price,
                totalPrice: (amount * tier.price).toFixed(2),
                discount: tier.discount,
                originalPrice: (amount * this.membershipPrice).toFixed(2)
            };
        }
    }
    return null;
};

AtlasApp.prototype.updateBulkPrice = function(amount, priceElement) {
    const numAmount = parseInt(amount);
    const bulkDiscount = document.getElementById('bulk-discount');
    
    if (numAmount >= 1 && numAmount <= 50) {
        const pricing = this.getBulkPrice(numAmount);
        
        if (pricing) {
            priceElement.textContent = `$${pricing.totalPrice}`;
            
            // Mostrar descuento
            if (pricing.discount > 0) {
                const savings = (parseFloat(pricing.originalPrice) - parseFloat(pricing.totalPrice)).toFixed(2);
                bulkDiscount.textContent = `¡Ahorras $${savings} (-${pricing.discount}%)!`;
                bulkDiscount.style.display = 'inline-block';
            } else {
                bulkDiscount.style.display = 'none';
            }
        }
        
        this.selectedAmount = numAmount;
        this.updateBulkDonationSummary();
    } else {
        priceElement.textContent = '$0.00';
        bulkDiscount.style.display = 'none';
        this.selectedAmount = 0;
        this.hideBulkDonationSummary();
    }
};

AtlasApp.prototype.updateBulkDonationSummary = function() {
    if (this.selectedAmount === 0 || this.selectedAmount < 1 || this.selectedAmount > 50) {
        this.hideBulkDonationSummary();
        return;
    }
    
    const summary = document.getElementById('bulk-donation-summary');
    const membershipCount = document.getElementById('bulk-summary-count');
    const totalPrice = document.getElementById('bulk-summary-price');
    
    const pricing = this.getBulkPrice(this.selectedAmount);
    
    membershipCount.textContent = this.selectedAmount;
    
    if (pricing) {
        totalPrice.textContent = `$${pricing.totalPrice}`;
    } else {
        totalPrice.textContent = `$${(this.selectedAmount * this.membershipPrice).toFixed(2)}`;
    }
    
    summary.style.display = 'block';
    
    // Scroll suave hacia el resumen
    summary.scrollIntoView({ behavior: 'smooth' });
};

AtlasApp.prototype.hideBulkDonationSummary = function() {
    document.getElementById('bulk-donation-summary').style.display = 'none';
};

AtlasApp.prototype.processBulkDonation = function() {
    if (this.selectedAmount === 0 || this.selectedAmount < 1 || this.selectedAmount > 50) {
        this.showNotification(this.getTranslation('donation.invalid_bulk_amount') || 'La cantidad debe estar entre 1 y 50 membresías', 'warning');
        return;
    }
    
    const confirmBtn = document.getElementById('confirm-bulk-donation-btn');
    const originalText = confirmBtn.innerHTML;
    
    // Mostrar estado de carga
    confirmBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>${this.getTranslation('donation.processing_donation') || 'Procesando donación...'}</span>`;
    confirmBtn.disabled = true;
    
    // Simular procesamiento
    setTimeout(() => {
        const successMessage = this.getTranslation('donation.bulk_donation_success') || '¡Donación masiva realizada con éxito! {amount} membresías han sido distribuidas entre usuarios destacados.';
        const message = successMessage.replace('{amount}', this.selectedAmount);
        
        this.showNotification(message, 'success');
        
        // Restaurar botón
        confirmBtn.innerHTML = originalText;
        confirmBtn.disabled = false;
        
        // Resetear formulario
        this.resetDonationSelection();
        
    }, 2000);
};

// ===== VALIDACIÓN DE ESCUELA PARA DESCUENTO =====

// Configuración de validación de escuela para descuento
AtlasApp.prototype.setupSchoolValidation = function() {
    console.log('🎓 Configurando validación de escuela para descuento...');
    
    const validateBtn = document.getElementById('validate-school-btn');
    const verifyEmailBtn = document.getElementById('verify-email-btn');
    const applyDiscountBtn = document.getElementById('apply-discount-btn');
    
    if (validateBtn) {
        validateBtn.addEventListener('click', () => {
            this.validateSchool();
        });
    }
    
    if (verifyEmailBtn) {
        verifyEmailBtn.addEventListener('click', () => {
            this.verifyInstitutionalEmail();
        });
    }
    
    if (applyDiscountBtn) {
        applyDiscountBtn.addEventListener('click', () => {
            this.applyStudentDiscount();
        });
    }
    
    // Configurar formateo automático de la clave
    const schoolClaveInput = document.getElementById('school-clave');
    if (schoolClaveInput) {
        schoolClaveInput.addEventListener('input', (e) => {
            this.formatSchoolClave(e.target);
        });
        
        schoolClaveInput.addEventListener('keypress', (e) => {
            // Solo permitir números y letras
            const char = String.fromCharCode(e.which);
            if (!/[0-9A-Za-z]/.test(char)) {
                e.preventDefault();
            }
        });
    }
    
    console.log('✅ Validación de escuela configurada correctamente');
};

// Validar escuela
AtlasApp.prototype.validateSchool = function() {
    const schoolName = document.getElementById('school-name').value.trim();
    const schoolClave = document.getElementById('school-clave').value.trim();
    
    if (!schoolName || !schoolClave) {
        this.showNotification('Por favor completa todos los campos', 'error');
        return;
    }
    
    // Validar formato de clave (ejemplo: 21PES0001A)
    if (!this.isValidSchoolClave(schoolClave)) {
        this.showNotification('Por favor ingresa una clave de escuela válida', 'error');
        return;
    }
    
    // Simular validación con base de datos usando la clave
    const schoolInfo = this.getSchoolInfoByClave(schoolClave);
    
    if (schoolInfo && schoolInfo.isEligibleForDiscount) {
        this.showValidationResult(true, schoolInfo);
    } else {
        this.showValidationResult(false);
    }
};

// Verificar correo institucional
AtlasApp.prototype.verifyInstitutionalEmail = function() {
    const email = document.getElementById('institutional-email').value.trim();
    
    if (!email) {
        this.showNotification('Por favor ingresa tu correo institucional', 'error');
        return;
    }
    
    if (!this.isValidInstitutionalEmail(email)) {
        this.showNotification('Por favor ingresa un correo institucional válido', 'error');
        return;
    }
    
    // Simular verificación
    this.showNotification('Correo institucional verificado exitosamente', 'success');
    this.showDiscountedPrices();
};

// Aplicar descuento estudiantil
AtlasApp.prototype.applyStudentDiscount = function() {
    this.showNotification('¡Descuento aplicado exitosamente! 🎓', 'success');
    
    // Aquí podrías redirigir al proceso de pago con descuento
    setTimeout(() => {
        // Mostrar sección de pago premium con descuento
        const paymentSection = document.getElementById('premium-payment-section');
        if (paymentSection) {
            paymentSection.style.display = 'block';
        }
    }, 2000);
};

// Mostrar resultado de validación
AtlasApp.prototype.showValidationResult = function(isValid, schoolInfo = null) {
    const validationResult = document.getElementById('validation-result');
    const invalidResult = document.getElementById('invalid-result');
    
    if (isValid && schoolInfo) {
        validationResult.style.display = 'block';
        invalidResult.style.display = 'none';
        
        // Actualizar información de la escuela validada
        this.updateSchoolValidationInfo(schoolInfo);
        
        // Mostrar formulario de correo institucional
        const emailForm = document.getElementById('email-form');
        if (emailForm) {
            emailForm.style.display = 'block';
        }
    } else {
        validationResult.style.display = 'none';
        invalidResult.style.display = 'block';
    }
};

// Mostrar precios con descuento
AtlasApp.prototype.showDiscountedPrices = function() {
    const discountedPrices = document.getElementById('discounted-prices');
    if (discountedPrices) {
        discountedPrices.style.display = 'block';
    }
};

// Verificar formato de clave de escuela
AtlasApp.prototype.isValidSchoolClave = function(clave) {
    // Formato 1: 21PES0001A (2 dígitos + 3 letras + 4 dígitos + 1 letra)
    // Formato 2: 32PB123 (2 dígitos + 2 letras + 3 dígitos)
    const clavePattern1 = /^\d{2}[A-Z]{3}\d{4}[A-Z]$/;
    const clavePattern2 = /^\d{2}[A-Z]{2}\d{3}$/;
    
    return clavePattern1.test(clave) || clavePattern2.test(clave);
};

// Obtener información de la escuela por clave
AtlasApp.prototype.getSchoolInfoByClave = function(clave) {
    // Base de datos simulada de escuelas con claves y ubicaciones geográficas
    const schoolDatabase = {
        '21PES0001A': {
            name: 'Telesecundaria "Benito Juárez"',
            location: 'Zona Rural',
            municipality: 'San Pedro Tlaquepaque',
            state: 'Jalisco',
            coordinates: { lat: 20.6595, lng: -103.3494 },
            isEligibleForDiscount: true,
            discountReason: 'Escuela ubicada en zona rural con índice de marginación alto'
        },
        '21PES0002B': {
            name: 'Escuela Secundaria Técnica Rural',
            location: 'Zona Rural',
            municipality: 'Tonalá',
            state: 'Jalisco',
            coordinates: { lat: 20.6244, lng: -103.2342 },
            isEligibleForDiscount: true,
            discountReason: 'Escuela en comunidad rural con acceso limitado a servicios'
        },
        '21PES0003C': {
            name: 'Centro de Bachillerato Rural',
            location: 'Zona Rural',
            municipality: 'Zapopan',
            state: 'Jalisco',
            coordinates: { lat: 20.7239, lng: -103.3848 },
            isEligibleForDiscount: true,
            discountReason: 'Bachillerato en zona rural con población indígena'
        },
        '21PES0004D': {
            name: 'Escuela Secundaria General',
            location: 'Zona Urbana',
            municipality: 'Guadalajara',
            state: 'Jalisco',
            coordinates: { lat: 20.6595, lng: -103.3494 },
            isEligibleForDiscount: false,
            discountReason: 'Escuela en zona urbana con acceso completo a servicios'
        },
        '21PES0005E': {
            name: 'Preparatoria Comunitaria',
            location: 'Zona Marginada',
            municipality: 'El Salto',
            state: 'Jalisco',
            coordinates: { lat: 20.5189, lng: -103.1792 },
            isEligibleForDiscount: true,
            discountReason: 'Preparatoria en zona urbano-marginada con alta densidad poblacional'
        },
        '21PES0006F': {
            name: 'Escuela Indígena Bilingüe',
            location: 'Comunidad Indígena',
            municipality: 'Tuxpan',
            state: 'Jalisco',
            coordinates: { lat: 19.5544, lng: -103.3758 },
            isEligibleForDiscount: true,
            discountReason: 'Escuela en comunidad indígena con preservación de lengua originaria'
        },
        '21PES0007G': {
            name: 'Colegio de Bachilleres',
            location: 'Zona Urbana',
            municipality: 'Tlajomulco',
            state: 'Jalisco',
            coordinates: { lat: 20.4731, lng: -103.4439 },
            isEligibleForDiscount: false,
            discountReason: 'Escuela en zona urbana consolidada'
            },
        '21PES0008H': {
            name: 'Centro de Educación Indígena',
            location: 'Comunidad Indígena',
            municipality: 'Zapotlán el Grande',
            state: 'Jalisco',
            coordinates: { lat: 19.7167, lng: -103.4667 },
            isEligibleForDiscount: true,
            discountReason: 'Preparatoria en comunidad indígena con necesidades especiales'
        },
        '32PB123': {
            name: 'Benito Juárez',
            location: 'Zona Rural',
            municipality: 'San Luis Potosí',
            state: 'San Luis Potosí',
            coordinates: { lat: 22.1565, lng: -100.9855 },
            isEligibleForDiscount: true,
            discountReason: 'Escuela en zona rural con acceso limitado a servicios educativos'
        }
    };
    
    return schoolDatabase[clave] || null;
};

// Actualizar información de la escuela validada
AtlasApp.prototype.updateSchoolValidationInfo = function(schoolInfo) {
    const resultTitle = document.getElementById('result-title');
    const resultDescription = document.getElementById('result-description');
    
    if (resultTitle && resultDescription) {
        resultTitle.textContent = `Escuela Validada: ${schoolInfo.name}`;
        resultDescription.innerHTML = `
            <strong>Ubicación:</strong> ${schoolInfo.location}<br>
            <strong>Municipio:</strong> ${schoolInfo.municipality}, ${schoolInfo.state}<br>
            <strong>Razón del descuento:</strong> ${schoolInfo.discountReason}
        `;
    }
};

// Formatear automáticamente la clave de la escuela
AtlasApp.prototype.formatSchoolClave = function(input) {
    let value = input.value.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
    
    // Limitar a 15 caracteres
    if (value.length > 15) {
        value = value.substring(0, 15);
    }
    
    // Formatear según el patrón detectado
    if (value.length >= 2) {
        const digits = value.substring(0, 2);
        
        // Detectar si es formato largo (21PES0001A) o corto (32PB123)
        if (value.length >= 5 && /[A-Z]/.test(value.charAt(2)) && /[A-Z]/.test(value.charAt(3)) && /[A-Z]/.test(value.charAt(4))) {
            // Formato largo: 21PES0001A
            const letters = value.substring(2, 5);
            const numbers = value.substring(5, 9);
            const finalLetter = value.substring(9, 10);
            
            let formatted = digits + letters;
            if (numbers) formatted += numbers;
            if (finalLetter) formatted += finalLetter;
            
            input.value = formatted;
        } else if (value.length >= 4 && /[A-Z]/.test(value.charAt(2)) && /[A-Z]/.test(value.charAt(3))) {
            // Formato corto: 32PB123
            const letters = value.substring(2, 4);
            const numbers = value.substring(4, 7);
            
            let formatted = digits + letters;
            if (numbers) formatted += numbers;
            
            input.value = formatted;
        } else {
            input.value = value;
        }
    } else {
        input.value = value;
    }
};

// Verificar si el correo es institucional válido
AtlasApp.prototype.isValidInstitutionalEmail = function(email) {
    const institutionalDomains = [
        'gob.mx',
        'edu.mx',
        'sep.gob.mx',
        'conalep.edu.mx',
        'cobach.edu.mx',
        'dgeti.edu.mx',
        'dgeta.edu.mx',
        'cecyte.edu.mx',
        'prepa.edu.mx',
        'bachiller.edu.mx',
        'unam.mx',
        'ipn.mx',
        'uabc.edu.mx',
        'udg.mx',
        'uanl.mx'
    ];
    
    const domain = email.split('@')[1];
    return institutionalDomains.some(validDomain => 
        domain && domain.toLowerCase().includes(validDomain)
    );
};

// Calcular similitud entre strings
AtlasApp.prototype.calculateStringSimilarity = function(str1, str2) {
    if (str1 === str2) return 1.0;
    if (str1.length === 0) return str2.length === 0 ? 1.0 : 0.0;
    if (str2.length === 0) return 0.0;
    
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= str2.length; j++) {
        matrix[0][j] = 0;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return 1.0 - (matrix[str2.length][str1.length] / Math.max(str1.length, str2.length));
};

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const app = new AtlasApp();
    app.init();
});

AtlasApp.prototype.showProgressPage = function() {
    console.log('🔄 showProgressPage llamada');
    
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostrar página de avances
    const progressPage = document.getElementById('progress-page');
    if (progressPage) {
        progressPage.classList.add('active');
        console.log('✅ Página de avances activada');
    } else {
        console.error('❌ No se encontró la página de avances');
    }
    
    // Desactivar pestañas de navegación
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Inicializar página de avances avanzada
    console.log('🚀 Inicializando página de avances avanzada...');
    this.initializeAdvancedProgress();
};

// Cargar datos de progreso del usuario
AtlasApp.prototype.loadUserProgressData = function() {
    console.log('📊 Cargando datos de progreso del usuario...');
    
    // Simular datos de progreso de un estudiante específico
    // Estudiante: Carlos Mendoza, 17 años, bachillerato, interés en física y matemáticas
    const progressData = {
        // Información del estudiante
        studentInfo: {
            name: "Carlos Mendoza",
            age: 17,
            grade: "5to Semestre de Bachillerato",
            interests: ["Física", "Matemáticas", "Astronomía", "Programación"],
            studyStyle: "Visual y Práctico",
            goals: "Ingeniería Física o Matemáticas Aplicadas"
        },
        
        // Métricas principales
        totalStudyTime: 342, // horas acumuladas en 6 meses
        coursesCompleted: 12,
        learningPathsProgress: 1, // Ha completado 1 ruta completa
        achievementRate: 87,
        studyTimeChange: 23, // +23% vs mes anterior
        coursesChange: 3, // +3 cursos este mes
        pathsChange: 33, // +33% en progreso de rutas
        achievementChange: 12, // +12% en tasa de logro
        
        // Patrón de estudio diario (últimas 20 sesiones)
        dailyStudyTime: [3, 4, 2, 5, 3, 6, 4, 3, 5, 2, 4, 3, 5, 4, 6, 3, 4, 5, 3, 4],
        
        // Progreso detallado de cursos
        courseProgress: [
            { name: 'Álgebra Básica', progress: 100, category: 'Matemáticas', difficulty: 'Básico', timeSpent: 45 },
            { name: 'Geometría Plana', progress: 100, category: 'Matemáticas', difficulty: 'Básico', timeSpent: 38 },
            { name: 'Trigonometría', progress: 100, category: 'Matemáticas', difficulty: 'Intermedio', timeSpent: 52 },
            { name: 'Cálculo Diferencial', progress: 85, category: 'Matemáticas', difficulty: 'Avanzado', timeSpent: 67 },
            { name: 'Física Mecánica', progress: 100, category: 'Física', difficulty: 'Intermedio', timeSpent: 58 },
            { name: 'Física Ondulatoria', progress: 100, category: 'Física', difficulty: 'Intermedio', timeSpent: 62 },
            { name: 'Física Moderna', progress: 75, category: 'Física', difficulty: 'Avanzado', timeSpent: 48 },
            { name: 'Química General', progress: 60, category: 'Química', difficulty: 'Básico', timeSpent: 35 },
            { name: 'Introducción a la Programación', progress: 100, category: 'Tecnología', difficulty: 'Básico', timeSpent: 42 },
            { name: 'Python para Principiantes', progress: 90, category: 'Tecnología', difficulty: 'Intermedio', timeSpent: 55 },
            { name: 'Astronomía Básica', progress: 45, category: 'Astronomía', difficulty: 'Intermedio', timeSpent: 28 },
            { name: 'Estadística Descriptiva', progress: 30, category: 'Matemáticas', difficulty: 'Intermedio', timeSpent: 18 }
        ],
        
        // Progreso de rutas de aprendizaje
        learningPaths: {
            'math-fundamentals': 100, // Ruta completada al 100%
            'natural-sciences': 85,   // Ruta en progreso avanzado
            'programming-tech': 70    // Ruta en progreso intermedio
        },
        
        // Patrones de estudio específicos
        studyPatterns: {
            preferredTime: "Tardes (2:00 PM - 6:00 PM)",
            sessionLength: "3-5 horas por sesión",
            frequency: "5-6 días por semana",
            breakPattern: "Descansos de 15 min cada 2 horas",
            environment: "Biblioteca y estudio en casa"
        },
        
        // Logros y reconocimientos
        achievements: [
            "Completó la ruta de Fundamentos de Matemáticas",
            "Mantiene promedio de 9.2/10 en cursos de física",
            "Líder en proyectos de matemáticas escolares",
            "Participa en olimpiadas de física regionales"
        ],
        
        // Áreas de mejora identificadas
        improvementAreas: [
            "Química General (necesita más práctica)",
            "Estadística (conceptos avanzados)",
            "Astronomía (especialización)"
        ]
    };
    
    console.log('📊 Datos del estudiante creados:', progressData);
    console.log('📊 Estructura de studentInfo:', progressData.studentInfo);
    console.log('📊 Estructura de studyPatterns:', progressData.studyPatterns);
    console.log('📊 Estructura de achievements:', progressData.achievements);
    
    // Actualizar métricas principales
    this.updateProgressMetrics(progressData);
    
    // Actualizar barras de progreso de rutas
    this.updateLearningPathsProgress(progressData.learningPaths);
    
    // Actualizar estado de cursos en rutas
    this.updateCourseStatuses(progressData);
    
    // Guardar datos para el análisis de IA
    this.currentStudentData = progressData;
    
    console.log('✅ Datos de progreso del estudiante Carlos Mendoza cargados y mostrados');
    console.log('✅ this.currentStudentData establecido:', this.currentStudentData);
};

// Actualizar métricas principales
AtlasApp.prototype.updateProgressMetrics = function(data) {
    // Actualizar tiempo total de estudio
    const totalStudyTimeElement = document.getElementById('total-study-time');
    if (totalStudyTimeElement) {
        const hours = Math.floor(data.totalStudyTime);
        const minutes = Math.round((data.totalStudyTime - hours) * 60);
        totalStudyTimeElement.textContent = `${hours}h ${minutes}m`;
    }
    
    // Actualizar cambio en tiempo de estudio
    const studyTimeChangeElement = document.getElementById('study-time-change');
    if (studyTimeChangeElement) {
        studyTimeChangeElement.textContent = `+${data.studyTimeChange}%`;
        studyTimeChangeElement.parentElement.className = 'metric-change positive';
    }
    
    // Actualizar cursos completados
    const coursesCompletedElement = document.getElementById('courses-completed');
    if (coursesCompletedElement) {
        coursesCompletedElement.textContent = data.coursesCompleted;
    }
    
    // Actualizar cambio en cursos
    const coursesChangeElement = document.getElementById('courses-change');
    if (coursesChangeElement) {
        coursesChangeElement.textContent = `+${data.coursesChange}`;
        coursesChangeElement.parentElement.className = 'metric-change positive';
    }
    
    // Actualizar progreso de rutas de aprendizaje
    const learningPathsProgressElement = document.getElementById('learning-paths-progress');
    if (learningPathsProgressElement) {
        learningPathsProgressElement.textContent = `${data.learningPathsProgress}/3`;
    }
    
    // Actualizar cambio en rutas
    const pathsChangeElement = document.getElementById('paths-change');
    if (pathsChangeElement) {
        pathsChangeElement.textContent = `+${data.pathsChange}%`;
        pathsChangeElement.parentElement.className = 'metric-change positive';
    }
    
    // Actualizar tasa de logro
    const achievementRateElement = document.getElementById('achievement-rate');
    if (achievementRateElement) {
        achievementRateElement.textContent = `${data.achievementRate}%`;
    }
    
    // Actualizar cambio en logros
    const achievementChangeElement = document.getElementById('achievement-change');
    if (achievementChangeElement) {
        achievementChangeElement.textContent = `+${data.achievementChange}%`;
        achievementChangeElement.parentElement.className = 'metric-change positive';
    }
};

// Actualizar barras de progreso de rutas de aprendizaje
AtlasApp.prototype.updateLearningPathsProgress = function(learningPaths) {
    // Actualizar progreso de matemáticas
    const mathProgressElement = document.getElementById('math-progress');
    const mathPercentageElement = document.getElementById('math-percentage');
    if (mathProgressElement && mathPercentageElement) {
        const progress = learningPaths['math-fundamentals'] || 0;
        mathProgressElement.style.width = `${progress}%`;
        mathPercentageElement.textContent = `${progress}%`;
    }
    
    // Actualizar progreso de ciencias
    const sciencesProgressElement = document.getElementById('sciences-progress');
    const sciencesPercentageElement = document.getElementById('sciences-percentage');
    if (sciencesProgressElement && sciencesPercentageElement) {
        const progress = learningPaths['natural-sciences'] || 0;
        sciencesProgressElement.style.width = `${progress}%`;
        sciencesPercentageElement.textContent = `${progress}%`;
    }
    
    // Actualizar progreso de programación
    const programmingProgressElement = document.getElementById('programming-progress');
    const programmingPercentageElement = document.getElementById('programming-percentage');
    if (programmingProgressElement && programmingPercentageElement) {
        const progress = learningPaths['programming-tech'] || 0;
        programmingProgressElement.style.width = `${progress}%`;
        programmingPercentageElement.textContent = `${progress}%`;
    }
};

// Actualizar estado de cursos en rutas
AtlasApp.prototype.updateCourseStatuses = function(data) {
    // Mapear progreso de cursos a estados
    const courseStatuses = {};
    data.courseProgress.forEach(course => {
        if (course.progress >= 100) {
            courseStatuses[course.name] = 'completed';
        } else if (course.progress > 0) {
            courseStatuses[course.name] = 'in-progress';
        } else {
            courseStatuses[course.name] = 'pending';
        }
    });
    
    // Actualizar estados visuales de los cursos
    this.updateCourseStatusDisplay(courseStatuses);
    
    // Actualizar información adicional de cursos si está disponible
    this.updateCourseDetails(data.courseProgress);
};

// Actualizar información detallada de cursos
AtlasApp.prototype.updateCourseDetails = function(courses) {
    courses.forEach(course => {
        // Buscar el elemento del curso en la interfaz
        const courseElement = document.querySelector(`[data-course-name="${course.name}"]`);
        if (courseElement) {
            // Agregar información adicional como tooltip o badge
            const progressBadge = courseElement.querySelector('.progress-badge');
            if (progressBadge) {
                progressBadge.innerHTML = `
                    <span class="progress-percent">${course.progress}%</span>
                    <span class="course-difficulty ${course.difficulty.toLowerCase()}">${course.difficulty}</span>
                    <span class="time-spent">${course.timeSpent}h</span>
                `;
            }
        }
    });
};

// Actualizar visualización del estado de cursos
AtlasApp.prototype.updateCourseStatusDisplay = function(courseStatuses) {
    // Buscar todos los elementos de estado de curso
    const courseItems = document.querySelectorAll('.course-progress-item');
    
    courseItems.forEach(item => {
        const courseNameElement = item.querySelector('.course-name');
        const courseStatusElement = item.querySelector('.course-status');
        
        if (courseNameElement && courseStatusElement) {
            const courseName = courseNameElement.textContent;
            const status = courseStatuses[courseName] || 'pending';
            
            // Actualizar clase CSS y texto
            courseStatusElement.className = `course-status ${status}`;
            
            switch (status) {
                case 'completed':
                    courseStatusElement.innerHTML = '✓ Completado';
                    break;
                case 'in-progress':
                    courseStatusElement.innerHTML = '🔄 En progreso';
                    break;
                case 'pending':
                    courseStatusElement.innerHTML = '⏳ Pendiente';
                    break;
            }
        }
    });
};

// Configurar gráficos de progreso
AtlasApp.prototype.setupProgressCharts = function() {
    console.log('📊 Configurando gráficos de progreso...');
    
    // Verificar si Chart.js está disponible
    if (typeof Chart === 'undefined') {
        console.log('Chart.js no está disponible, usando gráficos simples');
        this.setupSimpleCharts();
        return;
    }
    
    // Configurar gráfico de tiempo de estudio por día
    this.setupStudyTimeChart();
    
    // Configurar gráfico de progreso de cursos
    this.setupCourseProgressChart();
    
    console.log('✅ Gráficos configurados correctamente');
};

// Configurar gráfico de tiempo de estudio por día
AtlasApp.prototype.setupStudyTimeChart = function() {
    const ctx = document.getElementById('study-time-chart');
    if (!ctx) return;
    
    // Datos simulados para las últimas 15 sesiones
    const labels = Array.from({length: 15}, (_, i) => `Sesión ${i + 1}`);
    const data = [2, 3, 1, 4, 2, 5, 3, 2, 4, 1, 3, 2, 4, 3, 2];
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Horas de Estudio',
                data: data,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#6b7280'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#6b7280'
                    }
                }
            }
        }
    });
};

// Configurar gráfico de progreso de cursos
AtlasApp.prototype.setupCourseProgressChart = function() {
    const ctx = document.getElementById('course-progress-chart');
    if (!ctx) return;
    
    // Datos simulados de progreso de cursos
    const data = {
        labels: ['Álgebra', 'Geometría', 'Física', 'Química', 'Programación', 'Python'],
        datasets: [{
            label: 'Progreso (%)',
            data: [100, 75, 100, 60, 100, 45],
            backgroundColor: [
                '#10b981', // Verde para completado
                '#f59e0b', // Amarillo para en progreso
                '#10b981',
                '#f59e0b',
                '#10b981',
                '#f59e0b'
            ],
            borderColor: [
                '#059669',
                '#d97706',
                '#059669',
                '#d97706',
                '#059669',
                '#d97706'
            ],
            borderWidth: 2,
            borderRadius: 8
        }]
    };
    
    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#6b7280',
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#6b7280'
                    }
                }
            }
        }
    });
};

// Configurar gráficos simples si Chart.js no está disponible
AtlasApp.prototype.setupSimpleCharts = function() {
    console.log('📊 Configurando gráficos simples...');
    
    // Crear gráficos simples con CSS y HTML
    this.createSimpleStudyTimeChart();
    this.createSimpleCourseProgressChart();
};

// Configurar análisis de IA
AtlasApp.prototype.setupAIAnalysis = function() {
    console.log('🤖 Configurando análisis de IA...');
    
    // Configurar botón de actualizar análisis
    const refreshButton = document.getElementById('refresh-analysis');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            this.performAIAnalysis();
        });
    }
    
    // Realizar análisis inicial
    this.performAIAnalysis();
    
    console.log('✅ Análisis de IA configurado');
};

// Realizar análisis de IA
AtlasApp.prototype.performAIAnalysis = function() {
    console.log('🧠 Realizando análisis de IA...');
    
    const analysisContent = document.getElementById('ai-analysis-content');
    if (!analysisContent) return;
    
    // Mostrar estado de carga
    analysisContent.innerHTML = `
        <div class="analysis-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p data-translate="progress.analyzing_data">Analizando datos de aprendizaje...</p>
        </div>
    `;
    
    // Simular análisis de IA (en implementación real, aquí se llamaría a Gemini AI)
    setTimeout(() => {
        this.generateAIAnalysis(analysisContent);
    }, 2000);
};

// Generar análisis de IA
AtlasApp.prototype.generateAIAnalysis = function(container) {
    console.log('📝 Generando análisis de IA...');
    
    // Análisis personalizado basado en datos del estudiante
    const analysis = this.generateSimulatedAIAnalysis();
    console.log('📝 Análisis generado:', analysis);
    
    // Obtener información del estudiante si está disponible
    const studentData = this.currentStudentData;
    console.log('📝 this.currentStudentData:', this.currentStudentData);
    console.log('📝 studentData:', studentData);
    
    // Verificar si studentData existe y tiene la estructura esperada
    const hasStudentData = studentData && studentData.studentInfo && studentData.studyPatterns && studentData.achievements;
    console.log('📝 hasStudentData:', hasStudentData);
    console.log('📝 studentData.studentInfo:', studentData?.studentInfo);
    console.log('📝 studentData.studyPatterns:', studentData?.studyPatterns);
    console.log('📝 studentData.achievements:', studentData?.achievements);
    
    container.innerHTML = `
        <div class="ai-analysis-result">
            ${hasStudentData ? `
                <div class="student-profile">
                    <h4>👨‍🎓 Tu Perfil de Estudiante</h4>
                    <div class="profile-details">
                        <p><strong>Nombre:</strong> ${studentData.studentInfo.name}</p>
                        <p><strong>Edad:</strong> ${studentData.studentInfo.age} años</p>
                        <p><strong>Grado:</strong> ${studentData.studentInfo.grade}</p>
                        <p><strong>Intereses:</strong> ${studentData.studentInfo.interests.join(', ')}</p>
                        <p><strong>Estilo de Aprendizaje:</strong> ${studentData.studentInfo.studyStyle}</p>
                        <p><strong>Objetivos:</strong> ${studentData.studentInfo.goals}</p>
                    </div>
                </div>
            ` : ''}
            
            <div class="analysis-summary">
                <h4>📊 Tu Resumen Ejecutivo</h4>
                <p>${analysis.summary}</p>
            </div>
            
            <div class="analysis-insights">
                <h4>💡 Insights Clave sobre tu Progreso</h4>
                <ul>
                    ${analysis.insights.map(insight => `<li>${insight}</li>`).join('')}
                </ul>
            </div>
            
            <div class="analysis-recommendations">
                <h4>🎯 Recomendaciones Personalizadas para ti</h4>
                <ul>
                    ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
            
            <div class="analysis-strengths">
                <h4>⭐ Tus Fortalezas Identificadas</h4>
                <ul>
                    ${analysis.strengths.map(strength => `<li>${strength}</li>`).join('')}
                </ul>
            </div>
            
            <div class="analysis-areas">
                <h4>🔍 Áreas de Oportunidad para ti</h4>
                <ul>
                    ${analysis.areas.map(area => `<li>${area}</li>`).join('')}
                </ul>
            </div>
            
            ${hasStudentData ? `
                <div class="study-patterns">
                    <h4>📚 Tus Patrones de Estudio</h4>
                    <div class="patterns-grid">
                        <div class="pattern-item">
                            <strong>Horario Preferido:</strong> ${studentData.studyPatterns.preferredTime}
                        </div>
                        <div class="pattern-item">
                            <strong>Duración de Sesión:</strong> ${studentData.studyPatterns.sessionLength}
                        </div>
                        <div class="pattern-item">
                            <strong>Frecuencia:</strong> ${studentData.studyPatterns.frequency}
                        </div>
                        <div class="pattern-item">
                            <strong>Patrón de Descansos:</strong> ${studentData.studyPatterns.breakPattern}
                        </div>
                    </div>
                </div>
                
                <div class="achievements-section">
                    <h4>🏆 Tus Logros y Reconocimientos</h4>
                    <ul>
                        ${studentData.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;
    
    console.log('✅ Análisis de IA generado y mostrado');
};

// Generar análisis simulado de IA
AtlasApp.prototype.generateSimulatedAIAnalysis = function() {
    // Obtener datos del estudiante actual
    const studentData = this.currentStudentData;
    
    if (!studentData) {
        return this.getDefaultAnalysis();
    }
    
    // Análisis personalizado basado en los datos del estudiante
    return {
        summary: `Has demostrado un perfil académico excepcionalmente fuerte en ciencias exactas. Con ${studentData.totalStudyTime} horas de estudio acumuladas y una tasa de logro del ${studentData.achievementRate}%, representas el prototipo de un futuro ingeniero o científico. Tu dedicación de ${studentData.studyPatterns.frequency} y sesiones de ${studentData.studyPatterns.sessionLength} refleja una disciplina de estudio sobresaliente.`,
        
        insights: [
            `Has completado exitosamente la ruta de Fundamentos de Matemáticas (100%), demostrando dominio completo en álgebra, geometría y trigonometría. Tu progreso en cálculo diferencial (85%) indica una transición exitosa hacia matemáticas avanzadas.`,
            `En física, mantienes un rendimiento excepcional con promedio de 9.2/10. Has completado Física Mecánica y Ondulatoria al 100%, y progresas bien en Física Moderna (75%), mostrando una comprensión profunda de conceptos fundamentales.`,
            `Tu patrón de estudio es altamente efectivo: prefieres estudiar en las tardes (2:00-6:00 PM) con sesiones de 3-5 horas, manteniendo descansos regulares de 15 minutos cada 2 horas. Esta rutina optimiza tu retención y concentración.`,
            `Aunque progresas bien en programación (Python al 90%), tu verdadera pasión está en física y matemáticas. Tu interés en astronomía (45% completado) sugiere una inclinación hacia la física aplicada y la investigación científica.`
        ],
        
        recommendations: [
            `Deberías considerar especializarte en Física Teórica o Matemáticas Aplicadas. Tu perfil es ideal para carreras como Ingeniería Física, Física, o Matemáticas con especialización en física.`,
            `Para fortalecer tu candidatura universitaria, debes completar Física Moderna (actualmente 75%) y profundizar en Estadística Descriptiva (30%). Estas materias son fundamentales para la investigación científica.`,
            `Dado tu interés en astronomía, podrías explorar cursos de astrofísica y mecánica celeste. Tu base sólida en matemáticas y física te permitiría destacar en esta área emergente.`,
            `Debes mantener tu excelente rutina de estudio, pero podrías beneficiarte de proyectos de investigación escolar en física o matemáticas para desarrollar habilidades de investigación.`
        ],
        
        strengths: [
            `Dominio excepcional en matemáticas fundamentales (100% en álgebra, geometría, trigonometría)`,
            `Excelencia en física con promedio de 9.2/10 y completitud en mecánica y ondulatoria`,
            `Disciplina de estudio sobresaliente: 342 horas acumuladas, 5-6 días por semana`,
            `Capacidad para manejar conceptos avanzados (cálculo diferencial al 85%)`,
            `Liderazgo académico: participas en olimpiadas de física y lideras proyectos escolares`
        ],
        
        areas: [
            `Química General (60%): Necesitas más práctica en conceptos fundamentales de química para tener una base científica completa`,
            `Estadística Descriptiva (30%): Los conceptos avanzados requieren más tiempo y práctica para consolidarse`,
            `Astronomía Básica (45%): Aunque progresas bien, podrías beneficiarte de más recursos especializados`,
            `Física Moderna (75%): Estás cerca de completar, pero los conceptos cuánticos requieren consolidación adicional`
        ]
    };
};

// Configurar eventos de la página de avances
AtlasApp.prototype.setupProgressPageEvents = function() {
    console.log('🎯 Configurando eventos de la página de avances...');
    
    // Configurar botones de toggle de rutas de aprendizaje
    const toggleButtons = document.querySelectorAll('.path-toggle-btn');
    toggleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const pathId = button.dataset.path;
            this.togglePathCourses(pathId);
        });
    });
    
    // Configurar botones de comenzar ruta
    const startPathButtons = document.querySelectorAll('.path-start-btn');
    startPathButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const pathId = button.dataset.path;
            this.startLearningPath(pathId);
        });
    });
    
    console.log('✅ Eventos de la página de avances configurados');
};

// Toggle de cursos en rutas de aprendizaje
AtlasApp.prototype.togglePathCourses = function(pathId) {
    const coursesContainer = document.getElementById(`${pathId}-courses`);
    const toggleButton = document.querySelector(`[data-path="${pathId}"]`);
    
    if (coursesContainer && toggleButton) {
        const isVisible = coursesContainer.style.display !== 'none';
        
        if (isVisible) {
            // Ocultar cursos
            coursesContainer.style.display = 'none';
            toggleButton.innerHTML = '<i class="fas fa-chevron-down"></i><span data-translate="courses.paths.view_courses">Ver cursos</span>';
            console.log(`🛤️ Ocultando cursos de la ruta: ${pathId}`);
        } else {
            // Mostrar cursos
            coursesContainer.style.display = 'block';
            toggleButton.innerHTML = '<i class="fas fa-chevron-up"></i><span data-translate="courses.paths.view_courses">Ocultar cursos</span>';
            console.log(`🛤️ Mostrando cursos de la ruta: ${pathId}`);
        }
    }
};

// Función para comenzar una ruta de aprendizaje
AtlasApp.prototype.startLearningPath = function(pathId) {
    console.log(`🚀 Iniciando ruta de aprendizaje: ${pathId}`);
    
    // Mostrar notificación
    this.showNotification('Función de comenzar ruta estará disponible próximamente', 'info');
    
    // En una implementación real, aquí se redirigiría al usuario a la ruta seleccionada
    // o se iniciaría un proceso de seguimiento específico
};

// Análisis por defecto si no hay datos del estudiante
AtlasApp.prototype.getDefaultAnalysis = function() {
    return {
        summary: "No hay datos específicos disponibles para tu análisis. Por favor, completa algunos cursos para recibir un análisis personalizado.",
        insights: ["Completa tu primer curso para obtener insights personalizados"],
        recommendations: ["Comienza con cursos básicos para establecer una base sólida"],
        strengths: ["Tu compromiso con el aprendizaje es admirable"],
        areas: ["Explora diferentes áreas para identificar tus intereses"]
    };
};

// Configurar gráficos simples si Chart.js no está disponible
AtlasApp.prototype.setupSimpleCharts = function() {
    console.log('📊 Configurando gráficos simples...');
    
    // Crear gráficos simples con CSS y HTML
    this.createSimpleStudyTimeChart();
    this.createSimpleCourseProgressChart();
};

// Crear gráfico simple de tiempo de estudio
AtlasApp.prototype.createSimpleStudyTimeChart = function() {
    console.log('📊 Creando gráfico simple de tiempo de estudio...');
    
    const chartContainer = document.getElementById('study-time-chart');
    if (!chartContainer) {
        console.log('📊 Contenedor de gráfico de tiempo de estudio no encontrado');
        return;
    }
    
    // Crear gráfico simple con HTML y CSS
    chartContainer.innerHTML = `
        <div class="simple-chart">
            <div class="chart-title">Tiempo de Estudio por Día (últimas 20 sesiones)</div>
            <div class="chart-bars">
                ${this.currentStudentData?.dailyStudyTime?.map((hours, index) => `
                    <div class="chart-bar" style="height: ${hours * 20}px;" title="Día ${index + 1}: ${hours}h">
                        <span class="bar-value">${hours}h</span>
                    </div>
                `).join('') || ''}
            </div>
            <div class="chart-labels">
                ${Array.from({length: 20}, (_, i) => `<span class="chart-label">${i + 1}</span>`).join('')}
            </div>
        </div>
    `;
    
    console.log('✅ Gráfico simple de tiempo de estudio creado');
};

// Crear gráfico simple de progreso de cursos
AtlasApp.prototype.createSimpleCourseProgressChart = function() {
    console.log('📊 Creando gráfico simple de progreso de cursos...');
    
    const chartContainer = document.getElementById('course-progress-chart');
    if (!chartContainer) {
        console.log('📊 Contenedor de gráfico de progreso de cursos no encontrado');
        return;
    }
    
    // Crear gráfico simple con HTML y CSS
    chartContainer.innerHTML = `
        <div class="simple-chart">
            <div class="chart-title">Progreso de Cursos</div>
            <div class="chart-bars">
                ${this.currentStudentData?.courseProgress?.map(course => `
                    <div class="chart-bar" style="height: ${course.progress * 2}px;" title="${course.name}: ${course.progress}%">
                        <span class="bar-value">${course.progress}%</span>
                        <span class="course-name">${course.name}</span>
                    </div>
                `).join('') || ''}
            </div>
        </div>
    `;
    
    console.log('✅ Gráfico simple de progreso de cursos creado');
};
