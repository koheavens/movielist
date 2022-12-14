const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = JSON.parse(localStorage.getItem('favorite')) || []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')

// render
function renderMovieList(data) {
  let rawHTML = ''

  data.forEach((item) => {
    rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id=${item.id}>More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id=${
                item.id
              }>X</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

// 顯示單一部電影資料
function showMovieModal(id) {
  //title,description,release_date,image
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  // 抓單一部影片資料
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    // console.log(data)
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date :' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `
    <img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">
    `
  })
}

function removeFavorite(id) {
  if (!movies || !movies.length) return

  //抓取單一部電影資料index: findIndex() 回傳符合的item的index
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  if (movieIndex === -1) return
  // console.log(movieIndex)

  movies.splice(movieIndex, 1)

  // 寫入localStorage
  localStorage.setItem('favorite', JSON.stringify(movies))
  renderMovieList(movies)
}

// 監聽 dataPanel click事件
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // 印出dataset: dataset的值都是字串
    // console.log(event.target.dataset)
    // 取得target id，轉換為number
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)
