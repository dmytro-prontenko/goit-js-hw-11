import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { searchImages } from './queries.js';
import Notiflix from 'notiflix';

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
let query = '';
let currentPage = 1;
const perPage = 40;

/*
│ =========================
│           Event
│ =========================
*/

form.addEventListener('submit', onFormSubmit);

function onFormSubmit(event) {
  event.preventDefault();
  currentPage = 1;
  gallery.innerHTML = '';
  query = form.elements.searchQuery.value;
  searchImages(query)
    .then(data => {
      console.log(data);
      maxPage = Math.ceil(data.totalHits / perPage);
      // console.log(`MaxPAge - ${maxPage}`);
      if (!data.hits.length) {
        throw new Error(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }

      createCardsMarkup(data.hits);
      // currentPage += 1;
      form.reset();
    })
    .catch(err => {
      Notiflix.Notify.failure(`${err.message}`);
    });
}

/*
│ =========================
│        observer
│ =========================
*/
function callback(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting && gallery.innerHTML !== '') {
      if (currentPage === maxPage) {
        Notiflix.Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
        return;
      }
      searchImages(query)
        .then(data => {
          // console.log(data);
          if (!data.hits) {
            throw new Error(
              'Sorry, there are no images matching your search query. Please try again.'
            );
          }

          createCardsMarkup(data.hits);
          currentPage += 1;
          // console.log(`${currentPage} of ${maxPage}`);
        })
        .catch(err => {
          Notiflix.Notify.failure(
            `Sorry, there are no images matching your search query. Please try again.`
          );
        });
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
  // console.log(arr);
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

  const lightbox = new SimpleLightbox('.gallery a');
}
