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
  preloader = document.querySelector('.preloader'),
  dropdown = document.querySelectorAll('.dropdown'),
  tvShowsHead = document.querySelector('.tv-shows__head'),
  modalContent = document.querySelector('.modal__content'),
  pagination = document.querySelector('.pagination');

const loading = document.createElement('div');
loading.className = 'loading';

const closeDropdown = () => {
  dropdown.forEach(item => {
    item.classList.remove('active');
  })
}

hamburger.addEventListener('click', () => {
  leftMenu.classList.toggle('openMenu');
  hamburger.classList.toggle('open');
  closeDropdown();
});

document.body.addEventListener('click', (e) => {
  if (!e.target.closest('.left-menu')) {
    leftMenu.classList.remove('openMenu');
    hamburger.classList.remove('open');
    closeDropdown();
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
    this.temp = `${SERVER}/search/tv?api_key=${API_KEY}&query=${query}&language=ru-RU`;
    return this.getData(this.temp)
  }

  getNextPage = page => {
    return this.getData(this.temp + '&page=' + page);
  }

  getTvShow = id => {
    return this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-RU`);
  }
  getTopRated = () => this.getData(`${SERVER}/tv/top_rated?api_key=${API_KEY}&language=ru-RU`)
  getPopular = () => this.getData(`${SERVER}/tv/popular?api_key=${API_KEY}&language=ru-RU`)
  getToday = () => this.getData(`${SERVER}/tv/airing_today?api_key=${API_KEY}&language=ru-RU`)
  getWeek = () => this.getData(`${SERVER}/tv/on_the_air?api_key=${API_KEY}&language=ru-RU`)
}
const dbService = new DBService();

const renderCard = (response, target) => {

  tvShowsList.textContent = '';
  if (!response.total_results) {
    loading.remove();
    tvShowsHead.textContent = 'Unfortunately nothing is found by your request...';
    tvShowsHead.style.cssText = 'color: red';
    return;
  }
  tvShowsHead.textContent = target ? target.textContent : `Result of search:`;

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
  });

  pagination.innerHTML = '';
  if (!target && response.total_pages > 1) {
    for (let i = 1; i <= response.total_pages; i++) {
      pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`
    }
  }
};

searchForm.addEventListener('submit', e => {
  e.preventDefault();
  const value = searchFormInput.value.trim();
  if (value) {
    tvShows.append(loading);
    dbService.getSearchResult(value).then(renderCard);
  }
  searchFormInput.value = '';
});



tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage)

tvShowsList.addEventListener('click', e => {
  e.preventDefault();
  const target = e.target;
  const card = target.closest('.tv-card');
  if (card) {
    preloader.style.display = 'block';
    dbService.getTvShow(card.id)
      .then(data => {
        if (!data.poster_path) {
          tvCardImg.closest('.image__content').style.display = 'none';
          modalContent.style.paddingLeft = '25px';
        } else {
          tvCardImg.src = IMG_URL + data.poster_path;
          tvCardImg.alt = data.name;
          tvCardImg.closest('.image__content').style.display = '';
          modalContent.style.paddingLeft = '';
        }
        // genresList.innerHTML = data.genres.reduce((acc, item) => {
        //   return `${acc} <li>${item.name}</li>`
        // }, '');
        modalTitle.textContent = data.name;
        genresList.textContent = '';
        for (const item of data.genres) {
          genresList.innerHTML += `<li>${item.name}</li>`;
        };
        rating.textContent = data.vote_average;
        description.textContent = data.overview;
        modalLink.href = data.homepage;
      })
      .then(() => {
        document.body.style.overflow = 'hidden';
        modal.classList.remove('hide');
      })
      .then(() => {
        preloader.style.display = 'none';
      })
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
  if (target.closest('#top-rated')) {
    tvShows.append(loading);
    dbService.getTopRated().then((response) => renderCard(response, target));
  }
  if (target.closest('#popular')) {
    tvShows.append(loading);
    dbService.getPopular().then((response) => renderCard(response, target));
  }
  if (target.closest('#week')) {
    tvShows.append(loading);
    dbService.getWeek().then((response) => renderCard(response, target));
  }
  if (target.closest('#today')) {
    tvShows.append(loading);
    dbService.getToday().then((response) => renderCard(response, target));
  }
  if (target.closest('#search')) {
    tvShowsList.textContent = '';
    tvShowsHead.textContent = '';
  }
});

modal.addEventListener('click', e => {
  if (e.target.closest('.cross') || e.target.classList.contains('modal')) {
    modal.classList.add('hide');
    document.body.style.overflow = '';
  }
});

pagination.addEventListener('click', (e) => {
  e.preventDefault();
  const target = e.target;
  if (target.classList.contains('pages')) {
    tvShows.append(loading);
    dbService.getNextPage(target.textContent).then(renderCard);
  }
});