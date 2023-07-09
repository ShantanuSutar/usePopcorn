import { useState, useEffect } from "react";
export function useLocalStorageState(initialState, key) {
  const [value, setValue] = useState(function () {
    const storedValue = localStorage.getItem("watched");
    return storedValue ? JSON.parse(storedValue) : initialState;
  }); // watched movies state (get the watched movies from the local storage)

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value)); // set the watched movies to the local storage
  }, [value, key]); // get the watched movies from the local storage

  return [value, setValue];
}
