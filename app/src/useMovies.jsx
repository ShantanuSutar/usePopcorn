import { useState, useEffect } from "react";

const KEY = "82e8dca2";
export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null); // error message
  const [loading, setLoading] = useState(false); // loading state
  useEffect(() => {
    const controller = new AbortController(); // create a new AbortController instance to abort the fetch request when the component unmounts or when the query changes before the fetch request is completed (when the user types too fast) to prevent memory leaks
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null); // set loading to true and error to null before fetching the movies
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
          { signal: controller.signal }
        ); // fetch movies from API using the query

        if (!res.ok) {
          throw new Error("Something went wrong");
        } // if the response is not ok, throw an error

        const data = await res.json();
        if (data.Response === "False") {
          throw new Error("Movie not found");
        } // movie not found error
        setMovies(data.Search);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message); //catch the error and set the error message
        }
      } finally {
        setLoading(false); // set loading to false
      }
    };

    if (!query) {
      setMovies([]);
      setError(null);
      return;
    } // if query is empty, set movies to empty array and error to null and return

    fetchMovies();

    return function () {
      controller.abort();
    }; // abort the fetch request when the component unmounts or when the query changes before the fetch request is completed (when the user types too fast) to prevent memory leaks
  }, [query]);

  return { movies, loading, error };
}
