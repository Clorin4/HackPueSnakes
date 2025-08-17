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
        
        // Inicializar datos del usuario
        this.initializeUserData();
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

    // Configurar botones de donación
    document.querySelectorAll('.donate-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            this.openDonationModal(btn);
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

    // Configurar modal de donaciones
    this.setupDonationModal();
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

AtlasApp.prototype.openDonationModal = function(button) {
    const modal = document.getElementById('donation-modal');
    modal.classList.add('show');
    
    // Configurar el contexto de la donación (qué publicación)
    this.currentDonationContext = button.closest('.post-card');
};

AtlasApp.prototype.setupDonationModal = function() {
    const modal = document.getElementById('donation-modal');
    const closeBtn = document.getElementById('close-donation-modal');
    const confirmBtn = document.getElementById('confirm-donation');
    const amountBtns = document.querySelectorAll('.amount-btn');
    const customAmountInput = document.getElementById('custom-amount');

    // Cerrar modal
    closeBtn.addEventListener('click', () => {
        this.closeDonationModal();
    });

    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            this.closeDonationModal();
        }
    });

    // Selección de cantidad predefinida
    amountBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            amountBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            customAmountInput.value = '';
        });
    });

    // Input personalizado
    customAmountInput.addEventListener('input', () => {
        amountBtns.forEach(btn => btn.classList.remove('selected'));
    });

    // Confirmar donación
    confirmBtn.addEventListener('click', () => {
        this.processDonation();
    });

    // Cerrar modal con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            this.closeDonationModal();
        }
    });
};

AtlasApp.prototype.closeDonationModal = function() {
    const modal = document.getElementById('donation-modal');
    modal.classList.remove('show');
    
    // Limpiar selecciones
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.getElementById('custom-amount').value = '';
    
    this.currentDonationContext = null;
};

AtlasApp.prototype.processDonation = function() {
    const selectedAmount = document.querySelector('.amount-btn.selected');
    const customAmount = document.getElementById('custom-amount').value;
    
    let donationAmount = 0;
    
    if (selectedAmount) {
        donationAmount = parseInt(selectedAmount.getAttribute('data-amount'));
    } else if (customAmount) {
        donationAmount = parseInt(customAmount);
    }
    
    if (donationAmount <= 0) {
        this.showNotification('Selecciona una cantidad válida para donar', 'warning');
        return;
    }

    // Simular procesamiento de donación
    const confirmBtn = document.getElementById('confirm-donation');
    confirmBtn.classList.add('loading');
    confirmBtn.textContent = 'Procesando...';
    
    setTimeout(() => {
        this.showNotification(`¡Gracias por donar $${donationAmount}! Tu apoyo es muy valioso.`, 'success');
        this.closeDonationModal();
        
        // Restaurar botón
        confirmBtn.classList.remove('loading');
        confirmBtn.innerHTML = '<i class="fas fa-heart"></i> Donar';
        
        // Aquí podrías enviar la donación al servidor
        // this.sendDonationToServer(postId, donationAmount);
    }, 2000);
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
};

AtlasApp.prototype.closeProfileMenu = function() {
    const dropdownMenu = document.getElementById('dropdown-menu');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    dropdownMenu.classList.remove('show');
    profileDropdown.classList.remove('open');
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
    
    // Actualizar información en el menú desplegable
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-email').textContent = user.email;
    document.getElementById('dropdown-name').textContent = user.name;
    document.getElementById('dropdown-email').textContent = user.email;
    
    // Actualizar información en la página de perfil
    document.getElementById('profile-display-name').textContent = `${user.name} ${user.lastname}`;
    document.getElementById('profile-email-display').textContent = user.email;
};

// El método handleLogin ya incluye la actualización de la interfaz
