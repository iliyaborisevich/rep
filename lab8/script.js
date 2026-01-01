document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    const filterAllBtn = document.getElementById('filterAll');
    const filterCompletedBtn = document.getElementById('filterCompleted');
    const filterUncompletedBtn = document.getElementById('filterUncompleted');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const totalTasksSpan = document.getElementById('totalTasks');
    const completedTasksSpan = document.getElementById('completedTasks');
    const pendingTasksSpan = document.getElementById('pendingTasks');
    
    // Ключ для localStorage
    const STORAGE_KEY = 'todoListTasks_v3';
    
    // Текущий фильтр
    let currentFilter = 'all'; // 'all', 'completed', 'uncompleted'
    
    // Массив задач
    let tasks = [];
    
    // Инициализация приложения
    initApp();
    
    // ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========
    // Добавление задачи
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    // Фильтрация задач
    filterAllBtn.addEventListener('click', () => setFilter('all'));
    filterCompletedBtn.addEventListener('click', () => setFilter('completed'));
    filterUncompletedBtn.addEventListener('click', () => setFilter('uncompleted'));
    
    // Управление задачами
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    clearAllBtn.addEventListener('click', clearAllTasks);
    
    // ========== ОСНОВНЫЕ ФУНКЦИИ ==========
    function initApp() {
        loadTasks();
        renderTasks();
        updateStats();
        taskInput.focus();
        
        // Показываем приветственное сообщение
        setTimeout(() => {
            showNotification('Добро пожаловать! Задачи сохраняются автоматически', 'info');
        }, 500);
    }
    
    function addTask() {
        const taskText = taskInput.value.trim();
        
        // Проверка на пустое поле
        if (!taskText) {
            showNotification('Введите текст задачи!', 'error');
            taskInput.focus();
            return;
        }
        
        // Создание новой задачи
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toLocaleString('ru-RU'),
            updatedAt: new Date().toLocaleString('ru-RU')
        };
        
        // Добавление задачи в массив
        tasks.unshift(newTask); // Добавляем в начало
        
        // Сохранение и обновление интерфейса
        saveTasks();
        taskInput.value = '';
        taskInput.focus();
        renderTasks();
        updateStats();
        
        // Показ уведомления
        showNotification('Задача добавлена! ✨', 'success');
    }
    
    function deleteTask(id) {
        // Находим задачу
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex === -1) return;
        
        // Получаем текст задачи для уведомления
        const taskText = tasks[taskIndex].text;
        
        // Анимация удаления
        const taskElement = document.querySelector(`li[data-id="${id}"]`);
        if (taskElement) {
            taskElement.style.animation = 'fadeOut 0.5s forwards';
            
            setTimeout(() => {
                tasks.splice(taskIndex, 1);
                saveTasks();
                renderTasks();
                updateStats();
                showNotification(`Задача "${taskText}" удалена`, 'info');
            }, 300);
        }
    }
    
    function toggleTaskStatus(id) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            tasks[taskIndex].updatedAt = new Date().toLocaleString('ru-RU');
            
            saveTasks();
            renderTasks();
            updateStats();
            
            const status = tasks[taskIndex].completed ? 'выполнена ✅' : 'не выполнена 🔄';
            showNotification(`Задача отмечена как ${status}`, 'success');
        }
    }
    
    function editTask(id) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex === -1) return;
        
        const currentText = tasks[taskIndex].text;
        const newText = prompt('Редактировать задачу:', currentText);
        
        if (newText && newText.trim() && newText !== currentText) {
            tasks[taskIndex].text = newText.trim();
            tasks[taskIndex].updatedAt = new Date().toLocaleString('ru-RU');
            
            saveTasks();
            renderTasks();
            showNotification('Задача обновлена! 📝', 'success');
        }
    }
    
    function setFilter(filter) {
        currentFilter = filter;
        
        // Обновляем активную кнопку фильтра
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        switch(filter) {
            case 'all':
                filterAllBtn.classList.add('active');
                break;
            case 'completed':
                filterCompletedBtn.classList.add('active');
                break;
            case 'uncompleted':
                filterUncompletedBtn.classList.add('active');
                break;
        }
        
        renderTasks();
    }
    
    function clearCompletedTasks() {
        const completedCount = tasks.filter(task => task.completed).length;
        
        if (completedCount === 0) {
            showNotification('Нет выполненных задач для удаления', 'info');
            return;
        }
        
        if (confirm(`Удалить ${completedCount} выполненных задач?`)) {
            tasks = tasks.filter(task => !task.completed);
            saveTasks();
            renderTasks();
            updateStats();
            showNotification(`Удалено ${completedCount} выполненных задач 🗑️`, 'success');
        }
    }
    
    function clearAllTasks() {
        if (tasks.length === 0) {
            showNotification('Список задач уже пуст', 'info');
            return;
        }
        
        if (confirm('Удалить ВСЕ задачи? Это действие нельзя отменить.')) {
            tasks = [];
            saveTasks();
            renderTasks();
            updateStats();
            showNotification('Все задачи удалены 🧹', 'success');
        }
    }
    
    // ========== РЕНДЕРИНГ ИНТЕРФЕЙСА ==========
    function renderTasks() {
        // Фильтрация задач
        let filteredTasks = [];
        
        switch(currentFilter) {
            case 'completed':
                filteredTasks = tasks.filter(task => task.completed);
                break;
            case 'uncompleted':
                filteredTasks = tasks.filter(task => !task.completed);
                break;
            default: // 'all'
                filteredTasks = tasks;
                break;
        }
        
        // Очистка списка
        taskList.innerHTML = '';
        
        // Проверка на пустой список
        if (filteredTasks.length === 0) {
            emptyState.style.display = 'block';
            
            // Сообщение в зависимости от фильтра
            if (tasks.length === 0) {
                emptyState.querySelector('h3').textContent = 'Список пуст';
                emptyState.querySelector('p').textContent = 'Добавьте свою первую задачу!';
            } else {
                switch(currentFilter) {
                    case 'completed':
                        emptyState.querySelector('h3').textContent = 'Нет выполненных задач';
                        emptyState.querySelector('p').textContent = 'Вы еще не выполнили ни одной задачи';
                        break;
                    case 'uncompleted':
                        emptyState.querySelector('h3').textContent = 'Все задачи выполнены!';
                        emptyState.querySelector('p').textContent = '🎉 Отличная работа!';
                        break;
                }
            }
        } else {
            emptyState.style.display = 'none';
            
            // Отображение отфильтрованных задач
            filteredTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''}`;
                li.setAttribute('data-id', task.id);
                
                li.innerHTML = `
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTaskStatus(${task.id})">
                        ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                    <div class="task-content" onclick="toggleTaskStatus(${task.id})">
                        <div class="task-text">${escapeHtml(task.text)}</div>
                        <div class="task-date">
                            <i class="far fa-calendar"></i>
                            Добавлено: ${task.createdAt}
                            ${task.updatedAt !== task.createdAt ? ` | Обновлено: ${task.updatedAt}` : ''}
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="task-edit" onclick="editTask(${task.id})">
                            <i class="fas fa-edit"></i> Изменить
                        </button>
                        <button class="task-delete" onclick="deleteTask(${task.id})">
                            <i class="fas fa-trash"></i> Удалить
                        </button>
                    </div>
                `;
                
                taskList.appendChild(li);
            });
        }
    }
    
    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const pending = total - completed;
        
        totalTasksSpan.textContent = total;
        completedTasksSpan.textContent = completed;
        pendingTasksSpan.textContent = pending;
    }
    
    // ========== LOCALSTORAGE ==========
    function saveTasks() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        } catch (e) {
            console.error('Ошибка сохранения в localStorage:', e);
            showNotification('Ошибка сохранения задач', 'error');
        }
    }
    
    function loadTasks() {
        try {
            const savedTasks = localStorage.getItem(STORAGE_KEY);
            if (savedTasks) {
                tasks = JSON.parse(savedTasks);
            }
        } catch (e) {
            console.error('Ошибка загрузки из localStorage:', e);
            tasks = [];
        }
    }
    
    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
    function showNotification(message, type) {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Добавляем на страницу
        document.body.appendChild(notification);
        
        // Добавляем стили для анимации если их еще нет
        if (!document.querySelector('#notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
            style.textContent = `
                @keyframes fadeOut {
                    from { opacity: 1; transform: translateX(0); }
                    to { opacity: 0; transform: translateX(100px); }
                }
                
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Делаем функции глобальными для inline-обработчиков
    window.deleteTask = deleteTask;
    window.toggleTaskStatus = toggleTaskStatus;
    window.editTask = editTask;
});