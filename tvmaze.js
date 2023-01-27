"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const $episodeList = $("#episodes-list");
const noImg = "https://tinyurl.com/tv-missing";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
//const res = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`);

async function getShowsByTerm(term) {
  const res = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`);
  //Map through all show objects and return the information in an object
  return res.data.map((value) => {
    const show = value.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : noImg,
    };
  });
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
         <img src="${show.image}" alt="${show.name}" class="card-img-top">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
    );
    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const res = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  //Map through the episodes given an id from the show and return an object of the information found
  return res.data.map((episode) => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number,
  }));
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) {
  $episodeList.empty();
  //loop through all episodes, create an li & append the episode information found in getEpisodesofShow() and append that to the episode section area
  for (let episode of episodes) {
    const epInfo = document.createElement("li");

    epInfo.append(
      `${episode.name} (season ${episode.season}, episode ${episode.number})`
    );

    $episodeList.append(epInfo);
  }

  $episodesArea.show();
}

async function searchForEpisodesAndDisplay(evt) {
  //tie all episode function together by grabbing the id of the show from populateShows(), use that for getEpisodesOfShow(), then append all with this information using populateEpisodes().
  const showId = $(evt.target).closest(".Show").data("show-id");

  const getEpisodes = await getEpisodesOfShow(showId);
  populateEpisodes(getEpisodes);
}
//set an event listener on the shows list div, specifically the newly created button with the class "Show-getEpisodes" created in populateShows(). run searchForEpisodesAndDisplay().
$showsList.on("click", ".Show-getEpisodes", searchForEpisodesAndDisplay);
