import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const movies = block.querySelector('a[href$=".json"]');
  // alert(movies);
  const queryString = window.location.search;
  // Parse it using URLSearchParams
  const urlParams = new URLSearchParams(queryString);
  // Get the value of a particular parameter
  const movieID = urlParams.get('id');  
  // alert(movieID);


  //###########################Temporary
  // Create a container element
const container1 = document.createElement('div');

// Set its inner HTML
container1.innerHTML = `
  <!-- Main Container where JavaScript will insert content -->
  <div id="movie-details-container" class="min-h-screen">
    <!-- Content will be dynamically inserted here -->
    <div style="padding: 2rem; text-align: center; font-size: 1.125rem; color: var(--text-muted);">
    </div>
  </div>
`;

// Append to body
document.body.appendChild(container1);



  // Replace with your actual URL
const url = movies;

// The id value you want to match
const targetId = movieID;

var currentMovieData= await getMatchingMovieData(url,movieID,block);

console.log("currentMovieData"+currentMovieData); 

        const movie = currentMovieData;
        
}


async function getMatchingMovieData(url,targetId,block){
  
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json(); // Convert response to JSON object
    })
    .then(json => {
      // console.log(json);
      const movies = json.data;
      // Find the movie with matching id
      const foundElement = movies.find(item => item.id === targetId);
      if (foundElement) {
        console.log("Matched element:", foundElement);

        const movie=foundElement;

        // --- Main Execution Block ---

        // Wait for the DOM to be fully loaded before trying to insert content
        // document.addEventListener('DOMContentLoaded', () => {
          // alert("inside dmcld");
            const container = document.querySelector('[data-block-name="movie-details"]');

            if (!movie) {
                container.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-muted);">Error: No movie data found in the JSON array.</div>`;
                return;
            }

            // Generate the dynamic HTML
            const movieHtml = generateMovieHtml(movie);
            // console.log(movieHtml);

            // Dynamically insert the generated HTML into the container
            // container.innerHTML = movieHtml;
            block.textContent = '';
            block.innerHTML=movieHtml;

            return movieHtml;
            
            

            // Run on load and on resize
            handleResize();
            window.addEventListener('resize', handleResize);
        // });



        return foundElement;
        // make
      } else {
        console.log(`No element found with id = ${targetId}`);
      }
    })
    .catch(error => {
      console.error("Error fetching JSON:", error);
    });

}

// --- Utility Functions ---

        /**
         * Converts an Excel serial date number to a formatted date string.
         * Assumes the Excel date system (days since Jan 1, 1900).
         * @param {string} serial - The Excel serial date as a string.
         * @returns {string} The formatted date string (e.g., "December 18, 2009").
         */
        function excelSerialToDate(serial) {
            const serialNum = parseInt(serial);
            if (isNaN(serialNum)) return 'N/A';
            
            // Excel's 1900 date system epoch: January 1, 1900.
            // JavaScript's epoch: January 1, 1970.
            // Offset for 1900 system to 1970 system is 25569 days.
            // 86400000ms = 24 hours * 60 min * 60 sec * 1000 ms
            const MS_PER_DAY = 86400000;
            const date = new Date((serialNum - 25569) * MS_PER_DAY);

            // Check if the date is valid and format it
            if (isNaN(date.getTime())) {
                return 'N/A';
            }

            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }

        /**
         * Formats a large number into a currency string (e.g., $2.92 Billion).
         * @param {string} amount - The number string (revenue/budget).
         * @returns {string} The formatted currency string.
         */
        function formatCurrency(amount) {
            const num = parseInt(amount);
            if (isNaN(num)) return 'N/A';

            // Use Intl.NumberFormat for cleaner large number formatting
            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0
            }).format(num);

            // Simple logic to convert millions/billions to text if needed, otherwise stick to standard
            if (num > 1000000000) {
                 return `$${(num / 1000000000).toFixed(2)} Billion`;
            } else if (num > 1000000) {
                 return `$${(num / 1000000).toFixed(1)} Million`;
            }

            return formatted;
        }

        /**
         * Converts runtime in minutes to H:MM format.
         * @param {string} minutes - The runtime in minutes as a string.
         * @returns {string} The formatted runtime (e.g., "2h 42m").
         */
        function formatRuntime(minutes) {
            const min = parseInt(minutes);
            if (isNaN(min)) return 'N/A';
            const hours = Math.floor(min / 60);
            const remainingMinutes = min % 60;
            return `${hours}h ${remainingMinutes}m`;
        }
        
        /**
         * Limits a comma-separated list string to the first N items.
         * @param {string} listString - The comma-separated string.
         * @param {number} limit - The maximum number of items to show.
         * @returns {string} The limited and formatted list string.
         */
        function limitList(listString, limit) {
            if (!listString) return 'N/A';
            return listString.split(',').map(s => s.trim()).slice(0, limit).join(', ');
        }


        // --- HTML Generation Function ---

        /**
         * Generates the complete HTML content for the movie details page.
         * @param {object} m - The processed movie data object.
         * @returns {string} The HTML string.
         */
        function generateMovieHtml(m) {
            const releaseDateFormatted = excelSerialToDate(m.release_date);
            const revenueFormatted = formatCurrency(m.revenue);
            const budgetFormatted = formatCurrency(m.budget);
            const runtimeFormatted = formatRuntime(m.runtime);
            const mainCast = limitList(m.cast, 6); // Limit cast to first 6 names
            const genres = m.genres.split(',').map(g => g.trim());

            // Placeholder image URL
            const posterUrl = `https://image.tmdb.org/t/p/w200${m.poster_path}`;
            
            // Hero Banner Section
            const heroBanner = `
                <div class="hero-banner">
                    <div class="hero-overlay"></div>
                    
                    <div class="container hero-content">
                        
                        <!-- Poster and Main Info (Handled by CSS media queries for stacking/side-by-side)  flex-direction: column;-->
                        <div style="display: flex;  align-items: center; width: 100%;">
                            
                            <!-- Poster -->
                            <img 
                                src="${posterUrl}" 
                                alt="${m.title} Poster" 
                                class="movie-poster"
                                onerror="this.onerror=null;this.src='https://placehold.co/300x450/1C2134/E5E7EB?text=Poster+Unavailable';"
                            >

                            <!-- Text Content -->
                            <div class="movie-info">
                                <h1 class="movie-title">
                                    ${m.title}
                                </h1>
                                <p class="movie-tagline">${m.tagline}</p>
                                
                                <div class="genre-list">
                                    ${genres.map(genre => 
                                        `<span class="genre-item">${genre}</span>`
                                    ).join('')}
                                </div>

                                <div class="meta-data">
                                    <div class="meta-item">
                                        <!-- Star Icon (Inline SVG for no dependencies) -->
                                        <svg style="width: 20px; height: 20px; color: gold;" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.071 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.031a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.031a1 1 0 00-1.175 0l-2.8 2.031c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.031c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                                        </svg>
                                        <span style="font-size: 1.125rem; font-weight: bold;">${parseFloat(m.imdb_rating).toFixed(1)}</span>
                                        <span style="font-size: 0.875rem; color: var(--text-muted);">/ 10</span>
                                    </div>
                                    <span style="color: var(--text-muted);">•</span>
                                    <span style="font-size: 0.875rem;">${runtimeFormatted}</span>
                                    <span style="color: var(--text-muted);">•</span>
                                    <span style="font-size: 0.875rem;">${releaseDateFormatted.split(' ').pop()} (${m.status})</span>
                                </div>

                                <p style="margin-top: 1rem; font-size: 1rem; font-weight: 600;">
                                    Director: <span style="color: rgba(79, 70, 229, 0.8);">${m.director}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Note: The Hero section's layout becomes side-by-side on desktop via the CSS media query on the .hero-content's direct child flex container.

            // Main Details and Synopsis Section
            const mainContent = `
                <div class="container p-section" style="padding-top: 3rem; padding-bottom: 3rem;">
                    
                    <!-- Overview Section -->
                    <div class="card">
                        <h2 class="section-title">Overview</h2>
                        <p style="margin-top: 1rem; color: var(--text-muted);">${m.overview}</p>
                    </div>

                    <!-- Key Metrics Section (Grid Layout) -->
                    <div class="grid-4-col" style="margin-bottom: 3rem;">
                        
                        <div class="metric-box">
                            <p class="metric-label">Votes</p>
                            <p class="metric-value">${parseInt(m.vote_count).toLocaleString()} (${m.imdb_votes})</p>
                        </div>
                        
                        <div class="metric-box">
                            <p class="metric-label">Budget</p>
                            <p class="metric-value">${budgetFormatted}</p>
                        </div>
                        
                        <div class="metric-box">
                            <p class="metric-label">Revenue</p>
                            <p class="metric-value">${revenueFormatted}</p>
                        </div>
                        
                        <div class="metric-box">
                            <p class="metric-label">Language</p>
                            <p class="metric-value">${m.original_language.toUpperCase()}</p>
                        </div>
                    </div>

                    <!-- Cast & Crew Section (Two Columns on Desktop) -->
                    <div class="card">
                        <h2 class="section-title">Cast & Crew</h2>
                        
                        <div class="crew-grid">
                            
                            <!-- Cast Column -->
                            <div>
                                <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--accent);">Top Cast</h3>
                                <p style="color: var(--text-muted);">${mainCast}</p>
                            </div>

                            <!-- Crew Column -->
                            <div>
                                <h3 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--accent);">Key Crew</h3>
                                <dl style="line-height: 1.5; margin: 0;">
                                    <div class="crew-row" style="margin-bottom: 0.5rem;">
                                        <dt class="crew-label">Director</dt>
                                        <dd class="crew-value">${m.director}</dd>
                                    </div>
                                    <div class="crew-row" style="margin-bottom: 0.5rem;">
                                        <dt class="crew-label">Writers</dt>
                                        <dd class="crew-value">${limitList(m.writers, 2)}</dd>
                                    </div>
                                    <div class="crew-row" style="margin-bottom: 0.5rem;">
                                        <dt class="crew-label">Producers</dt>
                                        <dd class="crew-value">${limitList(m.producers, 3)}</dd>
                                    </div>
                                    <div class="crew-row" style="margin-bottom: 0.5rem;">
                                        <dt class="crew-label">DOP</dt>
                                        <dd class="crew-value">${m.director_of_photography}</dd>
                                    </div>
                                    <div class="crew-row">
                                        <dt class="crew-label">Composer</dt>
                                        <dd class="crew-value">${m.music_composer}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>

                    <!-- Production Info -->
                    <div class="card">
                        <h2 class="section-title">Production Details</h2>
                        <dl class="production-grid" style="margin-top: 1rem;">
                            
                            <div class="production-row">
                                <dt class="production-label">Original Title</dt>
                                <dd class="production-value">${m.original_title}</dd>
                            </div>
                            <div class="production-row">
                                <dt class="production-label">Release Date</dt>
                                <dd class="production-value">${releaseDateFormatted}</dd>
                            </div>
                            <div class="production-row">
                                <dt class="production-label">Production Co.</dt>
                                <dd class="production-value">${limitList(m.production_companies, 2)}</dd>
                            </div>
                            <div class="production-row">
                                <dt class="production-label">Countries</dt>
                                <dd class="production-value">${m.production_countries}</dd>
                            </div>
                            <div class="production-row">
                                <dt class="production-label">Spoken Languages</dt>
                                <dd class="production-value">${m.spoken_languages}</dd>
                            </div>
                            <div class="production-row">
                                <dt class="production-label">IMDb ID</dt>
                                <dd class="production-value">
                                    <a href="https://www.imdb.com/title/${m.imdb_id}/" target="_blank">${m.imdb_id}</a>
                                </dd>
                            </div>
                        </dl>
                    </div>

                </div>
            `;

            return heroBanner + mainContent;
        }

        // Add a media query listener for responsive layout adjustments that are easier in JS
            function handleResize() {
                const isDesktop = window.matchMedia("(min-width: 768px)").matches;
                const heroContent = document.querySelector('.hero-content > div'); // The flex container inside .hero-content

                if (heroContent) {
                    if (isDesktop) {
                        // Apply desktop layout: items-start, side-by-side
                        heroContent.style.flexDirection = 'row';
                        heroContent.style.alignItems = 'flex-start';
                    } else {
                        // Apply mobile layout: items-center, stack
                        heroContent.style.flexDirection = 'column';
                        heroContent.style.alignItems = 'center';
                    }
                }
            }