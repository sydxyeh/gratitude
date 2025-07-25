// assets/script.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://maeuwexqknsvmmtjqvoy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hZXV3ZXhxa25zdm1tdGpxdm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MTUzMDEsImV4cCI6MjA2ODk5MTMwMX0.pS_tJpM0JaozZA8CGLGZ7gjaQh_2uiQ1Nu2DBdr9JCk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Load header and footer components
function loadComponent(id, path) {
  fetch(path)
    .then(res => res.text())
    .then(html => {
      document.getElementById(id).innerHTML = html;
    });
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('header-container')) {
    loadComponent('header-container', 'components/header.html');
  }
  if (document.getElementById('footer-container')) {
    loadComponent('footer-container', 'components/footer.html');
  }

  // Navigation for Next/Back buttons (basic example)
  const toSend = document.getElementById('to-send');
  if (toSend) {
    toSend.addEventListener('click', () => {
      localStorage.setItem('noteText', document.getElementById('note-input').value);
      localStorage.setItem('senderName', document.getElementById('sender-name').value);
      window.location.href = 'send-note.html';
    });
  }

  // Fill hidden note field before submit for FormSubmit
  const form = document.querySelector('form[action^="https://formsubmit.co"]');
  if (form) {
    form.addEventListener('submit', function(e) {
      const note = localStorage.getItem('noteText') || '';
      const name = localStorage.getItem('senderName') || '';
      document.getElementById('hidden-note').value = `${name ? name + ': ' : ''}${note}`;
    });
  }

  // Show note preview if present
  const notePreview = document.getElementById('note-preview');
  if (notePreview) {
    const note = localStorage.getItem('noteText') || '';
    const name = localStorage.getItem('senderName') || '';
    notePreview.innerHTML = `<strong>${name}</strong><br>${note}`;
  }

  // Confirmation page: show shareable link (optional)
  const shareable = document.getElementById('shareable-link');
  if (shareable) {
    shareable.value = window.location.origin + '/gratitude-app/confirmation.html';
    shareable.style.display = 'block';
  }

  // Handle send-form submission to backend
  const sendForm = document.getElementById('send-form');
  if (sendForm) {
    sendForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const recipientEmail = document.getElementById('recipient-email').value;
      const noteText = localStorage.getItem('noteText') || '';
      const senderName = localStorage.getItem('senderName') || '';
      // If you have a noteId from Supabase, include it here
      // const noteId = ...;

      try {
        const response = await fetch('http://localhost:3000/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipientEmail, senderName, noteText /*, noteId */ })
        });
        if (response.ok) {
          window.location.href = 'confirmation.html';
        } else {
          alert('Error sending note.');
        }
      } catch (err) {
        alert('Error sending note.');
      }
    });
  }

  // Collage page: fetch and display notes as sticky notes
  const collageGrid = document.getElementById('collage-grid');
  const searchSender = document.getElementById('search-sender');
  if (collageGrid) {
    // Fetch notes from Supabase
    async function loadNotes() {
      let { data: notes, error } = await supabase
        .from('notes')
        .select('id, message, sender_id, sender:sender_id(name)')
        .order('id', { ascending: false });
      if (error) {
        collageGrid.innerHTML = '<p style="color:red">Failed to load notes.</p>';
        return;
      }
      window._allNotes = notes;
      renderNotes(notes);
    }
    function renderNotes(notes) {
      collageGrid.innerHTML = '';
      if (!notes.length) {
        collageGrid.innerHTML = '<p>No notes found.</p>';
        return;
      }
      notes.forEach(note => {
        const senderName = note.sender?.name || 'Anonymous';
        const div = document.createElement('div');
        div.className = 'sticky-note';
        div.innerHTML = `<span class="sender">${senderName}</span>${note.message}`;
        collageGrid.appendChild(div);
      });
    }
    // Initial load
    loadNotes();
    // Search functionality
    if (searchSender) {
      searchSender.addEventListener('input', function() {
        const val = this.value.trim().toLowerCase();
        const filtered = window._allNotes.filter(n => (n.sender?.name || '').toLowerCase().includes(val));
        renderNotes(filtered);
      });
    }
  }
});

// Toast message utility
function showToast(msg) {
  let toast = document.getElementById('toast-message');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-message';
    toast.className = 'toast-message';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 2500);
}
