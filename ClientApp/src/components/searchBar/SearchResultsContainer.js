import "./SearchResultsContainer.css";
import SearchResult from "./SearchResult";
import { Link } from "react-router-dom";

export default function SearchResultsContainer({
  searchData,
  searchTerm,
  onResultClick,
}) {
  if (searchData.count === undefined || searchData.items === undefined) {
    return null;
  }
  console.log(searchTerm);
  return (
    <div id="search-results-outer">
      <div className="game-heading">
        <h6>
          Games
          <span id="search-results-count" className="badge bg-secondary">
            {searchData.count}
          </span>
        </h6>
      </div>
      <div id="search-results-inner">
        {searchData.items.map((game) => {
          return (
            <SearchResult key={game.id} item={game} onClick={onResultClick} />
          );
        })}
      </div>
      <div id="search-results-show-more">
        <Link
          to={`/Games?search=${searchTerm}`}
          className="btn btn-secondary mx-auto mb-3"
          onClick={onResultClick}
        >
          View All Results
        </Link>
      </div>
    </div>
  );
}
