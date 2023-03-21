import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";
import SearchButton from "./SearchButton";
import SearchInput from "./SearchInput";
import SearchResultsContainer from "./SearchResultsContainer";
import SearchFilter from "./SearchFilter";

const minLen = 2;

export const Category = {
  Games: "Games",
  Events: "Events",
};

export default function SearchBar({ showSearch, onShowSearch, onHideSearch }) {
  const [timeoutId, setTimeoutId] = useState("");
  const [searchData, setSearchData] = useState({
    data: {},
    term: "",
    category: Category.Games,
  });
  const navigate = useNavigate();

  const performDelayedSearch = ({ term, category }) => {
    if (term.length <= minLen) {
      onHideSearch();
      return;
    }
    setTimeoutId((prevTimeoutId) => {
      clearTimeout(prevTimeoutId);
      return setTimeout(async () => {
        const response = await fetch(`api/${category}/Search?q=${term}`);
        onShowSearch();
        if (response.ok || response.status === 404) {
          const newData = await response.json();
          console.log(newData);
          setSearchData((prev) => {
            return { ...prev, data: newData };
          });
        } else {
          // display error message to user
        }
      }, 550);
    });
  };

  const onTypeHandler = (event) => {
    const newSearchTerm = event.target.value;
    setSearchData((prev) => {
      return {
        ...prev,
        term: newSearchTerm,
      };
    });

    performDelayedSearch({
      term: newSearchTerm,
      category: searchData.category,
    });
  };

  const keyDownHandler = (event) => {
    if (event.key === "Enter") {
      clearTimeout(timeoutId);
      onHideSearch();
      navigate(`/${searchData.category}/?search=${searchData.term}`);
    }
  };

  const onResultClickHandler = () => {
    onHideSearch();
  };

  const categoryChangeHandler = () => {
    setSearchData((prev) => {
      return {
        ...prev,
        category:
          prev.category === Category.Games ? Category.Events : Category.Games,
      };
    });

    performDelayedSearch({
      term: searchData.term,
      category:
        searchData.category === Category.Games
          ? Category.Events
          : Category.Games,
    });
  };

  return (
    <div id="search-container">
      <div className="content">
        <div className="search">
          <div className="search__input_container">
            <SearchInput
              onType={onTypeHandler}
              onKeyDown={keyDownHandler}
              category={searchData.category}
            />
          </div>
          <div className="search__filter_button">
            <SearchFilter
              category={searchData.category}
              onCategoryChange={categoryChangeHandler}
            />
            <SearchButton />
          </div>
        </div>
      </div>

      {showSearch ? (
        <SearchResultsContainer
          category={searchData.category}
          searchTerm={searchData.term}
          searchData={searchData.data}
          onResultClick={onResultClickHandler}
        />
      ) : null}
    </div>
  );
}
