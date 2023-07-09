import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0); // calculate the average of the array

const KEY = "82e8dca2";

export default function App() {
  const [query, setQuery] = useState(""); // query state
  const [selectedId, setSelectedId] = useState(null); // selected movie id

  const { movies, loading, error } = useMovies(query); // custom hook to fetch movies

  // const [watched, setWatched] = useState([]);

  const [watched, setWatched] = useState(function () {
    const storedValue = localStorage.getItem("watched");
    return storedValue ? JSON.parse(storedValue) : [];
  }); // watched movies state (get the watched movies from the local storage)

  // useEffect(() => {
  //   console.log("After initial render");
  // }, []); // this will be called only once after the initial render

  // useEffect(() => {
  //   console.log("After every render");
  // });  // this will be called every time the component renders

  // useEffect(() => {
  //   console.log("D");
  // }, [query]); // this will be called only when the query changes

  // console.log("During render"); // this will be called every time the component renders

  function handleSelectmovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  } // if the selected movie id is equal to the id, set the selected movie id to null, else set it to the id

  function handleCloseMovie() {
    setSelectedId(null);
  } // set the selected movie id to null when the close button is clicked

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);

    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  } // add the movie to the watched list

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
    // delete the movie from the watched list
  }

  useEffect(() => {
    localStorage.setItem("watched", JSON.stringify(watched)); // set the watched movies to the local storage
  }, [watched]); // get the watched movies from the local storage

  return (
    <>
      <Navbar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Navbar>
      <Main>
        {/* <Box element={<MovieList movies={movies} />} /> */}
        <Box>
          {/* {loading ? <Loader /> : <MovieList movies={movies} />} */}
          {loading && <Loader />}
          {/* if loading is true, show the loader */}
          {!loading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectmovie} />
          )}
          {/* if loading is false and error is false, show the movie list */}
          {error && <ErrorMessage error={error} />}
          {/* if error is true, show the error message */}
        </Box>
        {/* <Box
          element={
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList watched={watched} />
            </>
          }
        /> */}
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ error }) {
  return (
    <p className="error">
      <span>💀 </span>
      {error}
    </p>
  );
}

function Navbar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useEffect(() => {
    function callback(e) {
      if (document.activeElement === inputEl.current) return; // if the input field has some movie name then do nothing

      if (e.code === "Enter") {
        inputEl.current.focus();
        setQuery("");
      }
    } // if enter key is pressed put the input field on focus

    document.addEventListener("keydown", callback);
    return () => document.addEventListener("keydown", callback); //
  }, [setQuery]); // focus on the search input when the component mounts (when the page loads)

  // useEffect(() => {
  //   const el = document.querySelector(".search");
  //   el.focus();
  // }, []);

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "-" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

// function WatchedBox() {
//   const [watched, setWatched] = useState(tempWatchedData);
//   const [isOpen2, setIsOpen2] = useState(true);

//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "-" : "+"}
//       </button>
//       {isOpen2 && (
//         <>
//           <WatchedSummary watched={watched} />
//           <WatchedMoviesList watched={watched} />
//         </>
//       )}
//     </div>
//   );
// }

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [loading, setLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const countRef = useRef(0);

  useEffect(() => {
    if (userRating) countRef.current++;
  }, [userRating]); // increment the countRef when the userRating changes

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId); // check if the movie is already in the watched list
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating; // get the user rating of the movie if it is already in the watched list

  const {
    Title,
    Year,
    Poster,
    Runtime,
    Plot,
    Released,
    Actors,
    Director,
    Genre,
    imdbRating,
  } = movie; // destructuring the movie object to get the properties we need to display

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      Title,
      Year,
      Poster,
      imdbRating: Number(imdbRating),
      Runtime: Number(Runtime.split(" ")[0]),
      userRating,
      countRatingDecisions: countRef.current, // to keep track of how many times the user has rated the movie
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie(); // close the movie details when the add button is clicked
  } // function to add the movie to the watched list when the add button is clicked

  useEffect(() => {
    function callback(e) {
      if (e.code === "Escape") {
        onCloseMovie();
      }
    } // function to close the movie details when the escape key is pressed on the keyboard (only when the movie details are open)
    document.addEventListener("keydown", callback); // add the event listener to the document

    return function () {
      document.removeEventListener("keydown", callback);
    }; // remove the event listener from the document when the movie details are closed
  }, [onCloseMovie]);

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
      ); // fetch the movie details from the api using the selectedId
      const data = await res.json();
      setMovie(data);
      setLoading(false);
    };

    fetchMovie();
  }, [selectedId]); // fetch the movie details when the selectedId changes

  useEffect(() => {
    document.title = `Movie | ${Title}`; // change the document title to the movie title when the movie details are fetched

    return function () {
      document.title = "usePopcorn"; // change the document title back to the default when the movie details are closed
    };
  }, [Title]);

  return (
    <div className="details">
      {loading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={Poster} alt={`Poster of the ${movie.Title}`} />
            <div className="details-overview">
              <h2>{Title}</h2>
              <p>
                {Released} &bull; {Runtime}
              </p>
              <p>{Genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>You rated this movie {watchedUserRating} ⭐</p>
              )}
            </div>
            <p>
              <em>{Plot}</em>
            </p>
            <p>Starring: {Actors}</p>
            <p>Directed by {Director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.Runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.Runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
