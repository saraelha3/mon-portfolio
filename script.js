document.addEventListener('DOMContentLoaded', () => {

    // --- SÉLECTION DES ÉLÉMENTS DU DOM ---
    const addTaskForm = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-input');
    const taskDueDateInput = document.getElementById('task-due-date');
    const taskDueTimeInput = document.getElementById('task-due-time'); // Nouveau
    const taskPriorityInput = document.getElementById('task-priority');
    const taskList = document.getElementById('task-list');
    const taskCounter = document.getElementById('task-counter');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortOptions = document.getElementById('sort-options');

    // Éléments de la modale
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-task-form');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const editTaskId = document.getElementById('edit-task-id');
    const editTaskText = document.getElementById('edit-task-text');
    const editTaskDueDate = document.getElementById('edit-task-due-date');
    const editTaskDueTime = document.getElementById('edit-task-due-time'); // Nouveau
    const editTaskPriority = document.getElementById('edit-task-priority');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    };

    const renderTasks = () => {
        const filter = document.querySelector('.filter-btn.active').dataset.filter;
        const sortBy = sortOptions.value;

        let filteredTasks = tasks.filter(task => {
            if (filter === 'pending') return !task.completed;
            if (filter === 'completed') return task.completed;
            return true;
        });

        filteredTasks.sort((a, b) => {
            if (sortBy === 'dueDate') {
                // Tri par date ET heure pour plus de précision
                const dateA = a.dueDate ? `${a.dueDate}T${a.dueTime || '00:00'}` : '9999-12-31T23:59';
                const dateB = b.dueDate ? `${b.dueDate}T${b.dueTime || '00:00'}` : '9999-12-31T23:59';
                return dateA.localeCompare(dateB);
            }
            if (sortBy === 'priority') {
                const priorityOrder = { 'haute': 1, 'moyenne': 2, 'basse': 3 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return b.createdAt - a.createdAt;
        });

        taskList.innerHTML = '';
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<li style="text-align:center; color:var(--subtle-text); padding:20px;">Aucune tâche trouvée.</li>';
        } else {
            filteredTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
                li.dataset.id = task.id;
                
                // Logique "en retard" améliorée pour inclure l'heure
                let isOverdue = false;
                if (task.dueDate && !task.completed) {
                    const dueDate = new Date(`${task.dueDate}T${task.dueTime || '23:59:59'}`);
                    if (new Date() > dueDate) {
                        isOverdue = true;
                    }
                }
                
                // Formatage de l'affichage de l'échéance
                let dueDateText = '';
                if(task.dueDate){
                    let date = new Date(task.dueDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    dueDateText = `Échéance : ${date}`;
                    if(task.dueTime){
                        dueDateText += ` à ${task.dueTime}`;
                    }
                }

                li.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} title="Marquer comme terminée">
                    <div class="task-content">
                        <p class="task-title">${task.text}</p>
                        ${dueDateText ? `<div class="task-details">
                            <span class="due-date ${isOverdue ? 'overdue' : ''}">${dueDateText}</span>
                        </div>` : ''}
                    </div>
                    <div class="task-actions">
                        <button class="edit-btn" title="Modifier">✏️</button>
                        <button class="delete-btn" title="Supprimer">🗑️</button>
                    </div>
                `;
                taskList.appendChild(li);
            });
        }
        
        const pendingTasksCount = tasks.filter(t => !t.completed).length;
        taskCounter.textContent = `${pendingTasksCount} tâche(s) en cours`;
    };

    const addTask = (text, dueDate, dueTime, priority) => {
        if (!text) return;
        const newTask = {
            id: Date.now(),
            text, dueDate, dueTime, priority, // Ajout de dueTime
            completed: false,
            createdAt: Date.now()
        };
        tasks.push(newTask);
        saveTasks();
    };

    const openEditModal = (id) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            editTaskId.value = task.id;
            editTaskText.value = task.text;
            editTaskDueDate.value = task.dueDate;
            editTaskDueTime.value = task.dueTime; // Afficher l'heure dans la modale
            editTaskPriority.value = task.priority;
            editModal.classList.add('visible');
        }
    };
    
    // --- ÉVÉNEMENTS ---
    addTaskForm.addEventListener('submit', e => {
        e.preventDefault();
        addTask(taskInput.value, taskDueDateInput.value, taskDueTimeInput.value, taskPriorityInput.value);
        addTaskForm.reset();
        taskPriorityInput.value = 'moyenne';
    });

    editForm.addEventListener('submit', e => {
        e.preventDefault();
        const id = parseInt(editTaskId.value);
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.text = editTaskText.value;
            task.dueDate = editTaskDueDate.value;
            task.dueTime = editTaskDueTime.value; // Sauvegarder l'heure modifiée
            task.priority = editTaskPriority.value;
            saveTasks();
            editModal.classList.remove('visible');
        }
    });

    // --- Le reste des écouteurs d'événements reste identique ---
    const toggleCompleted = (id) => {
        const task = tasks.find(t => t.id === id);
        if (task) { task.completed = !task.completed; saveTasks(); }
    };
    const deleteTask = (id) => {
        if (confirm("Voulez-vous vraiment supprimer cette tâche ?")) {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
        }
    };
    taskList.addEventListener('click', e => {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;
        const id = parseInt(taskItem.dataset.id);
        if (e.target.classList.contains('task-checkbox')) toggleCompleted(id);
        if (e.target.classList.contains('delete-btn')) deleteTask(id);
        if (e.target.classList.contains('edit-btn')) openEditModal(id);
    });
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderTasks();
        });
    });
    sortOptions.addEventListener('change', renderTasks);
    cancelEditBtn.addEventListener('click', () => editModal.classList.remove('visible'));
    editModal.addEventListener('click', e => {
        if (e.target === editModal) editModal.classList.remove('visible');
    });

    // --- INITIALISATION ---
    renderTasks();
});