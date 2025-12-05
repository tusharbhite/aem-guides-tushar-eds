import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const url = block.querySelector('a[href$=".json"]');
  const mlcontainer = document.querySelector('[data-block-name="movie-list"]');


  mlcontainer.insertAdjacentHTML('beforeend', `
  <div class="container">
        
        <!-- Hero Search Component -->
        <div class="hero-search">
            <div class="search-container">
                <input type="text" id="search-input" class="search-input" placeholder="Search for movies by title or overview...">
                <button id="clear-search-btn" class="clear-search-btn" title="Clear Search">
                    &times;
                </button>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="main-grid">
            
            <!-- Left Sidebar for Filters/Sort -->
            <div class="sidebar">
                
                <div class="filter-group">
                    <div class="filter-title">Sort By</div>
                    <select id="sort-select" class="sort-select">
                        <option value="default">Default </option>
                        <option value="title_asc">Title (A-Z)</option>
                        <option value="title_desc">Title (Z-A)</option>
                        <option value="date_desc">Release Date (Newest)</option>
                        <option value="date_asc">Release Date (Oldest)</option>
                    </select>
                </div>

                <div class="filter-group">
                    <div class="filter-title">Genre Filters</div>
                    <div id="genre-filters" class="checkbox-list">
                        <!-- Genre checkboxes will be dynamically inserted here -->
                    </div>
                </div>

                <div class="filter-group">
                    <div class="filter-title">Language Filters</div>
                    <div id="language-filters" class="checkbox-list">
                        <!-- Language checkboxes will be dynamically inserted here -->
                    </div>
                </div>
            </div>

            <!-- Main Movie List Area -->
            <div class="content-area">
                <div id="movie-list">
                    <!-- Movie cards or status messages will be inserted here -->
                    <div class="status-message">Loading movie data...</div>
                </div>

                <!-- Pagination Controls -->
                <div id="pagination-container" class="pagination-controls" style="display: none;">
                    <button id="prev-btn" class="page-button" disabled>Previous</button>
                    <span id="page-info" class="page-info">Page 1 of 1</span>
                    <button id="next-btn" class="page-button" disabled>Next</button>
                </div>
            </div>
        </div>
    </div>

`);
  
//   alert(movies);
//   const queryString = window.location.search;
  // Parse it using URLSearchParams
//   const urlParams = new URLSearchParams(queryString);
  // Get the value of a particular parameter
//   const movieID = urlParams.get('id');  
  // alert(movieID);

  getMatchingMovieData(url,block);

  



}

async function getMatchingMovieData(url,block){
  
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json(); // Convert response to JSON object
    })
    .then(json => {
      console.log(json);
      const movies = json.data;
      processJSON(movies);
      
    })
    .catch(error => {
      console.error("Error fetching JSON:", error);
    });

}

function processJSON(movies){
    // alert("Processing");
    const ALL_MOVIES = movies;
        const TOTAL_RECORDS = 2000;
        const PAGE_SIZE = 12;

        const mockGenres = ["Action", "Adventure", "Sci-Fi", "Drama", "Comedy", "Thriller", "Romance", "Horror", "Fantasy"];
        const mockLanguages = ["en", "es", "fr", "ja", "ko", "de"];

        /** Generates a large set of mock movie data. */
        function generateMockMovies(count) {
            const movies = [];
            for (let i = 1; i <= count; i++) {
                const year = 2000 + Math.floor(Math.random() * 24); // 2000 to 2023
                const month = Math.floor(Math.random() * 12) + 1;
                const day = Math.floor(Math.random() * 28) + 1;
                const releaseDate = new Date(year, month, day).getTime();

                const numGenres = Math.floor(Math.random() * 3) + 1;
                const selectedGenres = [...mockGenres].sort(() => 0.5 - Math.random()).slice(0, numGenres);
                const selectedLang = mockLanguages[Math.floor(Math.random() * mockLanguages.length)];

                movies.push({
                    id: i.toString(),
                    title: `Movie Title ${i}: ${selectedGenres[0]} Story`,
                    year: year.toString(),
                    release_date: releaseDate,
                    original_language: selectedLang,
                    genres: selectedGenres.join(', '),
                    overview: `This is the exciting overview for Movie ${i}. It is a film about ${selectedGenres.join(' and ')} set in the year ${year}.`,
                    // Using a placeholder image that changes slightly based on ID for visual variety
                    poster_path: `https://placehold.co/300x450/1e293b/f8fafc?text=Movie+${i}&font=roboto`
                });
            }
            return movies;
        }

        // Initialize the mock dataset
        // ALL_MOVIES.push(...generateMockMovies(TOTAL_RECORDS));
        console.log(ALL_MOVIES);
        // --- 2. Application State Management ---
        const appState = {
            movies: ALL_MOVIES, // The full dataset (never changes)
            filteredMovies: [], // Movies matching filters/search (changes)
            searchTerm: '',
            currentPage: 1,
            totalPages: 1,
            pageSize: PAGE_SIZE,
            sortOrder: 'title_asc',
            selectedGenres: new Set(),
            selectedLanguages: new Set()
        };

        // --- 3. DOM Elements Cache ---
        const DOMElements = {
            movieList: document.getElementById('movie-list'),
            searchInput: document.getElementById('search-input'),
            clearSearchBtn: document.getElementById('clear-search-btn'),
            sortSelect: document.getElementById('sort-select'),
            genreFilters: document.getElementById('genre-filters'),
            languageFilters: document.getElementById('language-filters'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
            pageInfo: document.getElementById('page-info'),
            paginationContainer: document.getElementById('pagination-container')
        };

        // --- 4. Core Logic: Filtering, Sorting, and Paginaion ---

        /**
         * Applies search, genre, and language filters, then sorts the results.
         */
        function applyFiltersAndSort() {
            let results = appState.movies;
            const term = appState.searchTerm.toLowerCase().trim();

            // 1. Apply Search
            if (term) {
                results = results.filter(movie =>
                    movie.title.toLowerCase().includes(term) ||
                    movie.overview.toLowerCase().includes(term)
                );
            }
            console.log("out");
            console.log(appState.selectedGenres);

            // 2. Apply Genre Filters
            if (appState.selectedGenres.size > 0) {
                            console.log("in");

                console.log(appState.selectedGenres);
                results = results.filter(movie => {
                    const movieGenres = movie.genres.split(',').map(g => g.trim());
                    // console.log(movieGenres);
                    // Movie must include at least one of the selected genres
                    // return movieGenres.some(g => appState.selectedGenres.has(g));
                    const hasMatch = movieGenres.some(g => appState.selectedGenres.has(g));
        console.log("Does movie match selected genres?", hasMatch);

        return hasMatch;
                });
            }
//             if (appState.selectedGenres.size > 0) {
//     console.log("Selected genres:", Array.from(appState.selectedGenres)); // log selected genres

//     results = results.filter(movie => {
//         console.log("Checking movie:", movie.title, "with genres:", movie.genres);

//         // Split and clean up the movie genres
//         const movieGenres = movie.genres.split(',').map(g => g.trim());
//         console.log("Parsed movie genres:", movieGenres);

//         // Check if any genre matches
//         const hasMatch = movieGenres.some(g => appState.selectedGenres.has(g));
//         console.log("Does movie match selected genres?", hasMatch);

//         return hasMatch;
//     });

//     console.log("Filtered results:", results.map(m => m.title));
// }


            // 3. Apply Language Filters
            if (appState.selectedLanguages.size > 0) {
                results = results.filter(movie =>
                    appState.selectedLanguages.has(movie.original_language)
                );
            }

            // 4. Apply Sort
            results.sort((a, b) => {
                const { sortOrder } = appState;
                if (sortOrder === 'title_asc') return null;
                if (sortOrder === 'title_asc') return a.title.localeCompare(b.title);
                if (sortOrder === 'title_desc') return b.title.localeCompare(a.title);
                if (sortOrder === 'date_asc') return a.release_date - b.release_date;
                if (sortOrder === 'date_desc') return b.release_date - a.release_date;
                return 0;
            });

            appState.filteredMovies = results;
            appState.totalPages = Math.ceil(results.length / appState.pageSize);
            // Reset page to 1 if the current page is now out of bounds
            appState.currentPage = Math.min(appState.currentPage, appState.totalPages) || 1;
        }

        /**
         * Gets the subset of movies for the current page.
         * @returns {Array} Movies for the current page.
         */
        function getPagedMovies() {
            const start = (appState.currentPage - 1) * appState.pageSize;
            const end = start + appState.pageSize;
                console.log("Filtered movies:", appState.filteredMovies);

            return appState.filteredMovies.slice(start, end);
        }

        // --- 5. Rendering Functions (UI Updates) ---

        /**
         * Creates the HTML string for a single movie card.
         * @param {object} movie - The movie data.
         * @returns {string} HTML for the card.
         */
        function createMovieCard(movie) {
            // Note: The details URL is just a placeholder as we don't have a details page in this single file.
            const detailsUrl = `movie-details-english?id=${movie.id}`;

            return `
                <div class="movie-card">
                    <a href="${detailsUrl}" class="movie-card-link" title="View details for ${movie.title}">
                        <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title} Poster" class="movie-poster">
                        <div class="card-title">${movie.title}</div>
                    </a>
                </div>
            `;
        }

        /**
         * Renders the movie grid and pagination controls.
         */
        function renderMovieList() {
            const moviesToDisplay = getPagedMovies();
            console.log("moviesToDisplay");
            console.log(moviesToDisplay);
            DOMElements.movieList.innerHTML = ''; // Clear previous content

            if (moviesToDisplay.length === 0) {
                const message = appState.searchTerm || appState.selectedGenres.size > 0 || appState.selectedLanguages.size > 0
                    ? 'No movies match your current search and filter criteria.'
                    : 'No movies to display.';
                DOMElements.movieList.innerHTML = `<div class="status-message">${message}</div>`;
                DOMElements.paginationContainer.style.display = 'none';
                return;
            }

            const gridHtml = `<div class="movie-grid">${moviesToDisplay.map(createMovieCard).join('')}</div>`;
            DOMElements.movieList.innerHTML = gridHtml;
            
            // Update pagination
            DOMElements.pageInfo.textContent = `Page ${appState.currentPage} of ${appState.totalPages}`;
            DOMElements.prevBtn.disabled = appState.currentPage <= 1;
            DOMElements.nextBtn.disabled = appState.currentPage >= appState.totalPages;
            DOMElements.paginationContainer.style.display = 'flex';
        }

        /**
         * Renders the sidebar filter checkboxes.
         * @param {string} type - 'genre' or 'language'.
         * @param {Array<string>} options - List of unique options.
         * @param {HTMLElement} container - The DOM element to render into.
         */
        function renderCheckboxes(type, options, container) {
            container.innerHTML = options.sort().map(option => {
                const id = `${type}-${option.toLowerCase().replace(/\s/g, '-')}`;
                const checked = (type === 'genre' ? appState.selectedGenres : appState.selectedLanguages).has(option) ? 'checked' : '';
                const labelText = type === 'language' ? option.toUpperCase() : option;

                return `
                    <div class="checkbox-item">
                        <input type="checkbox" id="${id}" value="${option}" data-filter-type="${type}" ${checked}>
                        <label for="${id}">${labelText}</label>
                    </div>
                `;
            }).join('');
        }
        
        // --- 6. Main Render & Initialization ---

        /** The main function to re-render the entire application view. */
        function renderApp() {
            applyFiltersAndSort();
            renderMovieList();
            
            // Show/hide clear search button
            DOMElements.clearSearchBtn.style.display = appState.searchTerm.length > 0 ? 'block' : 'none';
        }

        /** Collects all unique genres and languages from the data. */
        function getUniqueOptions() {
            const allGenres = new Set();
            const allLanguages = new Set();

            appState.movies.forEach(movie => {
                movie.genres.split(',').forEach(g => {
                    const trimmed = g.trim();
                    if (trimmed) allGenres.add(trimmed);
                });
                if (movie.original_language) {
                    allLanguages.add(movie.original_language);
                }
            });

            return { genres: Array.from(allGenres), languages: Array.from(allLanguages) };
        }

        function initialize() {
            const { genres, languages } = getUniqueOptions();
            
            // 1. Initial Render of Filters
            renderCheckboxes('genres', genres, DOMElements.genreFilters);
            renderCheckboxes('spoken_languages', languages, DOMElements.languageFilters);

            // 2. Initial Data Load and Render
            renderApp();

            // 3. Set up Event Listeners
            setupEventListeners();
            // alert("IP");
        }

        // --- 7. Event Listeners ---

        function setupEventListeners() {
            // Search Input (Live search on input change)
            DOMElements.searchInput.addEventListener('input', (e) => {
                appState.searchTerm = e.target.value;
                appState.currentPage = 1; // Always reset to page 1 on new search
                renderApp();
            });

            // Clear Search Button
            DOMElements.clearSearchBtn.addEventListener('click', () => {
                DOMElements.searchInput.value = '';
                appState.searchTerm = '';
                appState.currentPage = 1;
                renderApp();
            });

            // Sort Dropdown
            DOMElements.sortSelect.addEventListener('change', (e) => {
                appState.sortOrder = e.target.value;
                renderApp();
            });

            // Filter Checkboxes (Delegated Listener for Genres/Languages)
            document.querySelector('.sidebar').addEventListener('change', (e) => {
                console.log("checked/uncheked");
                const target = e.target;
                if (target.matches('input[type="checkbox"]')) {
                    const filterType = target.dataset.filterType;
                    const value = target.value;
                    const set = filterType === 'genre' ? appState.selectedGenres : appState.selectedLanguages;
                    console.log(set);
                    if (target.checked) {
                        set.add(value);
                    } else {
                        set.delete(value);
                    }
                    console.log(set);
                    appState.currentPage = 1; // Reset to page 1 on filter change
                    appState.selectedGenres=set;
                    renderApp();
                }
            });

            // Pagination Buttons
            DOMElements.prevBtn.addEventListener('click', () => {
                if (appState.currentPage > 1) {
                    appState.currentPage--;
                    renderApp();
                    // Scroll to top of list for better UX
                    DOMElements.movieList.scrollIntoView({ behavior: 'smooth' });
                }
            });

            DOMElements.nextBtn.addEventListener('click', () => {
                if (appState.currentPage < appState.totalPages) {
                    appState.currentPage++;
                    renderApp();
                    // Scroll to top of list for better UX
                    DOMElements.movieList.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Run the initialization when the DOM is ready
        // document.addEventListener('DOMContentLoaded', initialize);
        initialize();
}