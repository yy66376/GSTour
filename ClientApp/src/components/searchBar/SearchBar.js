import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";
import SearchButton from "./SearchButton";
import SearchInput from "./SearchInput";
import SearchResultsContainer from "./SearchResultsContainer";

const minLen = 2;

export default function SearchBar({ showSearch, onShowSearch, onHideSearch }) {
  const [timeoutId, setTimeoutId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchData, setSearchData] = useState({});
  const navigate = useNavigate();

  const onTypeHandler = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);

    // fetch search results from API
    if (newSearchTerm.length <= minLen) {
      onHideSearch();
      return;
    }
    setTimeoutId((prevTimeoutId) => {
      clearTimeout(prevTimeoutId);
      return setTimeout(async () => {
        const response = await fetch(`api/Games/Search?q=${newSearchTerm}`);
        onShowSearch();
        if (response.ok) {
          const newSearchData = await response.json();
          console.log(newSearchData);
          setSearchData(newSearchData);
        } else if (response.status === 404) {
          setSearchData({ count: 0, items: [] });
        } else {
          // display error message to user
        }
      }, 550);
    });
  };

  const keyDownHandler = (event) => {
    if (event.key === "Enter") {
      onHideSearch();
      navigate(`/Games?search=${searchTerm}`);
    }
  };

  const onResultClickHandler = () => {
    onHideSearch();
  };

  return (
    <div id="search-container">
      <div className="content">
        <div className="search">
          <SearchInput onType={onTypeHandler} onKeyDown={keyDownHandler} />
          <SearchButton />
        </div>
      </div>

      {showSearch ? (
        <SearchResultsContainer
          searchTerm={searchTerm}
          searchData={searchData}
          onResultClick={onResultClickHandler}
        />
      ) : null}
    </div>
  );
}
