import "./SearchResultsContainer.css";
import SearchResult from "./SearchResult";
import { Link } from "react-router-dom";

export default function SearchResultsContainer({
  category,
  searchData,
  searchTerm,
  onResultClick,
}) {
  if (searchData.count === undefined || searchData.items === undefined) {
    return null;
  }
  return (
    <div id="search-results-outer">
      <div className="result-heading">
        <h6>
          {category}
          <span id="search-results-count" className="badge bg-secondary ms-2">
            {searchData.count}
          </span>
        </h6>
      </div>
      <div id="search-results-inner">
        {searchData.items.length === 0 && (
          <img
            className="img-fluid"
            src={process.env.PUBLIC_URL + "/images/search_no_result.webp"}
            alt="No Search Results Icon"
          />
        )}
        {searchData.items.length > 0 &&
          searchData.items.map((item) => {
            return (
              <SearchResult
                key={item.id}
                category={category}
                item={item}
                onClick={onResultClick}
              />
            );
          })}
      </div>
      <div id="search-results-show-more">
        <Link
          to={`/${category}?search=${searchTerm}`}
          className="btn btn-secondary mx-auto mb-3"
          onClick={onResultClick}
        >
          View All Results
        </Link>
      </div>
    </div>
  );
}
