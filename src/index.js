import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/api/';
const API_KEY = '38313508-2126fd0af6ce64a4e46169eac';

const formEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let query = '';
let page = 1;
let simpleLightBox;
const perPage = 40;

async function fetchImages(query, page, perPage) {
  const response = await axios.get(
    `?key=${API_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`
  );
  return response;
}

function onForm(e) {
  e.preventDefault();
  page = 1;
  query = e.currentTarget.searchQuery.value.trim();
  galleryEl.innerHTML = '';
  loadMoreBtn.classList.add('is-hidden');

  if (query === '') {
    Notiflix.Notify.failure(
      'The search string cannot be empty. Please specify your search query.'
    );
    return;
  }

  fetchImages(query, page, perPage)
    .then(({ data }) => {
      if (data.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        makeGallery(data.hits);
        simpleLightBox = new SimpleLightbox('.gallery a').refresh();
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);

        if (data.totalHits > perPage) {
          loadMoreBtn.classList.remove('is-hidden');
        }
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      formEl.reset();
    });
}

const onLoadMoreBtn = async () => {
  page += 1;
  try {
    const { data } = await fetchImages(query, page, perPage);
    makeGallery(data.hits);
    simpleLightBox = new SimpleLightbox('.gallery a').refresh();

    const totalPages = Math.ceil(data.totalHits / perPage);

    if (page > totalPages) {
      loadMoreBtn.classList.add('is-hidden');
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    console.log(error);
  }
};

function makeGallery(images) {
  const markup = images
    .map(image => {
      const {
        id,
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      } = image;
      return `
          <a class="gallery-link" href="${largeImageURL}">
            <div class="photo-card" id="${id}">
              <img class="gallery-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
              <div class="info">
                <p class="info-item"><b>Likes </b>${likes}</p>
                <p class="info-item"><b>Views </b>${views}</p>
                <p class="info-item"><b>Comments </b>${comments}</p>
                <p class="info-item"><b>Downloads </b>${downloads}</p>
              </div>
            </div>
          </a>
        `;
    })
    .join('');

  galleryEl.insertAdjacentHTML('beforeend', markup);
}
formEl.addEventListener('submit', onForm);
loadMoreBtn.addEventListener('click', onLoadMoreBtn);
