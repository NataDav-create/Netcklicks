'use strict';

const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const API_KEY = '12d100d2932c7fc9168f633d0d29da9d';
const SERVER = 'https://api.themoviedb.org/3';

const leftMenu = document.querySelector('.left-menu'),
  hamburger = document.querySelector('.hamburger'),
  tvShowsList = document.querySelector('.tv-shows__list'),
  modal = document.querySelector('.modal'),
  tvShows = document.querySelector('.tv-shows'),
  tvCardImg = document.querySelector('.tv-card__img'),
  modalTitle = document.querySelector('.modal__title'),
  genresList = document.querySelector('.genres-list'),
  rating = document.querySelector('.rating'),
  description = document.querySelector('.description'),
  modalLink = document.querySelector('.modal__link'),
  searchForm = document.querySelector('.search__form'),
  searchFormInput = document.querySelector('.search__form-input'),
  preloader = document.querySelector('.preloader');

const loading = document.createElement('div');
loading.className = 'loading';

hamburger.addEventListener('click', () => {
  leftMenu.classList.toggle('openMenu');
  hamburger.classList.toggle('open');
});

document.body.addEventListener('click', (e) => {
  if (!e.target.closest('.left-menu')) {
    leftMenu.classList.remove('openMenu');
    hamburger.classList.remove('open');
  }
});

leftMenu.addEventListener('click', e => {
  e.preventDefault();
  const target = e.target;
  const dropdown = target.closest('.dropdown');
  if (dropdown) {
    dropdown.classList.toggle('active');
    leftMenu.classList.add('openMenu');
    hamburger.classList.add('open');
  }
});

const changeImage = e => {
  const card = e.target.closest('.tv-shows__item');
  if (card) {
    const img = card.querySelector('.tv-card__img');
    let changeImg = img.dataset.backdrop;
    if (changeImage) {
      img.dataset.backdrop = img.src;
      img.src = changeImg;
    }
  }
}

const DBService = class {
  getData = async (url) => {
    const res = await fetch(url);
    if (res.ok) {
      return res.json();
    } else {
      throw new Error(`Not possible to get data by url ${url}`)
    }
  }
  getTestData = async () => {
    return await this.getData('test.json')
  }
  getTestCard = async () => {
    return await this.getData('card.json')
  }
  getSearchResult = query => {
    return this.getData(`${SERVER}/search/tv?api_key=${API_KEY}&query=${query}&language=ru-RU`)
  }
  getTvShow = id => {
    return this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-RU`);
  }
}
console.log(new DBService().getSearchResult('Няня'));

const renderCard = response => {

  tvShowsList.textContent = '';
  response.results.forEach(item => {
    const {
      backdrop_path: backdrop,
      name: title,
      poster_path: poster,
      id,
      vote_average: vote
    } = item;

    const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
    const backdropIMG = backdrop ? IMG_URL + backdrop : 'img/no-poster.jpg';
    const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

    const card = document.createElement('li');
    card.classList.add('tv-shows__item');
    card.innerHTML = `
              <a href="#" id=${id} class="tv-card">
                ${voteElem}
                <img
                  class="tv-card__img"
                  src="${posterIMG}"
                  data-backdrop="${backdropIMG}"
                  alt="${title}"
                />
                <h4 class="tv-card__head">
                  ${title}
                </h4>
              </a>
    `;
    loading.remove();
    tvShowsList.append(card);
  })
};

searchForm.addEventListener('submit', e => {
  e.preventDefault();
  const value = searchFormInput.value.trim();
  console.log(value)
  if (value) {
    tvShows.append(loading);
    new DBService().getSearchResult(value).then(res => {
      let resOfSearch = res.total_results;
      if (resOfSearch == 0) {
        tvShowsList.textContent = '';
        console.log('not found');
        loading.remove();
      } else {
        new DBService().getSearchResult(value).then(renderCard);
      }
    });
    // new DBService().getSearchResult(value).then(renderCard);
  }
  searchFormInput.value = '';
});



tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage)

tvShowsList.addEventListener('click', e => {
  preloader.style.display = 'block';
  e.preventDefault();
  const target = e.target;
  const card = target.closest('.tv-card');
  if (card) {
    new DBService().getTvShow(card.id)
      .then(data => {
        tvCardImg.src = IMG_URL + data.poster_path;
        modalTitle.textContent = data.name;
        if (!data.poster_path) {
          tvCardImg.closest('.image__content').style.display = 'none';
        }
        // genresList.innerHTML = data.genres.reduce((acc, item) => {
        //   return `${acc} <li>${item.name}</li>`
        // }, '');
        genresList.textContent = '';
        for (const item of data.genres) {
          genresList.innerHTML += `<li>${item.name}</li>`;
        };
        rating.textContent = data.vote_average;
        description.textContent = data.overview;
        modalLink.href = data.homepage;
      })
      .then(() => {
        preloader.style.display = 'none';
        document.body.style.overflow = 'hidden';
        modal.classList.remove('hide');
      })
  }
});

modal.addEventListener('click', e => {
  if (e.target.closest('.cross') || e.target.classList.contains('modal')) {
    modal.classList.add('hide');
    document.body.style.overflow = '';
  }
});