const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const changeMode = document.querySelector('#change-mode')
const pagination = document.querySelector('#paginator')

const MOVIES_PER_PAGE = 12
const movies = []
let filteredMovies = []
let page = 1

function renderMovieList(data) {
  if (dataPanel.dataset.mode === 'grid') {
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
              <button class="btn btn-info btn-add-favorite" data-id=${
                item.id
              }>+</button>
            </div>
          </div>
        </div>
      </div>
    `
    })
    dataPanel.innerHTML = rawHTML
  } else if (dataPanel.dataset.mode === 'list') {
    let rawHTML = `<ul class="list-group">`

    data.forEach((item) => {
      rawHTML += `
     <li class="list-group-item d-flex justify-content-between">
        <h5 class="card-title">${item.title}</h5>
        <div>
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal"
            data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </li>
    `
    })
    rawHTML += `</ul>`
    dataPanel.innerHTML = rawHTML
  }
}

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

function addtoFavorite(id) {
  //抓取單一部電影資料: find() 篩選結果為true 回傳第一個符合的item
  const movie = movies.find((movie) => movie.id === id)
  console.log(movie)

  // 邏輯運算式 let x = a || b || c ....
  const list = JSON.parse(localStorage.getItem('favorite')) || []
  console.log(list)

  // 檢查list有無重複的電影
  if (list.some((movie) => movie.id === id)) {
    return alert('已在收藏清單')
  }
  list.push(movie)
  // console.log(list)
  // list 轉換成JSON 寫入localStorage
  localStorage.setItem('favorite', JSON.stringify(list))
}

function searchMovie(event) {
  // 預設submit會提交資料 並重新整理
  event.preventDefault()
  // 抓取input value
  const searchInput = document.querySelector('#search-input')
  const keyword = searchInput.value.trim().toLowerCase()

  // 比對keyword 與movie title
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  // console.log(filteredMovies)

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  {
    renderPagination(filteredMovies.length)
    renderMovieList(getMovieByPage(1))
  }
}

function getMovieByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  // page1: 0 - 12, page2: 12 - 24
  // startIndex = page -1 * MOVIES_PER_PAGE
  // EndIndex = startIndex + MOVIES_PER_PAGE
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  // slice()
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPagination(amount) {
  // total movies / MOVIES_PER_PAGE
  // 80 / 12 = 7 ... 8 ,以Math.ceil()
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE)

  let rawHTML = ''
  for (let i = 1; i <= numberOfPage; i++) {
    rawHTML += `
 <li class="page-item"><a class="page-link" data-page="${i}" href="#">${i}</a></li>
`
  }
  pagination.innerHTML = rawHTML
}

function onPaginationClicked(event) {
  if (event.target.tagName !== 'A') return
  page = Number(event.target.dataset.page)
  renderMovieList(getMovieByPage(page))
}

function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // 印出dataset: dataset的值都是字串
    // 取得target id，轉換為number
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addtoFavorite(Number(event.target.dataset.id))
  }
}

function changeModeClicked(event) {
  const mode = event.target.id
  if (dataPanel.dataset.mode === mode) return
  dataPanel.dataset.mode = mode
  renderMovieList(getMovieByPage(page))
}

function initial() {
  axios
    .get(INDEX_URL)
    .then((response) => {
      // 解法1:for of
      // for(const movie of response.data.results){
      //   movies.push(movie)
      // }

      // 解法2: 展開運算式spread operator
      movies.push(...response.data.results)
      // console.log(movies)
      renderPagination(movies.length)
      renderMovieList(getMovieByPage(page))
      // renderMovieList(movies)
    })
    .catch(function (error) {
      console.log(error)
    })
}

initial()

// EventListener
dataPanel.addEventListener('click', onPanelClicked)

searchForm.addEventListener('submit', searchMovie)

changeMode.addEventListener('click', changeModeClicked)

pagination.addEventListener('click', onPaginationClicked)
