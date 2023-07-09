import { useEffect } from "react";
export function useKey(key, action) {
  useEffect(() => {
    function callback(e) {
      if (e.code.toLowerCase() === key.toLowerCase()) {
        action();
      }
    } // callback function to be called when the key is pressed (if the key is the same as the key passed to the function, call the action passed to the function)
    document.addEventListener("keydown", callback); // call the callback function when the key is pressed

    return function () {
      document.removeEventListener("keydown", callback);
    }; // remove the event listener from the document when the movie details are closed
  }, [action, key]);
}
