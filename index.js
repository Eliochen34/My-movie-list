// 變數宣告

const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POST_URL = BASE_URL + "/posters/";
let movies = [];
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const MOVIES_PER_PAGE = 12;
const paginator = document.querySelector("#paginator");
let filteredMovies = [];

let currentPage = 1;
const modeChange = document.querySelector("#change-mode");

// functions
// 顯示電影清單，內容修改為先做條件判斷，如果是card mode則顯示卡片內容，如果是list mode則顯示清單內容
function renderMovieCard(data) {
  if (dataPanel.dataset.mode === "card-mode") {
    let htmlContent = "";
    data.forEach((item) => {
      htmlContent += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POST_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id
        }">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id
        }">+</button>
            </div>
          </div>
        </div>
      </div>
    `;
    });
    dataPanel.innerHTML = htmlContent;
  } else if (dataPanel.dataset.mode === "list-mode") {
    let htmlContent = `<ul class="list-group list-group-flush col-sm-12 mb-2">`;
    data.forEach((item) => {
      htmlContent += `
        <li class="list-group-item d-flex justify-content-between">
          <h5 class="card-title">${item.title}</h5>
          <div>
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </li>
      `;
    });
    htmlContent += `</ul>`;
    dataPanel.innerHTML = htmlContent;
  }
}

// 顯示電影詳細資料內容
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");
  // 顯示modal內容之前將錢一個modal內容清空
  modalTitle.textContent = "";
  modalImage.textContent = "";
  modalDate.innerText = "";
  modalDescription.innerText = "";
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${POST_URL + data.image
      }" alt="movie-poster" class="img-fluid">`;
  });
}

// 將電影新增到我的最愛清單，利用localStorage把電影存入
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }
  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

// 顯示分頁器
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let htmlContent = "";
  for (let page = 1; page <= numberOfPages; page++) {
    htmlContent += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `;
  }
  paginator.innerHTML = htmlContent;
}

// 取得指定頁數的電影資料，輸入的參數是頁次
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  console.log(filteredMovies.length);
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

// 切換電影顯示mode的函示
function changeMode(displayMode) {
  if (dataPanel.dataset.mode === displayMode) return;
  dataPanel.dataset.mode = displayMode;
}

// -------------------------------------------------------------------------
// 監聽器

// 監聽搜索表單內容，輸入搜索內容後，submit之後要做的事
searchForm.addEventListener("submit", function onSearchFormSumitted(event) {
  event.preventDefault();
  console.log("clcik");
  const keyword = searchInput.value.trim().toLowerCase();
  // if(!keyword.length){
  //   alert('請輸入有效字串！')
  // }
  // 寫法1：for of寫法

  // for (const movie of movies){
  //   if(movie.title.trim().toLowerCase().includes(keyword)){
  //     filteredMovies.push(movie)
  //   }
  // }

  // 寫法2：filter寫法
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  if (filteredMovies.length === 0) {
    return alert(`您輸入的內容：${keyword}，查無資料，請重新搜索`);
  }
  renderPaginator(filteredMovies.length);
  renderMovieCard(getMoviesByPage(currentPage));
});

// 監聽父元素dataPanel，點擊More按鈕要呼叫showMovieModal函式，點擊"+"按鈕要呼叫addToFavorite函式
dataPanel.addEventListener("click", function onPanelClick(event) {
  const target = event.target;
  if (target.matches(".btn-show-movie")) {
    showMovieModal(Number(target.dataset.id));
  } else if (".btn-add-favorite") {
    addToFavorite(Number(target.dataset.id));
  }
});

// 監聽分頁器，點擊頁次後顯示對應的畫面
paginator.addEventListener("click", function onPaginatorClicked(event) {
  const target = event.target;
  if (target.tagName !== "A") return;
  currentPage = Number(target.dataset.page);
  console.log(currentPage);
  renderMovieCard(getMoviesByPage(currentPage));
});

// 監聽mode切換區域的父元素，點擊card mode和list mode都會呼叫renderMovieCard這個函式，而呼叫changeMode這個函式時，帶入的參數不相同
modeChange.addEventListener("click", function onCardModeButtonClicked(event) {
  const target = event.target;
  if (target.matches("#card-mode-button")) {
    changeMode("card-mode");
    renderMovieCard(getMoviesByPage(currentPage));
    // renderPaginator(movies.length);
  } else if (target.matches("#list-mode-button")) {
    changeMode("list-mode");
    renderMovieCard(getMoviesByPage(currentPage));
    // renderPaginator(movies.length);
  }
});

// 發送請求至指定的API，針對回傳的資料做處理
axios
  .get(INDEX_URL)
  .then((response) => {
    console.log(response.data.results);
    movies.push(...response.data.results);
    console.log(movies.length);
    renderMovieCard(getMoviesByPage(currentPage));
    renderPaginator(movies.length);
  })
  .catch((err) => console.log(err));
