import axios from 'axios';
import Notiflix from 'notiflix';

const BASE_URL = 'https://pixabay.com/api/';
export const per_page = 40;
let page = 1;
export let totalHits;

export async function searchImages(query) {
  const PARAMS = new URLSearchParams({
    key: '39012362-7b13feeec5008368b0a5b12ec',
    per_page,
    page,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  });

  const url = `${BASE_URL}?${PARAMS}`;
  const response = await axios.get(url);
  totalHits = response.data.totalHits;

  const resp = response.data.hits;
  if (page === 1)
    Notiflix.Notify.info(`Hooray! We found ${response.data.totalHits} images.`);
  page += 1;
  return resp;
}
