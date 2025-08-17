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
        
        // Inicializar datos del usuario
        this.initializeUserData();
        
        // Limpiar duplicados existentes
        this.cleanupDuplicates();
        
        // Inicializar flags de guardado
        this.isSavingCourse = false;
        this.isSavingClass = false;
        
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
    
    // Configurar clicks en tarjetas de curso
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const courseTitle = card.querySelector('.course-title').textContent;
            const instructorName = card.querySelector('.instructor-name').textContent;
            const level = card.dataset.level;
            
            console.log(`🎯 Curso clickeado: ${courseTitle} por ${instructorName} (${level})`);
            
            // Por ahora solo mostrar información en consola
            // Más adelante implementaremos la vista detallada del curso
            this.showCourseInfo(courseTitle, instructorName, level);
        });
    });
    
    console.log('✅ Sección de cursos configurada correctamente');
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

AtlasApp.prototype.showCourseInfo = function(title, instructor, level) {
    // Obtener información adicional del curso
    const courseCard = event.target.closest('.course-card');
    const courseType = courseCard.dataset.type;
    const isAtlas = courseCard.classList.contains('atlas-course');
    const isPremium = courseCard.classList.contains('premium-course');
    
    // Crear notificación temporal con información del curso
    const notification = document.createElement('div');
    notification.className = 'course-info-notification';
    
    let typeIcon = '';
    let typeText = '';
    let accessInfo = '';
    
    if (isAtlas) {
        typeIcon = '🎓';
        typeText = 'Atlas';
        accessInfo = '✅ Acceso gratuito';
    } else if (isPremium) {
        typeIcon = '👑';
        typeText = 'Premium';
        accessInfo = '🔒 Requiere suscripción Premium';
    } else {
        typeIcon = '💚';
        typeText = 'Gratuito';
        accessInfo = '✅ Acceso gratuito';
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            <h4>${typeIcon} ${title}</h4>
            <p><strong>Instructor:</strong> ${instructor}</p>
            <p><strong>Nivel:</strong> ${level}</p>
            <p><strong>Tipo:</strong> ${typeText}</p>
            <p><strong>Acceso:</strong> ${accessInfo}</p>
            <p><em>Vista detallada próximamente...</em></p>
        </div>
    `;
    
    // Estilos inline para la notificación
    const borderColor = isPremium ? '#8b5cf6' : isAtlas ? 'var(--primary-color)' : '#10b981';
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'var(--background)',
        border: `2px solid ${borderColor}`,
        borderRadius: 'var(--radius-lg)',
        padding: '1rem',
        boxShadow: 'var(--shadow-lg)',
        zIndex: '1000',
        maxWidth: '300px',
        animation: 'slideInRight 0.3s ease-out'
    });
    
    document.body.appendChild(notification);
    
    // Remover después de 4 segundos (más tiempo para leer la información adicional)
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
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
    
    // Estilos inline
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        color: 'white',
        fontWeight: '500',
        zIndex: '9999',
        maxWidth: '400px',
        animation: 'slideInRight 0.3s ease-out',
        background: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'
    });
    
    document.body.appendChild(notification);
    
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
        price = 99.99;
        tax = 15.00;
        total = 114.99;
    } else {
        price = 9.99;
        tax = 1.50;
        total = 11.49;
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
    this.membershipPrice = 9.99; // Precio base por membresía
    
    // Sistema de precios con descuentos por mayoreo
    this.bulkPricingTiers = [
        { min: 11, max: 20, price: 9.49, discount: 5 },
        { min: 21, max: 35, price: 8.99, discount: 10 },
        { min: 36, max: 50, price: 8.49, discount: 15 }
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
    
    if (numAmount >= 11 && numAmount <= 50) {
        const pricing = this.getBulkPrice(numAmount);
        
        if (pricing) {
            priceElement.textContent = `$${pricing.totalPrice}`;
            
            // Mostrar descuento
            const savings = (parseFloat(pricing.originalPrice) - parseFloat(pricing.totalPrice)).toFixed(2);
            bulkDiscount.textContent = `¡Ahorras $${savings} (-${pricing.discount}%)!`;
            bulkDiscount.style.display = 'inline-block';
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
    if (this.selectedAmount === 0 || this.selectedAmount < 11 || this.selectedAmount > 50) {
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
    if (this.selectedAmount === 0 || this.selectedAmount < 11 || this.selectedAmount > 50) {
        this.showNotification(this.getTranslation('donation.invalid_bulk_amount') || 'La cantidad debe estar entre 11 y 50 membresías', 'warning');
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

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const app = new AtlasApp();
    app.init();
});
