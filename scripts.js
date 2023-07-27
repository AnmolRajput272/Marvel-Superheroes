const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

const publicKey = 'cd9cc62c6cc087a9750299bf0cf3cd9e';
const privateKey = '39719e865406bdf7fbddc40fde66eaf49220c80f';
const ts = '1';
const hash = 'b4fd5d3f1d3873b2050d49d308770dee';
const apiUrl = `https://gateway.marvel.com:443/v1/public/characters?ts=${ts}&apikey=${publicKey}&hash=${hash}`;
const ITEMS_PER_PAGE = 35; // Number of superheroes per page
let currentPage = 1;
let prevPage = null;

function fetchSuperheroes(query) {
  const urlParams = new URLSearchParams(window.location.search);
  currentPage = Number(urlParams.get('page')) || 1;

  fetch(`${apiUrl}&limit=${ITEMS_PER_PAGE}&offset=${ITEMS_PER_PAGE*(currentPage-1)}${query!='' ? '&nameStartsWith='+query : ''}`)
    .then(response => response.json())
    .then(data => {
      const superheroesList = document.getElementById('superheroesList');
      superheroesList.innerHTML = '';
      console.log(data);
      data.data.results.forEach(superhero => {
        const card = createSuperheroCard(superhero);
        superheroesList.appendChild(card);
      });

      addPaginationControls(data.data.total,currentPage,query);
    });
}

function createSuperheroCard(superhero) {
  const card = document.createElement('div');
  card.classList.add('card');

  const name = document.createElement('h2');
  name.textContent = superhero.name;
  card.appendChild(name);

  const thumbnail = document.createElement('img');
  thumbnail.src = `${superhero.thumbnail.path}/portrait_fantastic.${superhero.thumbnail.extension}`;
  card.appendChild(thumbnail);
  
  const like_bio = document.createElement('div');
  like_bio.classList.add('like_bio');
  const favoriteBtn = document.createElement('span');
  favoriteBtn.classList.add('favorite-btn');
  favoriteBtn.textContent = '❤️';
  favoriteBtn.addEventListener('click', () => addToFavorites(superhero));
  like_bio.appendChild(favoriteBtn);

  // Add anchor tag to the superhero page
  const learnMoreBtn = document.createElement('button');
  learnMoreBtn.textContent = 'Show Bio';
  learnMoreBtn.classList.add('learn-more-btn');
  learnMoreBtn.addEventListener('click', () => {
    window.location.href = `superhero.html?id=${superhero.id}`;
  });
  like_bio.appendChild(learnMoreBtn);

  card.append(like_bio);

  return card;
}


function addToFavorites(superhero) {
  const favorites = getFavoritesFromLocalStorage();
  favorites.push(superhero);
  saveFavoritesToLocalStorage(favorites);
  alert(`${superhero.name} added to favorites!`);
}

// Function to remove a superhero from favorites
function removeFromFavorites(superheroId) {
  let favorites = getFavoritesFromLocalStorage();
  favorites = favorites.filter(superhero => superhero.id !== superheroId);
  saveFavoritesToLocalStorage(favorites);
}

// Function to get favorite superheroes from local storage
function getFavoritesFromLocalStorage() {
  const favoritesJSON = localStorage.getItem('favorites');
  return favoritesJSON ? JSON.parse(favoritesJSON) : [];
}

// Function to save favorite superheroes to local storage
function saveFavoritesToLocalStorage(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function displayFavoriteSuperheroes() {
  const favorites = getFavoritesFromLocalStorage();
  const favoriteSuperheroesList = document.getElementById('favoriteSuperheroes');
  favoriteSuperheroesList.innerHTML = '';

  favorites.forEach(superhero => {
    const card = createFavoriteSuperheroCard(superhero);
    favoriteSuperheroesList.appendChild(card);
  });
}

function createFavoriteSuperheroCard(superhero) {
  const card = document.createElement('div');
  card.classList.add('card');

  const name = document.createElement('h2');
  name.textContent = superhero.name;
  card.appendChild(name);

  const thumbnail = document.createElement('img');
  thumbnail.src = `${superhero.thumbnail.path}/portrait_fantastic.${superhero.thumbnail.extension}`;
  card.appendChild(thumbnail);
  
  const dislike_bio = document.createElement('div');
  dislike_bio.classList.add('like_bio');
  const removeFromFavoritesBtn = document.createElement('span');
  removeFromFavoritesBtn.classList.add('favorite-btn');
  removeFromFavoritesBtn.textContent = '❌';
  removeFromFavoritesBtn.addEventListener('click', () => {
		  removeFromFavorites(superhero.id);
		  // Re-render the favorite superheroes list
		  displayFavoriteSuperheroes();
	  }
  );
  dislike_bio.appendChild(removeFromFavoritesBtn);

  const learnMoreBtn = document.createElement('button');
  learnMoreBtn.textContent = 'Show Bio';
  learnMoreBtn.classList.add('learn-more-btn');
  learnMoreBtn.addEventListener('click', () => {
    window.location.href = `superhero.html?id=${superhero.id}`;
  });
  dislike_bio.appendChild(learnMoreBtn);
  card.append(dislike_bio);
  
  return card;
}

function getAndDisplaySuperheroDetails(){
  const urlParams = new URLSearchParams(window.location.search);
  const superheroId = urlParams.get("id");
  const apiUrl_ = `https://gateway.marvel.com:443/v1/public/characters/${superheroId}?ts=${ts}&apikey=${publicKey}&hash=${hash}`;
  fetch(apiUrl_)
  .then(response => response.json())
  .then(data => {
    const superhero = data.data.results[0];
    displaySuperheroDetails(superhero);
  })
  .catch(error => console.error("Error fetching superhero details:", error));
}

function displaySuperheroDetails(superhero) {
  const superheroDetails = document.getElementById("superheroDetails");
  superheroDetails.innerHTML = `
    <div class="superhero-card">
      <h2>${superhero.name}</h2>
      <img src="${superhero.thumbnail.path}/portrait_uncanny.${superhero.thumbnail.extension}" alt="${superhero.name}">
      <p>${superhero.description || "No description available."}</p>
      <h3>Comics:</h3>
      <ul>
        ${superhero.comics.items.map(comic => `<li>${comic.name}</li>`).join("")}
      </ul>
      <h3>Events:</h3>
      <ul>
        ${superhero.events.items.map(event => `<li>${event.name}</li>`).join("")}
      </ul>
      <h3>Series:</h3>
      <ul>
        ${superhero.series.items.map(series => `<li>${series.name}</li>`).join("")}
      </ul>
      <h3>Stories:</h3>
      <ul>
        ${superhero.stories.items.map(story => `<li>${story.name}</li>`).join("")}
      </ul>
    </div>
    `;
}


function addPaginationControls(totalSuperheroes,currentPage,query) {
  const paginationContainer = document.getElementById('pagination');
  const totalPages = Math.ceil(totalSuperheroes / ITEMS_PER_PAGE);
  // const urlParams = new URLSearchParams(window.location.search);
  // const query = urlParams.get('query') || ''; // Get the query parameter from the URL

  let paginationHTML = '';

  const nextPage = currentPage + 1;
  const prevPage = currentPage - 1;

  if (prevPage > 0) {
    const prevUrl = `index.html?query=${encodeURIComponent(query)}&page=${prevPage}`;
    paginationHTML += `<a href="${prevUrl}" class="prev-link">Previous</a>`;
  }

  if (nextPage <= totalPages) {
    const nextUrl = `index.html?query=${encodeURIComponent(query)}&page=${nextPage}`;
    console.log(nextUrl);
    paginationHTML += `<a href="${nextUrl}" class="next-link">Next</a>`;
  }

  paginationContainer.innerHTML = paginationHTML;
}

function performSearch() {
  const query = searchInput.value.trim();
  const superheroesList = document.getElementById('superheroesList');
  superheroesList.innerHTML = '<img src="assets/loading.gif" height="300px" width="300px" />';
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  const url = new URL(window.location.href);
  url.searchParams.set('query', query);
  url.searchParams.set('page', '1');
  history.pushState({ path: url.href }, '', url.href);

  // Call the function to fetch superheroes with the updated query
  fetchSuperheroes(query);
}

function displayAllSuperheroes(){
	const urlParams = new URLSearchParams(window.location.search);
  let query = urlParams.get('query') || '';
  query = query.trim();
  document.getElementById('searchInput').value = query;
  fetchSuperheroes(query);
}

searchInput.addEventListener('keyup', event => {
  if (event.key === 'Enter') {
    performSearch();
  }
});

searchButton.addEventListener('click', () => {
  performSearch();
});

