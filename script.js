// task group selectors
const grpContainer = document.querySelector('[data-taskgrp]');
const taskgrpForm = document.querySelector('[data-new-taskgrp-form]');
const newTaskgrpInput = document.querySelector('[data-new-taskgrp-list]');
const deleteGrpBtn = document.querySelector('[data-delete-group]');

// todos selectors 
const todoContainer = document.querySelector('[data-todo-whole-container]');
const headerTitle = document.querySelector('[data-todo-header-title]');
const count = document.querySelector('[data-todo-header-count]');
const tasksContainer = document.querySelector('[data-whole-task]');

const newTaskForm = document.querySelector('[data-new-todo-form]');
const newTaskInput = document.querySelector('[data-new-task-input]');

const taskTemplate = document.getElementById('task-template');
const clearComplete = document.querySelector('[data-clear-complete-task]');

// local storage in client's browser
const storage = 'task.task_grp'; // create unique name for preventing any interference over other data

let task_grp = JSON.parse(localStorage.getItem(storage)) || [] ;
// json parse takes in a json object but in string format
// json is like "{'task.task_grp' : our data}"
// after parsing it becomes object 
// holds task group names 

const storage_id = 'task.selectedGrpId';
let selectedGrpId = localStorage.getItem(storage_id);  // returns null if not found


// group container event listener that checks what li element is clicked and sets its id to selected id 
grpContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'li') {
        selectedGrpId = e.target.dataset.listId; // gives the value of selected id
    }
    saveAndRender();
})

// task container listener
tasksContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'input'){
        const selectedGrp = task_grp.find(item => item.id === selectedGrpId);
        const selectedTask = selectedGrp.todos.find(item => item.id === e.target.id) // get the selected group upon task click, then we had made tasks for one group, each of those task has id which we assigned to label so get that selected task
        selectedTask.complete = e.target.checked; // checks true if checked and false if unchecked
        save_to_local();
        renderTodoCount(selectedGrp);
    }
})


// clear all tasks button 
clearComplete.addEventListener('click', e => {
    const selectedGrp = task_grp.find(item => item.id === selectedGrpId);
    selectedGrp.todos = selectedGrp.todos.filter(item => !item.complete);
    saveAndRender();
})
// delete button functionality 
deleteGrpBtn.addEventListener('click', e => {
    task_grp = task_grp.filter((item) => 
    item.id !== selectedGrpId
    );
    selectedGrpId = null;
    saveAndRender();

})

// add event listener to form
taskgrpForm.addEventListener('submit' , e => {
    e.preventDefault(); // stops from refreshing
    // e is default event parameter passed 
    const grpName = newTaskgrpInput.value;
    // if input empty, just return
    if (grpName == null || grpName === "") return;
    const grp = createGrp(grpName); // returns grp obj
    newTaskgrpInput.value = null;
    task_grp.push(grp); // it is an array of grp objects
    saveAndRender();

})

// add event listener to new todo form
newTaskForm.addEventListener('submit' , e => {
    e.preventDefault(); // stops from refreshing
    // e is default event parameter passed 
    const taskName = newTaskInput.value;
    // if input empty, just return
    if (taskName == null || taskName === "") return;
    const task = createTask(taskName);
    newTaskInput.value = null;
    const selectedGrp = task_grp.find(item => item.id === selectedGrpId);
    selectedGrp.todos.push(task)
    saveAndRender();
})

function createTask(taskName) {
    return { 
        id: Date.now().toString(), 
        name: taskName, 
        complete: false
    };
}

function createGrp(groupName){
    return { 
        id: Date.now().toString(), 
        name: groupName, 
        todos: [] 
    };
}

function saveAndRender() {
    save_to_local();
    render();
}

function save_to_local(){
    localStorage.setItem(storage, JSON.stringify(task_grp)); // current existing array is stored in local storage in string json format

    localStorage.setItem(storage_id, selectedGrpId); // current user's selected group is also stored in local storage
}


function render() {
    clearElement(grpContainer); // do not want any preexisting html to be displayed
    renderTaskGrp();

    // select list from array on basis of selected id 
    const selectedGrp = task_grp.find(lst => lst.id === selectedGrpId);
    
    if (selectedGrpId == null){
        headerTitle.innerText = 'Select a task group';
        count.innerText = 'xxxx';
    }
    else {
        headerTitle.innerText = selectedGrp.name;
        renderTodoCount(selectedGrp);
        clearElement(tasksContainer);
        renderTodos(selectedGrp);
    }
}

// render todos 
function renderTodos(selectedGrp){
    // takes in the selected group object, iterates on the task array over it and gets the template declared in html (so that each task has same css styles)
    selectedGrp.todos.forEach(item => {
        const todoEl = document.importNode(taskTemplate.content, true);
        // the above live imports all the content of the taskTemplate, as true is mentioned so it will get all the content 
        const checkbox = todoEl.querySelector('input');
        checkbox.id = item.id;
        checkbox.checked = item.complete;
        const label = todoEl.querySelector('label');
        label.htmlFor = checkbox.id;
        label.append(item.name); // appends text into label
        tasksContainer.appendChild(todoEl);
    })
}

// get count of tasks
function renderTodoCount(selectedGrp){
    // we need to show number of incomplete tasks on the ui
    // we make the task array as - {id: , name: , complete: true/false}
    // we then get the selected group, get its task key and its an array so we filter it untill we get all false tasks and get its length
    const incompleteTodoCount = selectedGrp.todos.filter(item => !item.complete).length

    // if there is 1 count only 
    const todoString = incompleteTodoCount === 1 ? "todo" : "todos";
    count.innerText = `${incompleteTodoCount} ${todoString} remaining`;

}


function renderTaskGrp(){
    task_grp.forEach((list) => {
        // for each group name iterate and create li tag
        const listElement = document.createElement('li');
        // add id to list
        listElement.dataset.listId = list.id;
        // add css class functionality to newly li created element
        listElement.classList.add('group-name');
        // add text inside
        listElement.innerText = list.name;
        // if the 
        if (list.id === selectedGrpId){
            listElement.classList.add('active-group');
        }
        // so, take arr, put names in it, make li's and add classes into it, then set text and then finally append it to the html as ul's child
        grpContainer.appendChild(listElement);
    })
}


// removes first child iteratively so that pre written html is erased from dom
function clearElement(element) {
    while (element.firstChild){
        element.removeChild(element.firstChild); 
    }
}

render();
