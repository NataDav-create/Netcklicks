'use strict';

const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const 'API_KEY' = '12d100d2932c7fc9168f633d0d29da9d';

const leftMenu = document.querySelector('.left-menu'),
  hamburger = document.querySelector('.hamburger'),
  tvShowsList = document.querySelector('.tv-shows__list'),
  modal = document.querySelector('.modal');

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

tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage)

tvShowsList.addEventListener('click', e => {
  e.preventDefault();
  const target = e.target;
  const card = target.closest('.tv-card');
  if (card) {
    document.body.style.overflow = 'hidden';
    modal.classList.remove('hide');
  }
});

modal.addEventListener('click', e => {
  if (e.target.closest('.cross') || e.target.classList.contains('modal')) {
    modal.classList.add('hide');
    document.body.style.overflow = '';
  }
});

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
}
const renderCard = response => {
  console.log(response);
  tvShowsList.textContent = '';
  response.results.forEach(item => {
    const {
      backdrop_path: backdrop,
      name: title,
      poster_path: poster,
      vote_average: vote
    } = item;

    const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
    const backdropIMG = backdrop ? IMG_URL + backdrop : 'img/no-poster.jpg';


    console.log(item);
    const card = document.createElement('li');
    card.classList.add('tv-shows__item');
    card.innerHTML = `
              <a href="#" class="tv-card">
                ${vote ? `<span class="tv-card__vote">${vote}</span>` : ''}
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
    tvShowsList.append(card);
  })
}
new DBService().getTestData().then(renderCard);