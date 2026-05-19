// Initialize Lucide Icons
lucide.createIcons();

// --- Toast System ---
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast slide-in ${type}`;
  toast.innerHTML = `<i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i> ${message}`;
  container.appendChild(toast);
  lucide.createIcons();
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyAy8tuXOyGrdSEaJ6pfUfD00pvWCqlv5oU",
  authDomain: "hc-agent-3050a.firebaseapp.com",
  projectId: "hc-agent-3050a",
  storageBucket: "hc-agent-3050a.firebasestorage.app",
  messagingSenderId: "230682956952",
  appId: "1:230682956952:web:de0cae362a012c31a42ced"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- UI Navigation & Mobile Sidebar ---
const sidebar = document.getElementById('sidebar');
const mobileOverlay = document.getElementById('mobile-sidebar-overlay');

document.getElementById('btn-open-sidebar').addEventListener('click', () => {
  sidebar.classList.add('open');
  mobileOverlay.style.display = 'block';
});
const closeSidebar = () => {
  sidebar.classList.remove('open');
  mobileOverlay.style.display = 'none';
};
document.getElementById('btn-close-sidebar').addEventListener('click', closeSidebar);
mobileOverlay.addEventListener('click', closeSidebar);

window.switchPage = function(pageId) {
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

window.switchTab = function(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById(`tab-${tabId}`).classList.add('active');
  const navItem = document.querySelector(`[data-tab="${tabId}"]`);
  if(navItem) navItem.classList.add('active');
  if(window.innerWidth <= 768) closeSidebar();
}

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', (e) => switchTab(e.currentTarget.getAttribute('data-tab')));
});

window.closeModal = function(id) {
  document.getElementById(id).style.display = 'none';
}

// --- Authentication ---
auth.onAuthStateChanged(user => {
  if (user) {
    switchPage('page-dashboard');
    document.getElementById('user-email-display').textContent = user.email;
    document.getElementById('user-avatar').textContent = user.email.charAt(0).toUpperCase();
    loadData(user.uid);
  } else {
    switchPage('page-login');
  }
});

document.getElementById('btn-login').addEventListener('click', async () => {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-pass').value;
  if(!email || !pass) return showToast('Please enter email and password', 'error');

  const btnText = document.getElementById('login-text');
  const spinner = document.getElementById('login-spinner');
  btnText.style.display = 'none';
  spinner.style.display = 'block';
  document.getElementById('btn-login').disabled = true;

  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch (error) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      try {
        await auth.createUserWithEmailAndPassword(email, pass);
        showToast('Account created successfully!');
      } catch (err2) {
        showToast(err2.message, 'error');
      }
    } else {
      showToast(error.message, 'error');
    }
  } finally {
    btnText.style.display = 'block';
    spinner.style.display = 'none';
    document.getElementById('btn-login').disabled = false;
  }
});

document.getElementById('btn-logout').addEventListener('click', () => {
  auth.signOut();
  showToast('Logged out successfully');
});

// --- Data Loading & Real-time Listeners ---
let userApiKey = '';

function loadData(uid) {
  // Settings (API Key)
  db.collection('users').doc(uid).collection('settings').doc('profile').onSnapshot(doc => {
    if(doc.exists && doc.data().apiKey) {
      userApiKey = doc.data().apiKey;
      document.getElementById('setting-apikey').value = userApiKey;
    }
  });

  // Expenses
  db.collection('users').doc(uid).collection('expenses').orderBy('createdAt', 'desc').onSnapshot(snap => {
    const list = document.getElementById('expenses-list');
    list.innerHTML = '';
    let total = 0;
    snap.forEach(doc => {
      const data = doc.data();
      total += data.amount;
      list.innerHTML += `
        <div class="glass-card list-item">
          <div style="flex: 1">
            <h4 style="font-size: 15px; font-weight: 600;">${data.title}</h4>
            <p style="font-size: 12px; color: #64748b; margin-top: 4px;">
              <span style="color: #3b82f6">${data.category || 'Other'}</span>
            </p>
          </div>
          <span style="font-size: 16px; font-weight: 700; color: #f97316; margin-right: 12px;">৳${data.amount}</span>
          <button class="icon-btn" onclick="openExpenseModal('${doc.id}', '${data.title}', ${data.amount}, '${data.category||'Other'}')" title="Edit"><i data-lucide="edit-3"></i></button>
          <button class="icon-btn" onclick="deleteDoc('expenses', '${doc.id}')" style="color: #ef4444;" title="Delete"><i data-lucide="trash-2"></i></button>
        </div>
      `;
    });
    document.getElementById('dash-expenses').textContent = `৳${total}`;
    lucide.createIcons();
  });

  // Notes
  db.collection('users').doc(uid).collection('notes').orderBy('createdAt', 'desc').onSnapshot(snap => {
    const list = document.getElementById('notes-list');
    list.innerHTML = '';
    let count = 0;
    snap.forEach(doc => {
      count++;
      const data = doc.data();
      list.innerHTML += `
        <div class="glass-card" style="padding: 20px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <h3 style="font-size: 16px; font-weight: 700;">${data.title}</h3>
            <div style="display: flex; gap: 4px;">
              <button class="icon-btn" onclick="openNoteModal('${doc.id}', \`${data.title.replace(/`/g, '')}\`, \`${(data.content||'').replace(/`/g, '')}\`)"><i data-lucide="edit-3"></i></button>
              <button class="icon-btn" onclick="deleteDoc('notes', '${doc.id}')" style="color: #ef4444;"><i data-lucide="trash-2"></i></button>
            </div>
          </div>
          <p style="font-size: 13px; color: #94a3b8; line-height: 1.6; flex: 1; white-space: pre-wrap;">${data.content}</p>
        </div>
      `;
    });
    document.getElementById('dash-notes').textContent = count;
    lucide.createIcons();
  });

  // Tasks
  db.collection('users').doc(uid).collection('tasks').orderBy('createdAt', 'desc').onSnapshot(snap => {
    const list = document.getElementById('tasks-list');
    list.innerHTML = '';
    let pendingCount = 0;
    snap.forEach(doc => {
      const data = doc.data();
      if (!data.isCompleted) pendingCount++;
      list.innerHTML += `
        <div class="glass-card list-item" style="opacity: ${data.isCompleted ? '0.5' : '1'}; transition: opacity 0.3s;">
          <input type="checkbox" ${data.isCompleted ? 'checked' : ''} onchange="toggleTask('${doc.id}', this.checked)" style="width: 18px; height: 18px; cursor: pointer; accent-color: #3b82f6;">
          <div style="flex: 1; text-decoration: ${data.isCompleted ? 'line-through' : 'none'}; margin-left: 12px;">
            <h4 style="font-size: 15px; font-weight: 600; color: ${data.isCompleted ? '#64748b' : 'white'};">${data.taskName}</h4>
            <p style="font-size: 12px; color: #64748b; margin-top: 4px;"><i data-lucide="calendar" style="width: 12px; height: 12px; display: inline; margin-bottom: -2px;"></i> ${data.dueDate}</p>
          </div>
          <button class="icon-btn" onclick="openTaskModal('${doc.id}', \`${data.taskName}\`, '${data.dueDate}')"><i data-lucide="edit-3"></i></button>
          <button class="icon-btn" onclick="deleteDoc('tasks', '${doc.id}')" style="color: #ef4444;"><i data-lucide="trash-2"></i></button>
        </div>
      `;
    });
    document.getElementById('dash-tasks').textContent = pendingCount;
    lucide.createIcons();
  });
}

// Global functions for inline HTML event handlers
window.deleteDoc = (collection, id) => {
  if(confirm('Are you sure you want to delete this?')) {
    db.collection('users').doc(auth.currentUser.uid).collection(collection).doc(id).delete();
    showToast('Deleted successfully');
  }
};

window.toggleTask = (id, isCompleted) => {
  db.collection('users').doc(auth.currentUser.uid).collection('tasks').doc(id).update({ isCompleted });
};

// --- Modals Add / Edit Logic ---
window.openExpenseModal = (id = '', title = '', amount = '', category = 'Food') => {
  document.getElementById('expense-modal-title').textContent = id ? 'Edit Expense' : 'Add Expense';
  document.getElementById('exp-id').value = id;
  document.getElementById('exp-title').value = title;
  document.getElementById('exp-amount').value = amount;
  document.getElementById('exp-category').value = category;
  document.getElementById('modal-expense').style.display = 'flex';
};

document.getElementById('btn-save-expense').addEventListener('click', () => {
  const id = document.getElementById('exp-id').value;
  const title = document.getElementById('exp-title').value;
  const amount = document.getElementById('exp-amount').value;
  const category = document.getElementById('exp-category').value;
  
  if(!title || !amount) return showToast('Please fill all fields', 'error');

  const data = { title, amount: parseFloat(amount), category };
  
  if(id) {
    db.collection('users').doc(auth.currentUser.uid).collection('expenses').doc(id).update(data);
    showToast('Expense updated!');
  } else {
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    db.collection('users').doc(auth.currentUser.uid).collection('expenses').add(data);
    showToast('Expense added!');
  }
  closeModal('modal-expense');
});

// Auto Categorize Expense with Gemini
document.getElementById('btn-auto-cat').addEventListener('click', async (e) => {
  e.preventDefault();
  const title = document.getElementById('exp-title').value;
  if(!title) return showToast('Please enter a title first', 'error');
  if(!userApiKey) return showToast('Please set Gemini API Key in Settings', 'error');

  const btn = document.getElementById('btn-auto-cat');
  btn.innerHTML = '<div class="spinner" style="width: 16px; height: 16px;"></div>';
  btn.disabled = true;

  try {
    const prompt = `Categorize this expense item: "${title}". Respond ONLY with one of these exact words: Food, Transport, Shopping, Bills, Other.`;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${userApiKey.trim()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if(!res.ok) {
      const errorData = await res.json().catch(()=>({}));
      throw new Error(errorData?.error?.message || `API Error: ${res.status}`);
    }
    const data = await res.json();
    const cat = data.candidates[0].content.parts[0].text.trim();
    if(['Food','Transport','Shopping','Bills','Other'].includes(cat)) {
      document.getElementById('exp-category').value = cat;
      showToast(`Auto-categorized as ${cat}`);
    } else {
      document.getElementById('exp-category').value = 'Other';
    }
  } catch(err) {
    showToast(`AI Error: ${err.message}`, 'error');
  } finally {
    btn.innerHTML = '<i data-lucide="sparkles"></i>';
    btn.disabled = false;
    lucide.createIcons();
  }
});

// Notes
window.openNoteModal = (id = '', title = '', content = '') => {
  document.getElementById('note-modal-title').textContent = id ? 'Edit Note' : 'New Note';
  document.getElementById('note-id').value = id;
  document.getElementById('note-title').value = title;
  document.getElementById('note-content').value = content;
  document.getElementById('modal-note').style.display = 'flex';
};

document.getElementById('btn-save-note').addEventListener('click', () => {
  const id = document.getElementById('note-id').value;
  const title = document.getElementById('note-title').value;
  const content = document.getElementById('note-content').value;
  
  if(!title) return showToast('Title is required', 'error');

  const data = { title, content };
  if(id) {
    db.collection('users').doc(auth.currentUser.uid).collection('notes').doc(id).update(data);
    showToast('Note updated!');
  } else {
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    db.collection('users').doc(auth.currentUser.uid).collection('notes').add(data);
    showToast('Note added!');
  }
  closeModal('modal-note');
});

// Tasks
window.openTaskModal = (id = '', title = '', date = '') => {
  document.getElementById('task-modal-title').textContent = id ? 'Edit Task' : 'Add Task';
  document.getElementById('task-id').value = id;
  document.getElementById('task-title').value = title;
  document.getElementById('task-date').value = date || new Date().toISOString().split('T')[0];
  document.getElementById('modal-task').style.display = 'flex';
};

document.getElementById('btn-save-task').addEventListener('click', () => {
  const id = document.getElementById('task-id').value;
  const title = document.getElementById('task-title').value;
  const date = document.getElementById('task-date').value;
  
  if(!title) return showToast('Task name is required', 'error');

  const data = { taskName: title, dueDate: date };
  if(id) {
    db.collection('users').doc(auth.currentUser.uid).collection('tasks').doc(id).update(data);
    showToast('Task updated!');
  } else {
    data.isCompleted = false;
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    db.collection('users').doc(auth.currentUser.uid).collection('tasks').add(data);
    showToast('Task added!');
  }
  closeModal('modal-task');
});

// Settings Save
document.getElementById('btn-save-settings').addEventListener('click', () => {
  const apiKey = document.getElementById('setting-apikey').value;
  const btnText = document.getElementById('settings-save-text');
  const spinner = document.getElementById('settings-spinner');
  
  btnText.style.display = 'none';
  spinner.style.display = 'block';

  db.collection('users').doc(auth.currentUser.uid).collection('settings').doc('profile').set({ apiKey }, { merge: true }).then(() => {
    userApiKey = apiKey;
    showToast('Settings Saved Successfully!');
    btnText.style.display = 'block';
    spinner.style.display = 'none';
  });
});

// --- AI Chat Logic ---
const chatMessages = document.getElementById('chat-messages');
const aiInput = document.getElementById('ai-input');
const btnAiSend = document.getElementById('btn-ai-send');

function addChatMessage(text, sender) {
  const div = document.createElement('div');
  div.className = `chat-bubble fade-in ${sender}`;
  // Parse markdown if it's from AI
  if(sender === 'ai' && typeof marked !== 'undefined') {
    div.innerHTML = marked.parse(text);
  } else {
    div.textContent = text;
  }
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

btnAiSend.addEventListener('click', async () => {
  const text = aiInput.value.trim();
  if(!text) return;
  if(!userApiKey) return showToast('Please set Gemini API Key in Settings first', 'error');

  addChatMessage(text, 'user');
  aiInput.value = '';
  
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'chat-bubble ai fade-in';
  loadingDiv.innerHTML = '<div class="spinner" style="width: 16px; height: 16px; border-top-color: #3b82f6;"></div>';
  chatMessages.appendChild(loadingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${userApiKey.trim()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text }] }] })
    });
    
    if(!res.ok) {
      const errorData = await res.json().catch(()=>({}));
      throw new Error(errorData?.error?.message || `API Error: ${res.status}`);
    }
    const data = await res.json();
    const aiText = data.candidates[0].content.parts[0].text;
    
    loadingDiv.remove();
    addChatMessage(aiText, 'ai');
  } catch(err) {
    loadingDiv.remove();
    addChatMessage(`**Error:** ${err.message}`, 'ai');
  }
});

aiInput.addEventListener('keypress', (e) => {
  if(e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    btnAiSend.click();
  }
});
