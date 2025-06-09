document.addEventListener('DOMContentLoaded', () => {
    // --- STATE & MOCK DATA ---
    const MOCK_USER = { name: 'Usuário Teste', email: 'teste@adytum.com', password: 'password123' };
    const ADMIN_CREDENTIALS = { username: 'root', password: '2025' };

    let currentChallengeTimer;
    let challengeStartTime;

    const mockChallenges = [
        { id: 1, title: 'Soma de Dois Números', description: 'Encontre dois números no array que somam ao alvo.', difficulty: 'Fácil', statement: 'Dado um array de inteiros `nums` e um inteiro `target`, retorne os índices dos dois números de forma que eles somem `target`. Você pode assumir que cada entrada teria exatamente uma solução, e você não pode usar o mesmo elemento duas vezes. Você pode retornar a resposta em qualquer ordem.', examples: 'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplicação: Porque nums[0] + nums[1] == 9, retornamos [0, 1].', starterCode: '// Seu código aqui\nfunction twoSum(nums, target) {\n\n}' },
        { id: 2, title: 'Palíndromo', description: 'Verifique se uma string é um palíndromo.', difficulty: 'Fácil', statement: 'Dada uma string `s`, retorne `true` se `s` for um palíndromo, ou `false` caso contrário.', examples: 'Input: s = "A man, a plan, a canal: Panama"\nOutput: true\nExplicação: "amanaplanacanalpanama" é um palíndromo.\n\nInput: s = "race a car"\nOutput: false', starterCode: 'function isPalindrome(s) {\n\n}' },
        { id: 3, title: 'Inverter String', description: 'Inverta uma string.', difficulty: 'Médio', statement: 'Escreva uma função que inverta uma string. A string de entrada é dada como um array de caracteres `char[]`.', examples: 'Input: ["h","e","l","l","o"]\nOutput: ["o","l","l","e","h"]', starterCode: 'function reverseString(s) {\n\n}'},
    ];

    const mockInterviewQuestions = [
        "Fale um pouco sobre você e sua experiência.",
        "Por que você está interessado nesta área/tecnologia?",
        "Descreva um desafio técnico que você enfrentou e como o superou.",
        "Onde você se vê em 5 anos?",
        "Quais são seus pontos fortes e fracos?",
        "Como você lida com prazos apertados e pressão?",
        "Você prefere trabalhar sozinho ou em equipe? Por quê?",
        "O que você sabe sobre nossa empresa/plataforma?"
    ];
    let currentQuestionIndex = -1;

    const mockArticles = [
        { id: 1, title: 'Dominando o JavaScript Assíncrono', summary: 'Promises, async/await e como evitar o callback hell.', fullContent: 'Conteúdo completo sobre JavaScript assíncrono... (placeholder)', imagePlaceholder: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
        { id: 2, title: 'Guia Completo de CSS Flexbox', summary: 'Aprenda a criar layouts responsivos com Flexbox.', fullContent: 'Conteúdo completo sobre CSS Flexbox... (placeholder)', imagePlaceholder: 'https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
        { id: 3, title: 'Construindo um Portfólio Dev de Impacto', summary: 'Dicas para criar um portfólio que impressione recrutadores.', fullContent: 'Conteúdo completo sobre portfólios... (placeholder)', imagePlaceholder: 'https://images.pexels.com/photos/4974915/pexels-photo-4974915.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    ];

    // --- DOM ELEMENTS ---
    const mainSections = document.querySelectorAll('main > section');
    const header = document.getElementById('app-header');
    const mainNav = document.getElementById('main-nav');
    const hamburgerMenu = document.getElementById('hamburger-menu');

    // User Actions Header
    const userActionsNotLoggedIn = document.getElementById('user-actions-not-logged-in');
    const userActionsLoggedInUser = document.getElementById('user-actions-logged-in-user');
    const userActionsLoggedInAdmin = document.getElementById('user-actions-logged-in-admin');
    const loggedInUserNameSpan = document.getElementById('logged-in-user-name');
    const loggedInAdminNameSpan = document.getElementById('logged-in-admin-name');

    // Auth Forms
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');
    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-message');
    const homeRegisterCta = document.getElementById('home-register-cta');


    // Admin Login Form
    const adminLoginForm = document.getElementById('admin-login-form');
    const adminLoginMessage = document.getElementById('admin-login-message');

    // Challenges
    const challengesGridContent = document.getElementById('challenges-grid-content');
    const challengesListDiv = document.getElementById('challenges-list');
    const challengeResolutionScreenDiv = document.getElementById('challenge-resolution-screen');
    const challengeTitleResolution = document.getElementById('challenge-title-resolution');
    const challengeStatement = document.getElementById('challenge-statement');
    const challengeExamples = document.getElementById('challenge-examples');
    const codeEditorDiv = document.getElementById('code-editor');
    const submitChallengeBtn = document.getElementById('submit-challenge-btn');
    const submissionFeedback = document.getElementById('submission-feedback');
    const backToChallengesListBtn = document.getElementById('back-to-challenges-list');
    const challengeTimerDisplay = document.getElementById('challenge-timer');
    let aceEditor;

    // Interview Simulator
    const interviewQuestionP = document.getElementById('interview-question');
    const interviewAnswerTextarea = document.getElementById('interview-answer');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const interviewFeedbackDiv = document.getElementById('interview-feedback');

    // Career Tips
    const articlesGridContent = document.getElementById('articles-grid-content');
    const articlesListContainer = document.getElementById('articles-list-container');
    const articleViewContainer = document.getElementById('article-view-container');
    const articleTitleView = document.getElementById('article-title-view');
    const articleImageView = document.getElementById('article-image-view');
    const articleContentView = document.getElementById('article-content-view');
    const backToArticlesListBtn = document.getElementById('back-to-articles-list');
    
    // --- INITIALIZATION & HELPERS ---

    function initializeAceEditor(initialContent = '') {
        if (typeof ace !== 'undefined') {
            if (aceEditor) aceEditor.destroy(); // Destroy previous instance if exists
            aceEditor = ace.edit(codeEditorDiv);
            aceEditor.setTheme("ace/theme/chrome");
            aceEditor.session.setMode("ace/mode/javascript"); // Default, can be changed per challenge
            aceEditor.setFontSize(14);
            aceEditor.setValue(initialContent, -1); // -1 moves cursor to beginning
            aceEditor.setOptions({
                useWorker: false // To prevent console errors in simple setups
            });
        } else {
            console.warn('Ace Editor not loaded. Using basic textarea-like div.');
            codeEditorDiv.textContent = initialContent || "// Ace Editor failed to load. Please type your code here.";
            codeEditorDiv.setAttribute('contenteditable', 'true');
            codeEditorDiv.style.fontFamily = 'var(--font-code)';
            codeEditorDiv.style.backgroundColor = '#f0f0f0';
            codeEditorDiv.style.border = '1px solid var(--neutral-border-gray)';
            codeEditorDiv.style.minHeight = '200px';
            codeEditorDiv.style.padding = '10px';
            codeEditorDiv.style.whiteSpace = 'pre-wrap';
        }
    }
    
    function updateHeader() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
        const userName = localStorage.getItem('userName');

        userActionsNotLoggedIn.style.display = 'none';
        userActionsLoggedInUser.style.display = 'none';
        userActionsLoggedInAdmin.style.display = 'none';

        if (isAdminLoggedIn) {
            userActionsLoggedInAdmin.style.display = 'flex';
            if (loggedInAdminNameSpan) loggedInAdminNameSpan.textContent = "Olá, Administrador!";
        } else if (isLoggedIn) {
            userActionsLoggedInUser.style.display = 'flex';
            if (loggedInUserNameSpan) loggedInUserNameSpan.textContent = `Olá, ${userName}!`;
        } else {
            userActionsNotLoggedIn.style.display = 'flex';
        }

        // Update active nav link in header
        const currentVisibleSection = document.querySelector('main > section.active-section');
        document.querySelectorAll('#main-nav ul li a').forEach(link => {
            link.classList.remove('active-nav-link');
            if (currentVisibleSection && link.getAttribute('data-nav') === currentVisibleSection.id) {
                link.classList.add('active-nav-link');
            }
        });
    }

    function showSection(sectionId) {
        let targetSection = document.getElementById(sectionId);
        let canShow = false;

        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true';
        const userProtectedSections = ['dashboard-section', 'challenges-section', 'interview-section', 'good-practices-section', 'career-tips-section'];

        if (!targetSection) {
            console.error(`Section ${sectionId} not found. Defaulting to home.`);
            sectionId = 'home-section'; // Fallback to home
            targetSection = document.getElementById(sectionId);
            if (!targetSection) {
                console.error("Home section not found either. Aborting.");
                return; // Critical error
            }
        }
        
        if (userProtectedSections.includes(sectionId)) {
            if (isLoggedIn || isAdminLoggedIn) {
                canShow = true;
            } else {
                alert('Você precisa estar logado para acessar esta área!');
                // The call to showSection('auth-section') will handle displaying the auth form
                // and then its own updateHeader call.
                showSection('auth-section'); 
                // Ensure the login form specifically is visible if redirected to auth
                const loginFormContainer = document.getElementById('login-form-container');
                const registerFormContainer = document.getElementById('register-form-container');
                if(document.getElementById('auth-section').classList.contains('active-section')){
                    if (loginFormContainer) loginFormContainer.style.display = 'block';
                    if (registerFormContainer) registerFormContainer.style.display = 'none';
                }
                return; // Exit current call as showSection('auth-section') will take over
            }
        } else if (sectionId === 'admin-section') {
            canShow = true; // Visibility of sub-elements (login/panel) handled below
        } else { // Home, Auth are public by default
            canShow = true;
        }

        if (canShow) {
            mainSections.forEach(section => {
                if (section.id !== targetSection.id) {
                    section.classList.remove('active-section');
                    section.style.display = 'none'; // Hide non-target sections
                }
            });

            targetSection.style.display = 'block'; // Make target section part of layout
            requestAnimationFrame(() => { // Delay adding class to ensure transition
                targetSection.classList.add('active-section');
            });

            // Specific sub-view states, apply after section is made active
            if (sectionId === 'auth-section') {
                document.getElementById('login-form-container').style.display = 'block';
                document.getElementById('register-form-container').style.display = 'none';
                if (loginMessage) loginMessage.textContent = '';
                if (registerMessage) registerMessage.textContent = '';
            }
            if (sectionId === 'admin-section') {
                if (isAdminLoggedIn) {
                    document.getElementById('admin-panel-container').style.display = 'block';
                    document.getElementById('admin-login-form-container').style.display = 'none';
                } else {
                    document.getElementById('admin-login-form-container').style.display = 'block';
                    document.getElementById('admin-panel-container').style.display = 'none';
                }
            }
            if (sectionId === 'challenges-section' && (isLoggedIn || isAdminLoggedIn)) {
                renderChallenges();
                if(challengesListDiv) challengesListDiv.style.display = 'block';
                if(challengeResolutionScreenDiv) challengeResolutionScreenDiv.style.display = 'none';
            }
            if (sectionId === 'career-tips-section' && (isLoggedIn || isAdminLoggedIn)) {
                renderArticles();
                if(articlesListContainer) articlesListContainer.style.display = 'block';
                if(articleViewContainer) articleViewContainer.style.display = 'none';
            }
            if (sectionId === 'interview-section' && (isLoggedIn || isAdminLoggedIn)) {
                startInterviewSimulator();
            }
            if (sectionId === 'dashboard-section' && (isLoggedIn || isAdminLoggedIn)) {
                loadDashboardData();
            }
        }
        
        updateHeader(); // Call this after section visibility and content is set
        window.scrollTo(0, 0);
        if (mainNav) mainNav.classList.remove('active');
    }
    
    function displayFormMessage(element, message, type = 'error') {
        if (!element) return;
        element.textContent = message;
        element.className = `form-message ${type}`; // 'success' or 'error'
    }

    // --- AUTHENTICATION ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            const storedUser = JSON.parse(localStorage.getItem('adytumUser'));

            if ((email === MOCK_USER.email && password === MOCK_USER.password) ||
                (storedUser && email === storedUser.email && password === storedUser.password)) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userName', storedUser ? storedUser.name : MOCK_USER.name);
                displayFormMessage(loginMessage, 'Login bem-sucedido!', 'success');
                setTimeout(() => {
                    showSection('dashboard-section');
                    loginForm.reset();
                    if (loginMessage) loginMessage.textContent = '';
                    if (loginMessage) loginMessage.className = 'form-message'; // Reset class
                }, 1000);
            } else {
                displayFormMessage(loginMessage, 'Email ou senha inválidos.', 'error');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;

            if (password !== confirmPassword) {
                displayFormMessage(registerMessage, 'As senhas não coincidem.', 'error');
                return;
            }
            if (password.length < 6) {
                 displayFormMessage(registerMessage, 'A senha deve ter pelo menos 6 caracteres.', 'error');
                return;
            }

            const newUser = { name, email, password };
            localStorage.setItem('adytumUser', JSON.stringify(newUser)); 
            
            displayFormMessage(registerMessage, 'Cadastro realizado com sucesso! Faça o login.', 'success');
            setTimeout(() => {
                document.getElementById('login-form-container').style.display = 'block';
                document.getElementById('register-form-container').style.display = 'none';
                registerForm.reset();
                if (registerMessage) registerMessage.textContent = '';
                if (registerMessage) registerMessage.className = 'form-message'; // Reset class
                document.getElementById('login-email').value = email;
            }, 1500);
        });
    }
    
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('login-form-container').style.display = 'none';
            document.getElementById('register-form-container').style.display = 'block';
            if (loginMessage) loginMessage.textContent = '';
            if (loginMessage) loginMessage.className = 'form-message';
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('register-form-container').style.display = 'none';
            document.getElementById('login-form-container').style.display = 'block';
            if (registerMessage) registerMessage.textContent = '';
            if (registerMessage) registerMessage.className = 'form-message';
        });
    }
    
    if (homeRegisterCta) { 
        homeRegisterCta.addEventListener('click', (e) => {
            e.preventDefault();
            showSection('auth-section');
             // Ensure register form is shown when clicking "Comece Agora"
            document.getElementById('login-form-container').style.display = 'none';
            document.getElementById('register-form-container').style.display = 'block';
        });
    }


    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;

            if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
                localStorage.setItem('isAdminLoggedIn', 'true');
                localStorage.setItem('isLoggedIn', 'true'); 
                localStorage.setItem('userName', 'Administrador'); 
                displayFormMessage(adminLoginMessage, 'Login de administrador bem-sucedido!', 'success');
                 setTimeout(() => {
                    showSection('admin-section'); 
                    adminLoginForm.reset();
                    if (adminLoginMessage) adminLoginMessage.textContent = '';
                    if (adminLoginMessage) adminLoginMessage.className = 'form-message';
                }, 1000);
            } else {
                displayFormMessage(adminLoginMessage, 'Credenciais de administrador inválidas.', 'error');
            }
        });
    }

    function logout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('isAdminLoggedIn');
        localStorage.removeItem('userName');
        showSection('home-section');
    }

    document.getElementById('logout-user-btn')?.addEventListener('click', logout);
    document.getElementById('logout-admin-btn')?.addEventListener('click', logout);

    // --- NAVIGATION ---
    document.querySelectorAll('[data-nav]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-nav');
            showSection(sectionId);
        });
    });

    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }
    
    mainNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
            }
        });
    });


    // --- CHALLENGES MODULE ---
    function renderChallenges() {
        if (!challengesGridContent) return;
        challengesGridContent.innerHTML = ''; // Clear existing
        mockChallenges.forEach(challenge => {
            const card = document.createElement('div');
            card.className = 'challenge-card';
            // difficulty class needs to handle 'é' if it exists, or use a sanitized version
            const difficultyClass = challenge.difficulty.toLowerCase().replace(/é|ê/g, 'e').replace(/í/g, 'i');
            card.innerHTML = `
                <h3>${challenge.title}</h3>
                <p>${challenge.description}</p>
                <span class="challenge-difficulty difficulty-${difficultyClass}">${challenge.difficulty}</span>
                <button class="btn btn-primary-outline" data-challenge-id="${challenge.id}">Resolver</button>
            `;
            challengesGridContent.appendChild(card);
        });

        document.querySelectorAll('.challenge-card button[data-challenge-id]').forEach(button => {
            button.addEventListener('click', () => {
                const challengeId = parseInt(button.getAttribute('data-challenge-id'));
                loadChallengeForResolution(challengeId);
            });
        });
    }

    function loadChallengeForResolution(challengeId) {
        const challenge = mockChallenges.find(c => c.id === challengeId);
        if (!challenge) return;

        if(challengesListDiv) challengesListDiv.style.display = 'none';
        if(challengeResolutionScreenDiv) challengeResolutionScreenDiv.style.display = 'block';

        if(challengeTitleResolution) challengeTitleResolution.textContent = challenge.title;
        if(challengeStatement) challengeStatement.innerHTML = challenge.statement.replace(/`([^`]+)`/g, '<code>$1</code>'); // Render markdown backticks as code
        if(challengeExamples) challengeExamples.textContent = challenge.examples;
        if(submissionFeedback) {
            submissionFeedback.textContent = '';
            submissionFeedback.className = 'mt-20 feedback-box'; // Reset feedback style
        }
        
        initializeAceEditor(challenge.starterCode || `// Escreva sua solução para ${challenge.title} aqui`);
        startChallengeTimer();
    }
    
    function startChallengeTimer() {
        clearInterval(currentChallengeTimer);
        challengeStartTime = Date.now();
        if(challengeTimerDisplay) challengeTimerDisplay.textContent = '00:00';
        
        currentChallengeTimer = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - challengeStartTime) / 1000);
            const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
            const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');
            if(challengeTimerDisplay) challengeTimerDisplay.textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    if (submitChallengeBtn) {
        submitChallengeBtn.addEventListener('click', () => {
            clearInterval(currentChallengeTimer);
            const userCode = aceEditor ? aceEditor.getValue() : codeEditorDiv.textContent;
            console.log("Código submetido:", userCode); 

            if(submissionFeedback) {
                submissionFeedback.textContent = 'Processando submissão...';
                submissionFeedback.className = 'mt-20 feedback-box';
            }
            setTimeout(() => {
                const isSuccess = Math.random() > 0.4;
                if (submissionFeedback) {
                    if (isSuccess) {
                        submissionFeedback.textContent = 'Parabéns! Todos os testes passaram!';
                        submissionFeedback.classList.add('success');
                    } else {
                        submissionFeedback.textContent = 'Oops! Alguns testes falharam. Tente novamente.';
                        submissionFeedback.classList.add('error');
                    }
                }
            }, 1500);
        });
    }
    
    if (backToChallengesListBtn) {
        backToChallengesListBtn.addEventListener('click', () => {
            clearInterval(currentChallengeTimer);
            if(challengesListDiv) challengesListDiv.style.display = 'block'; 
            if(challengeResolutionScreenDiv) challengeResolutionScreenDiv.style.display = 'none';
        });
    }

    // --- INTERVIEW SIMULATOR MODULE ---
    function startInterviewSimulator() {
        currentQuestionIndex = -1; 
        if(interviewAnswerTextarea) interviewAnswerTextarea.value = '';
        if(interviewFeedbackDiv) {
            interviewFeedbackDiv.style.display = 'none';
            interviewFeedbackDiv.textContent = '';
        }
        if(interviewQuestionP) interviewQuestionP.textContent = 'Clique em "Próxima Pergunta" para começar.';
        if(interviewAnswerTextarea) interviewAnswerTextarea.disabled = false;
        if(nextQuestionBtn) nextQuestionBtn.disabled = false;

    }

    if (nextQuestionBtn) {
        nextQuestionBtn.addEventListener('click', () => {
            const userAnswer = interviewAnswerTextarea.value;
            
            currentQuestionIndex++;
            if (currentQuestionIndex < mockInterviewQuestions.length) {
                if(interviewQuestionP) interviewQuestionP.textContent = mockInterviewQuestions[currentQuestionIndex];
                if(interviewAnswerTextarea) {
                    interviewAnswerTextarea.value = '';
                    interviewAnswerTextarea.focus();
                }
                if(interviewFeedbackDiv) {
                    interviewFeedbackDiv.style.display = 'none'; // Hide for new q
                    // Show feedback only after the first question and if there was an answer
                     if (currentQuestionIndex > 0 && userAnswer.trim() !== '') {
                        interviewFeedbackDiv.textContent = 'Feedback simples: Lembre-se de usar a técnica STAR para respostas comportamentais quando aplicável.';
                        interviewFeedbackDiv.style.display = 'block';
                    } else if (currentQuestionIndex > 0 && userAnswer.trim() === '') {
                        interviewFeedbackDiv.textContent = 'Tente elaborar uma resposta antes de prosseguir.';
                        interviewFeedbackDiv.style.display = 'block';
                    }
                }
            } else {
                if(interviewQuestionP) interviewQuestionP.textContent = 'Fim do simulador de entrevistas! Bom trabalho.';
                if(interviewAnswerTextarea) {
                    interviewAnswerTextarea.value = '';
                    interviewAnswerTextarea.disabled = true;
                }
                if(nextQuestionBtn) nextQuestionBtn.disabled = true;
                if(interviewFeedbackDiv) {
                    interviewFeedbackDiv.textContent = 'Você completou todas as perguntas. Reveja suas anotações!';
                    interviewFeedbackDiv.style.display = 'block';
                }
                setTimeout(() => { 
                    startInterviewSimulator(); // Reset for new session
                }, 5000);
            }
        });
    }

    // --- CAREER TIPS MODULE ---
    function renderArticles() {
        if (!articlesGridContent) return;
        articlesGridContent.innerHTML = '';
        mockArticles.forEach(article => {
            const card = document.createElement('div');
            card.className = 'article-card';
            // Card content is now wrapped for better padding control with image
            card.innerHTML = `
                <img src="${article.imagePlaceholder}" alt="${article.title}" class="article-image-placeholder">
                <div> 
                    <h3>${article.title}</h3>
                    <p>${article.summary}</p>
                    <button class="btn btn-primary-outline" data-article-id="${article.id}">Ler Artigo</button>
                </div>
            `;
            articlesGridContent.appendChild(card);
        });

        document.querySelectorAll('.article-card button[data-article-id]').forEach(button => {
            button.addEventListener('click', () => {
                const articleId = parseInt(button.getAttribute('data-article-id'));
                loadArticleView(articleId);
            });
        });
    }

    function loadArticleView(articleId) {
        const article = mockArticles.find(a => a.id === articleId);
        if (!article) return;

        if(articlesListContainer) articlesListContainer.style.display = 'none';
        if(articleViewContainer) articleViewContainer.style.display = 'block';

        if(articleTitleView) articleTitleView.textContent = article.title;
        if(articleImageView) {
            articleImageView.src = article.imagePlaceholder;
            articleImageView.alt = article.title;
        }
        if(articleContentView) articleContentView.innerHTML = `<p>${article.fullContent.replace(/\n/g, '</p><p>')}</p>`; 
    }
    
    if (backToArticlesListBtn) {
        backToArticlesListBtn.addEventListener('click', () => {
            if(articlesListContainer) articlesListContainer.style.display = 'block';
            if(articleViewContainer) articleViewContainer.style.display = 'none';
        });
    }

    // --- DASHBOARD MODULE ---
    function loadDashboardData() {
        const challengesCompletedEl = document.getElementById('dashboard-challenges-completed');
        const performanceEl = document.getElementById('dashboard-performance');
        const scoreEl = document.getElementById('dashboard-score');
        const progressChallengesEl = document.getElementById('progress-challenges');
        const progressPerformanceEl = document.getElementById('progress-performance');
        const nextStepsListEl = document.getElementById('dashboard-next-steps');

        if(challengesCompletedEl) challengesCompletedEl.textContent = localStorage.getItem('challengesSolvedCount') || '12';
        if(performanceEl) performanceEl.textContent = 'Ótimo';
        if(scoreEl) scoreEl.textContent = '1570 pts';
        
        if(progressChallengesEl) {
            progressChallengesEl.style.width = '65%';
            progressChallengesEl.textContent = '65%';
        }
        if(progressPerformanceEl) {
            progressPerformanceEl.style.width = '80%';
            progressPerformanceEl.textContent = '80%';
        }

        if(nextStepsListEl) {
            nextStepsListEl.innerHTML = `
                <li>Revisar o desafio "Estruturas de Dados Avançadas".</li>
                <li>Iniciar o módulo de "Design Patterns".</li>
                <li>Ler artigo sobre "Tendências em IA para 2025".</li>
            `;
        }
    }

    // --- INITIAL PAGE LOAD ---
    showSection('home-section'); // Default section
});