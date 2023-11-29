import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

document.getElementById('search-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const searchQuery = e.target.elements.searchQuery.value;

  // Verificați dacă câmpul de căutare nu este gol
  if (!searchQuery.trim()) {
    showNotification('Please enter a search query.');
    return;
  }

  // Apelați funcția pentru a face cererea către API
  searchImages(searchQuery);
});

let currentPage = 1;
let loadingMore = false;

window.addEventListener('scroll', () => {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
    !loadingMore
  ) {
    loadingMore = true;
    loadMoreImages();
  }
});

function showNotification(message) {
  Notiflix.Notify.warning(message);
}

function searchImages(query, page = 1) {
  // Adăugați cheia API Pixabay aici
  const apiKey = '40897523-298f69bbdc7791e1add26dc98';

  // Configurați parametrii pentru solicitarea HTTP
  const params = {
    key: apiKey,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  };

  // Faceți solicitarea HTTP folosind Axios
  axios
    .get('https://pixabay.com/api/', { params: { ...params, page } })
    .then(response => {
      const images = response.data.hits;
      const totalHits = response.data.totalHits;

      // Verificați dacă există imagini
      if (images.length === 0) {
        showNotification(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }

      // Aici puteți manipula imaginile cum doriți, de exemplu, le puteți adăuga în galerie
      displayImages(images);

      // Adăugați notificarea după prima solicitare
      if (page === 1) {
        showNotification(`Hooray! We found ${totalHits} images.`);
      }

      loadingMore = false; // Setăm loadingMore la false după ce am primit răspunsul
    })
    .catch(error => {
      console.error('Error searching images:', error);
      showNotification(
        'An error occurred while searching for images. Please try again.'
      );
    });
}

function displayImages(images) {
  const gallery = document.querySelector('.gallery');

  // Curățați galeria înainte de a adăuga noi imagini
  gallery.innerHTML = '';

  images.forEach(image => {
    const card = createImageCard(image);
    gallery.appendChild(card);
  });

  // După adăugarea cardurilor, actualizați Lightbox
  const lightbox = new SimpleLightbox('.gallery a');
  lightbox.refresh();

  // Afișați butonul "Load more" dacă mai sunt imagini disponibile
  const loadMoreButton = document.querySelector('.load-more');

  if (loadMoreButton) {
    // Verificați dacă există butonul înainte de a încerca să accesați proprietatea 'style'
    loadMoreButton.style.display = images.length < 40 ? 'none' : 'block';

    // Adăugați eveniment pentru butonul "Load more"
    loadMoreButton.removeEventListener('click', loadMoreImages); // Eliminați orice event listener anterior
    loadMoreButton.addEventListener('click', loadMoreImages);
  }
}

// Adăugați funcția pentru derularea fluidă a paginii
function smoothScrollTo(element) {
  window.scroll({
    top: element.offsetTop,
    behavior: 'smooth',
  });
}

// În funcția loadMoreImages, după ce ați primit răspunsul cu imaginile noi, adăugați apelul pentru derulare fluidă
function loadMoreImages() {
  currentPage++;
  const searchQuery =
    document.getElementById('search-form').elements.searchQuery.value;
  searchImages(searchQuery, currentPage);

  // Obțineți ultimul card adăugat și derulați fluid la el
  const gallery = document.querySelector('.gallery');
  const lastCard = gallery.lastElementChild;
  smoothScrollTo(lastCard);
}

function createImageCard(image) {
  const card = document.createElement('a'); // Folosim un element de ancoră pentru Lightbox
  card.href = image.largeImageURL;
  card.className = 'photo-card';

  const imageElement = document.createElement('img');
  imageElement.src = image.webformatURL;
  imageElement.alt = image.tags;

  const info = document.createElement('div');
  info.className = 'info';

  const likes = document.createElement('p');
  likes.className = 'info-item';
  likes.innerHTML = `<b>Likes:</b> ${image.likes}`;
  info.appendChild(likes);

  const views = document.createElement('p');
  views.className = 'info-item';
  views.innerHTML = `<b>Views:</b> ${image.views}`;
  info.appendChild(views);

  const comments = document.createElement('p');
  comments.className = 'info-item';
  comments.innerHTML = `<b>Comments:</b> ${image.comments}`;
  info.appendChild(comments);

  const downloads = document.createElement('p');
  downloads.className = 'info-item';
  downloads.innerHTML = `<b>Downloads:</b> ${image.downloads}`;
  info.appendChild(downloads);

  card.appendChild(imageElement);
  card.appendChild(info);

  return card;
}
