import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const per_page = 40;
let page = 1;

export function searchImages(query) {
  const PARAMS = new URLSearchParams({
    key: '39012362-7b13feeec5008368b0a5b12ec',
    per_page,
    page,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  });
  const url = `${BASE_URL}?q=${query}&${PARAMS}`;
  // console.log(`Axios - ${axios.get(url).then(response => response)}`);

  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      page += 1;

      return response.json();
    })
    .catch(err => console.log(err));

  // return axios.get(url).then(resp => console.log(resp.data));
}
