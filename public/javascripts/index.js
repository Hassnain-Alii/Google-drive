// DOM Elements
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-input');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const filesContainer = document.getElementById('files-container');
const authModal = document.getElementById('auth-modal');
const fileModal = document.getElementById('file-modal');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const loginSubmit = document.getElementById('login-submit');
const signupSubmit = document.getElementById('signup-submit');
const downloadBtn = document.getElementById('download-btn');
const shareBtn = document.getElementById('share-btn');
const deleteBtn = document.getElementById('delete-btn');
const shareSection = document.getElementById('share-section');
const shareSubmit = document.getElementById('share-submit');
const sharedUsers = document.getElementById('shared-users');
const loginSection = document.getElementById('login-section');
const userSection = document.getElementById('user-section');
const username = document.getElementById('username');

// Close modals when clicking on the close button or outside the modal
const closeButtons = document.querySelectorAll('.close');
closeButtons.forEach(button => {
  button.addEventListener('click', () => {
    authModal.style.display = 'none';
    fileModal.style.display = 'none';
    shareSection.style.display = 'none';
  });
});

window.addEventListener('click', (e) => {
  if (e.target === authModal) authModal.style.display = 'none';
  if (e.target === fileModal) fileModal.style.display = 'none';
});

// Show login/signup forms
loginBtn.addEventListener('click', () => {
  loginForm.style.display = 'flex';
  signupForm.style.display = 'none';
  authModal.style.display = 'block';
});

signupBtn.addEventListener('click', () => {
  loginForm.style.display = 'none';
  signupForm.style.display = 'flex';
  authModal.style.display = 'block';
});

showSignup.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.style.display = 'none';
  signupForm.style.display = 'flex';
});

showLogin.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.style.display = 'flex';
  signupForm.style.display = 'none';
});

// Handle file upload
uploadBtn.addEventListener('click', () => {
  // Check if user is logged in
  if (!localStorage.getItem('token')) {
    alert('Please login to upload files');
    loginForm.style.display = 'flex';
    signupForm.style.display = 'none';
    authModal.style.display = 'block';
    return;
  }
  fileInput.click();
});

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    const data = await response.json();
    if (response.ok) {
      alert('File uploaded successfully');
      fetchFiles();
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    alert('Error uploading file');
  }
});

// Handle login
loginSubmit.addEventListener('click', async () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      authModal.style.display = 'none';
      updateUI();
      fetchFiles();
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (error) {
    console.error('Error logging in:', error);
    alert('Error logging in');
  }
});

// Handle signup
signupSubmit.addEventListener('click', async () => {
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  if (!name || !email || !password) {
    alert('Please fill in all fields');
    return;
  }

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();
    if (response.ok) {
      alert('Account created successfully. Please login.');
      loginForm.style.display = 'flex';
      signupForm.style.display = 'none';
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (error) {
    console.error('Error signing up:', error);
    alert('Error signing up');
  }
});

// Handle logout
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  updateUI();
  filesContainer.innerHTML = '<p>Please login to view your files</p>';
});

// Update UI based on login status
function updateUI() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (token) {
    loginSection.style.display = 'none';
    userSection.style.display = 'block';
    username.textContent = user.name || 'User';
  } else {
    loginSection.style.display = 'block';
    userSection.style.display = 'none';
    username.textContent = '';
  }
}

// Fetch files from the server
async function fetchFiles() {
  const token = localStorage.getItem('token');
  if (!token) {
    filesContainer.innerHTML = '<p>Please login to view your files</p>';
    return;
  }

  try {
    const response = await fetch('/api/files', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (response.ok) {
      displayFiles(data);
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (error) {
    console.error('Error fetching files:', error);
    alert('Error fetching files');
  }
}

// Display files in the UI
function displayFiles(files) {
  if (files.length === 0) {
    filesContainer.innerHTML = '<p>No files found</p>';
    return;
  }

  filesContainer.innerHTML = '';
  files.forEach(file => {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.dataset.id = file._id;

    // Determine file icon based on mimetype
    let iconClass = 'file';
    if (file.mimetype.includes('image')) iconClass = 'image';
    else if (file.mimetype.includes('pdf')) iconClass = 'pdf';
    else if (file.mimetype.includes('word')) iconClass = 'word';
    else if (file.mimetype.includes('excel')) iconClass = 'excel';

    // Format file size
    const size = formatFileSize(file.size);

    // Format date
    const date = new Date(file.createdAt).toLocaleDateString();

    fileItem.innerHTML = `
      <div class="file-icon">${getFileIcon(iconClass)}</div>
      <div class="file-name">${file.originalname}</div>
      <div class="file-info">${size} • ${date}</div>
    `;

    fileItem.addEventListener('click', () => showFileDetails(file));
    filesContainer.appendChild(fileItem);
  });
}

// Show file details in modal
function showFileDetails(file) {
  document.getElementById('file-name').textContent = file.originalname;
  document.getElementById('file-date').textContent = new Date(file.createdAt).toLocaleString();
  document.getElementById('file-size').textContent = formatFileSize(file.size);
  
  // Set up download button
  downloadBtn.onclick = () => downloadFile(file._id, file.originalname);
  
  // Set up delete button
  deleteBtn.onclick = () => deleteFile(file._id);
  
  // Set up share button
  shareBtn.onclick = () => {
    shareSection.style.display = shareSection.style.display === 'none' ? 'block' : 'none';
    if (shareSection.style.display === 'block') {
      fetchSharedUsers(file._id);
    }
  };
  
  // Set up share submit button
  shareSubmit.onclick = () => shareFile(file._id);
  
  fileModal.style.display = 'block';
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get file icon based on type
function getFileIcon(type) {
  switch (type) {
    case 'image':
      return '🖼️';
    case 'pdf':
      return '📄';
    case 'word':
      return '📝';
    case 'excel':
      return '📊';
    default:
      return '📁';
  }
}

// Download file
async function downloadFile(fileId, fileName) {
  try {
    const response = await fetch(`/api/files/${fileId}/download`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      const data = await response.json();
      alert(`Error: ${data.message}`);
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    alert('Error downloading file');
  }
}

// Delete file
async function deleteFile(fileId) {    
  if (!confirm('Are you sure you want to delete this file?')) return;

  try {
    const response = await fetch(`/api/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    if (response.ok) {
      alert('File deleted successfully');
      fileModal.style.display = 'none';
      fetchFiles();
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    alert('Error deleting file');
  }
}

// Share file
async function shareFile(fileId) {
  const email = document.getElementById('share-email').value;
  if (!email) {
    alert('Please enter an email address');
    return;
  }

  try {
    const response = await fetch(`/api/files/${fileId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    if (response.ok) {
      alert('File shared successfully');
      document.getElementById('share-email').value = '';
      fetchSharedUsers(fileId);
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (error) {
    console.error('Error sharing file:', error);
    alert('Error sharing file');
  }
}

// Fetch shared users
async function fetchSharedUsers(fileId) {
  try {
    const response = await fetch(`/api/files/${fileId}/shared`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    if (response.ok) {
      displaySharedUsers(data, fileId);
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (error) {
    console.error('Error fetching shared users:', error);
    alert('Error fetching shared users');
  }
}

// Display shared users
function displaySharedUsers(users, fileId) {
  sharedUsers.innerHTML = '';
  if (users.length === 0) {
    sharedUsers.innerHTML = '<p>Not shared with anyone yet</p>';
    return;
  }

  users.forEach(user => {
    const userItem = document.createElement('div');
    userItem.className = 'shared-user';
    userItem.innerHTML = `
      <span>${user.name} (${user.email})</span>
      <span class="remove-share" data-id="${user._id}">×</span>
    `;
    sharedUsers.appendChild(userItem);

    // Add event listener to remove share
    userItem.querySelector('.remove-share').addEventListener('click', () => {
      removeShare(fileId, user._id);
    });
  });
}

// Remove share
async function removeShare(fileId, userId) {
  try {
    const response = await fetch(`/api/files/${fileId}/share/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    if (response.ok) {
      alert('Share removed successfully');
      fetchSharedUsers(fileId);
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (error) {
    console.error('Error removing share:', error);
    alert('Error removing share');
  }
}

// Search files
searchBtn.addEventListener('click', () => {
  const query = searchInput.value.trim();
  if (!query) {
    fetchFiles();
    return;
  }

  searchFiles(query);
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});

async function searchFiles(query) {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`/api/files/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (response.ok) {
      displayFiles(data);
    } else {
      alert(`Error: ${data.message}`);
    }
  } catch (error) {
    console.error('Error searching files:', error);
    alert('Error searching files');
  }
}

// Initialize the app
updateUI();
fetchFiles();