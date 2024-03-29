import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { searchImages } from './queries.js';
import Notiflix from 'notiflix';
import { per_page } from './queries.js';
import { totalHits } from './queries.js';

/*
│ =========================
│           Refs
│ =========================
*/

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  observerTarget: document.querySelector('.js-observer'),
};
const { form, gallery, observerTarget } = refs;
let maxPage = 1;
export let query = '';
let currentPage = 1;
let page = 1;

const lightbox = new SimpleLightbox('.gallery a');

/*
│ =========================
│           Event
│ =========================
*/

form.addEventListener('submit', onFormSubmit);

async function onFormSubmit(event) {
  event.preventDefault();
  page = 1;
  currentPage = 1;
  gallery.innerHTML = '';
  // page = 1;
  query = form.elements.searchQuery.value.trim();
  if (!query) {
    Notiflix.Notify.failure('Please, enter keywords!');
    return;
  }
  try {
    const data = await searchImages(query, page);
    maxPage = Math.ceil(totalHits / per_page);

    if (!data.length) {
      form.reset();
      throw new Error(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    createCardsMarkup(data);
    // currentPage += 1;
    // page += 1;
    form.reset();
  } catch (err) {
    Notiflix.Notify.failure(`${err.message}`);
  }
}

/*
│ =========================
│        observer
│ =========================
*/
function callback(entries, observer) {
  entries.forEach(async entry => {
    if (entry.isIntersecting && gallery.innerHTML !== '') {
      if (currentPage === maxPage) {
        observer.unobserve(observerTarget);
        Notiflix.Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
        return;
      }
      page = currentPage + 1;
      try {
        const data = await searchImages(query, page);
        if (!data.length) {
          throw new Error(
            'Sorry, there are no images matching your search query. Please try again.'
          );
        }

        createCardsMarkup(data);

        const { height: cardHeight } = document
          .querySelector('.gallery')
          .firstElementChild.getBoundingClientRect();

        window.scrollBy({
          top: cardHeight * 2,
          behavior: 'smooth',
        });
        currentPage += 1;
        // }
      } catch (error) {
        Notiflix.Notify.failure(
          `Sorry, there are no images matching your search query. Please try again.`
        );
      }
    }
  });
}
const observer = new IntersectionObserver(callback);
observer.observe(observerTarget);

/*
│ =========================
│       Cards markup
│ =========================
*/
function createCardsMarkup(arr) {
  const galleryImages = arr
    .map(
      ({
        likes,
        views,
        comments,
        downloads,
        webformatURL,
        largeImageURL,
        tags,
      }) => {
        return `
      <div class="photo-card">
        <a class="gallery__link" href="${largeImageURL}" width=300 height=200
        style="background-image: url('${webformatURL}')">
        </a>
        <div class="info">
          <p class="info-item">
            <b>Likes</b>
            <span class="quant">${likes}</span>
          </p>
          <p class="info-item">
            <b>Views</b>
            <span class="quant">${views}</span>
          </p>
          <p class="info-item">
            <b>Comments</b>
            <span class="quant">${comments}</span>
          </p>
          <p class="info-item">
            <b>Downloads</b>
            <span class="quant">${downloads}</span>
          </p>
        </div>
      </div>
    `;
      }
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', galleryImages);

  lightbox.refresh();
}
