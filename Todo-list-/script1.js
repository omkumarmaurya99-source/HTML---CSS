document.addEventListener('DOMContentLoaded', () => {

    // Elements
    const landingWrapper = document.getElementById('landing-wrapper');
    const appDashboard = document.getElementById('app-dashboard');
    const proceedBtn = document.getElementById('proceed-btn');
    const logoutBtn = document.getElementById('logout-btn');

    const userNameInput = document.getElementById('user-name');
    const userAgeInput = document.getElementById('user-age');

    const greetingText = document.getElementById('greeting-text');
    const ageDisplay = document.getElementById('age-display');
    const streakDisplay = document.getElementById('streak-display');

    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // State
    let appData = JSON.parse(localStorage.getItem('neu-todo-data')) || {
        user: { name: '', age: '' },
        streak: { count: 0, lastLogin: null },
        todos: []
    };

    let currentFilter = 'all';

    // Initialization
    function init() {
        if (appData.user.name && appData.user.age) {
            // User already registered
            checkStreak();
            showDashboard();
        } else {
            // Require user to enter info
            landingWrapper.classList.remove('hidden');
            appDashboard.classList.add('hidden');
        }
    }

    init();

    // UI Switching
    function showDashboard() {
        landingWrapper.classList.add('hidden');
        appDashboard.classList.remove('hidden');

        // Reset body properties for the dashboard view
        document.body.style.alignItems = 'center';

        updateUserDisplay();
        renderTodos();
    }

    function showLanding() {
        landingWrapper.classList.remove('hidden');
        appDashboard.classList.add('hidden');
        document.body.style.alignItems = 'flex-start';

        // Scroll to top
        window.scrollTo(0, 0);
    }

    // Streak Logic (Daily Login Based)
    function checkStreak() {
        const today = new Date().toDateString();

        if (appData.streak.lastLogin !== today) {
            if (!appData.streak.lastLogin) {
                appData.streak.count = 1;
            } else {
                const lastLoginDate = new Date(appData.streak.lastLogin);
                const todayDate = new Date(today);
                const diffTime = Math.abs(todayDate - lastLoginDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    appData.streak.count += 1;
                } else if (diffDays > 1) {
                    appData.streak.count = 1; // Broken streak
                }
            }
            appData.streak.lastLogin = today;
            saveData();
        }
    }

    // Auth Buttons
    proceedBtn.addEventListener('click', () => {
        const name = userNameInput.value.trim();
        const age = userAgeInput.value.trim();

        if (!name || !age) {
            alert('COMPLETE THE FIELDS. NO EXCUSES.');
            return;
        }

        appData.user.name = name;
        appData.user.age = age;

        checkStreak();
        saveData();
        showDashboard();
    });

    // Add logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm("Log out? This won't delete your tasks, but will require you to enter your name again.")) {
                appData.user.name = '';
                appData.user.age = '';
                saveData();
                showLanding();
            }
        });
    }

    function updateUserDisplay() {
        greetingText.textContent = `HELLO, ${appData.user.name.toUpperCase()}!`;
        ageDisplay.textContent = `AGE: ${appData.user.age}`;
        streakDisplay.textContent = `🔥 STREAK: ${appData.streak.count} DAY${appData.streak.count !== 1 ? 'S' : ''}`;
    }

    // Tools
    function saveData() {
        localStorage.setItem('neu-todo-data', JSON.stringify(appData));
    }

    // Todos Event Listeners
    if (addBtn) {
        addBtn.addEventListener('click', addTodo);
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTodo();
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });

    function addTodo() {
        const text = todoInput.value.trim();
        if (text) {
            appData.todos.unshift({
                id: Date.now().toString(),
                text: text,
                completed: false
            });
            todoInput.value = '';

            if (currentFilter === 'completed') {
                document.querySelector('[data-filter="all"]').click();
            } else {
                saveData();
                renderTodos();
            }
        }
    }

    function toggleTodo(id) {
        appData.todos = appData.todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        saveData();
        renderTodos();
    }

    function deleteTodo(id) {
        appData.todos = appData.todos.filter(todo => todo.id !== id);
        saveData();
        renderTodos();
    }

    window.toggleTodo = toggleTodo;
    window.deleteTodo = deleteTodo;

    function renderTodos() {
        if (!todoList) return;
        todoList.innerHTML = '';

        let filteredTodos = appData.todos;
        if (currentFilter === 'active') {
            filteredFiltered = appData.todos.filter(t => !t.completed); // typo fix
            filteredTodos = appData.todos.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            filteredTodos = appData.todos.filter(t => t.completed);
        }

        if (filteredTodos.length === 0) {
            const emptyMsgs = {
                'all': 'NOTHING TO DO. GO READ A BOOK.',
                'active': "ALL DONE. NO EXCUSES.",
                'completed': "YOU HAVEN'T DONE ANYTHING YET."
            };

            todoList.innerHTML = `
                <div class="empty-state">
                    ${emptyMsgs[currentFilter]}
                </div>
            `;
        } else {
            filteredTodos.forEach(todo => {
                const li = document.createElement('li');
                li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

                li.innerHTML = `
                    <div class="todo-content" onclick="toggleTodo('${todo.id}')">
                        <div class="neu-checkbox">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <span class="todo-text"></span>
                    </div>
                    <button class="delete-btn" onclick="deleteTodo('${todo.id}')" aria-label="Delete">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                `;

                li.querySelector('.todo-text').textContent = todo.text;
                todoList.appendChild(li);
            });
        }
    }
});
