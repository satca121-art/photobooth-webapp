// DOM elements
const photoGrid = document.getElementById('photoGrid');
const loadingMessage = document.getElementById('loadingMessage');
const emptyMessage = document.getElementById('emptyMessage');
const photoCount = document.getElementById('photoCount');
const refreshBtn = document.getElementById('refreshBtn');
const deleteAllBtn = document.getElementById('deleteAllBtn');

// Load photos on page load
loadPhotos();

// Refresh button
refreshBtn.addEventListener('click', loadPhotos);

// Delete all button
deleteAllBtn.addEventListener('click', async () => {
  if (!confirm('Are you sure you want to delete all photos? This cannot be undone.')) {
    return;
  }

  try {
    deleteAllBtn.disabled = true;
    deleteAllBtn.textContent = 'Deleting...';

    // Get all photos
    const { data: photos, error: fetchError } = await window.supabaseClient
      .from('photos')
      .select('*');

    if (fetchError) throw fetchError;

    // Delete from storage
    const filePaths = photos.map(p => p.file_path);
    if (filePaths.length > 0) {
      const { error: storageError } = await window.supabaseClient.storage
        .from('photobooth-photos')
        .remove(filePaths);

      if (storageError) throw storageError;
    }

    // Delete from database
    const { error: dbError } = await window.supabaseClient
      .from('photos')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (dbError) throw dbError;

    loadPhotos();
  } catch (error) {
    console.error('Error deleting photos:', error);
    alert('Error deleting photos. Please try again.');
  } finally {
    deleteAllBtn.disabled = false;
    deleteAllBtn.textContent = 'Delete All';
  }
});

// Load photos from database
async function loadPhotos() {
  try {
    loadingMessage.style.display = 'block';
    emptyMessage.style.display = 'none';
    photoGrid.innerHTML = '';

    const { data: photos, error } = await window.supabaseClient
      .from('photos')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) throw error;

    loadingMessage.style.display = 'none';

    if (!photos || photos.length === 0) {
      emptyMessage.style.display = 'block';
      photoCount.textContent = 'No photos';
      return;
    }

    photoCount.textContent = `${photos.length} ${photos.length === 1 ? 'photo' : 'photos'}`;

    photos.forEach(photo => {
      const photoCard = createPhotoCard(photo);
      photoGrid.appendChild(photoCard);
    });
  } catch (error) {
    console.error('Error loading photos:', error);
    loadingMessage.textContent = 'Error loading photos';
  }
}

// Create photo card element
function createPhotoCard(photo) {
  const card = document.createElement('div');
  card.className = 'photo-card';

  // Get public URL for the photo
  const { data: urlData } = window.supabaseClient.storage
    .from('photobooth-photos')
    .getPublicUrl(photo.file_path);

  const photoUrl = urlData.publicUrl;

  card.innerHTML = `
    <div class="photo-wrapper">
      <img src="${photoUrl}" alt="Photo" loading="lazy">
    </div>
    <div class="photo-info">
      <div class="photo-details">
        <p class="photo-date">${formatDate(photo.uploaded_at)}</p>
        <p class="photo-size">${formatFileSize(photo.file_size)}</p>
      </div>
      <div class="photo-actions">
        <button class="action-btn view-btn" onclick="viewPhoto('${photoUrl}')">View</button>
        <button class="action-btn download-btn" onclick="downloadPhoto('${photoUrl}', '${photo.file_name}', '${photo.id}')">Download</button>
        <button class="action-btn delete-btn" onclick="deletePhoto('${photo.id}', '${photo.file_path}')">Delete</button>
      </div>
    </div>
  `;

  return card;
}

// View photo in new tab
window.viewPhoto = function(url) {
  window.open(url, '_blank');
};

// Download photo
window.downloadPhoto = async function(url, filename, photoId) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();

    // Update download count
    await window.supabaseClient
      .from('photos')
      .update({ download_count: window.supabaseClient.raw('download_count + 1') })
      .eq('id', photoId);
  } catch (error) {
    console.error('Error downloading photo:', error);
    alert('Error downloading photo. Please try again.');
  }
};

// Delete photo
window.deletePhoto = async function(photoId, filePath) {
  if (!confirm('Are you sure you want to delete this photo?')) {
    return;
  }

  try {
    // Delete from storage
    const { error: storageError } = await window.supabaseClient.storage
      .from('photobooth-photos')
      .remove([filePath]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await window.supabaseClient
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (dbError) throw dbError;

    loadPhotos();
  } catch (error) {
    console.error('Error deleting photo:', error);
    alert('Error deleting photo. Please try again.');
  }
};

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Logo click handler
document.addEventListener('DOMContentLoaded', () => {
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', () => window.location.href = 'index.html');
  }
});
