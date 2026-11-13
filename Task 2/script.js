const storageKey = 'taskflow-tasks';
let tasks = JSON.parse(localStorage.getItem(storageKey) || '[]');
let filter = 'all'; let category = 'all';
const $ = (selector) => document.querySelector(selector);
$('#today').textContent = new Intl.DateTimeFormat('en', {weekday:'long', month:'long', day:'numeric'}).format(new Date());
function save(){localStorage.setItem(storageKey, JSON.stringify(tasks)); render();}
function render(){
  const query = $('#search').value.toLowerCase();
  const visible = tasks.filter(task => (filter === 'all' || (filter === 'active' ? !task.done : task.done)) && (category === 'all' || task.category === category) && task.title.toLowerCase().includes(query));
  $('#task-list').innerHTML = visible.map(task => `<article class="task ${task.done ? 'done' : ''}"><button class="check" data-action="toggle" data-id="${task.id}" aria-label="Mark task complete">${task.done ? '✓' : ''}</button><div><div class="task-name">${escapeHtml(task.title)}</div><div class="task-meta">${task.category} ${task.due ? '· Due ' + new Intl.DateTimeFormat('en',{month:'short',day:'numeric'}).format(new Date(task.due + 'T00:00:00')) : ''}</div></div><div class="task-actions"><button data-action="edit" data-id="${task.id}" aria-label="Edit task">✎</button><button data-action="delete" data-id="${task.id}" aria-label="Delete task">×</button></div></article>`).join('');
  $('#empty').hidden = visible.length > 0;
  $('#all-count').textContent = tasks.length; $('#active-count').textContent = tasks.filter(t=>!t.done).length; $('#completed-count').textContent = tasks.filter(t=>t.done).length;
  const done = tasks.length ? Math.round(tasks.filter(t=>t.done).length / tasks.length * 100) : 0; $('#progress-value').textContent = done + '%'; $('.progress-ring').style.setProperty('--progress', done + '%');
}
function escapeHtml(value){return value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));}
function resetForm(task){$('#task-id').value=task?.id||'';$('#task-title').value=task?.title||'';$('#task-category').value=task?.category||'Work';$('#task-due').value=task?.due||'';$('#form-title').textContent=task?'Edit task':'Create a task';$('#task-dialog').showModal();$('#task-title').focus();}
$('#open-form').onclick=()=>resetForm(); $('#close-form').onclick=()=>$('#task-dialog').close();
$('#task-form').addEventListener('submit', event => {event.preventDefault(); const id=$('#task-id').value; const data={title:$('#task-title').value.trim(),category:$('#task-category').value,due:$('#task-due').value}; if(!data.title)return; if(id){tasks=tasks.map(task=>task.id===id?{...task,...data}:task);}else tasks.unshift({id:crypto.randomUUID(),...data,done:false}); $('#task-dialog').close();save();});
$('#task-list').addEventListener('click', event => {const button=event.target.closest('button');if(!button)return;const id=button.dataset.id;const action=button.dataset.action;if(action==='toggle')tasks=tasks.map(t=>t.id===id?{...t,done:!t.done}:t);if(action==='delete')tasks=tasks.filter(t=>t.id!==id);if(action==='edit')resetForm(tasks.find(t=>t.id===id));if(action!=='edit')save();});
document.querySelectorAll('.filter').forEach(button=>button.onclick=()=>{document.querySelectorAll('.filter').forEach(item=>item.classList.remove('active'));button.classList.add('active');filter=button.dataset.filter;$('#list-title').textContent=button.textContent.replace(/\d+/,'').trim();render();});
document.querySelectorAll('.category').forEach(button=>button.onclick=()=>{document.querySelectorAll('.category').forEach(item=>item.classList.remove('active'));button.classList.add('active');category=button.dataset.category;render();}); $('#search').oninput=render; render();
