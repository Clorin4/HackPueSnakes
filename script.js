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

        // Botón de cerrar sesión
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });
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
            this.showError(errorElement, formGroup, 'El nombre de usuario no puede tener más de 20 caracteres');
            return false;
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            this.showError(errorElement, formGroup, 'Solo se permiten letras, números y guiones bajos');
            return false;
        }
        
        // Verificar si el usuario ya existe (solo en registro)
        if (errorElementId.includes('register') && this.users.some(user => user.username === username)) {
            this.showError(errorElement, formGroup, 'Este nombre de usuario ya está en uso');
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
        this.showNotification(`¡Bienvenido, ${user.name}!`, 'success');
        document.getElementById('user-name').textContent = user.name;
        
        setTimeout(() => {
            this.showScreen('dashboard-screen');
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
