import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Game from "./games/Game";
import { Container } from "reactstrap";
import ReactPaginate from "react-paginate";
import { ArrowLeft, ArrowRight } from "react-bootstrap-icons";
import GameActions from "./games/GameActions";

import "./Games.css";

const getDefinedParams = (...params) => {
  const definedParams = {};
  for (const param of params) {
    const [paramName, paramVal] = param;
    if (paramVal) {
      definedParams[paramName] = paramVal;
    }
  }
  return definedParams;
};

export default function Games() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [gameState, setGameState] = useState({
    data: {},
    loading: true,
  });

  console.log("Rendered!");

  // Get search parameters
  let page = parseInt(searchParams.get("page") ? searchParams.get("page") : 1);
  let pageSize = parseInt(
    searchParams.get("pageSize") ? searchParams.get("pageSize") : 10
  );
  let sort = searchParams.get("sort") || "default";
  let search = searchParams.get("search");

  const fetchGameData = useCallback(async () => {
    const params = getDefinedParams(
      ["page", page],
      ["pageSize", pageSize],
      ["sort", sort],
      ["search", search]
    );
    const response = await fetch("api/Games?" + new URLSearchParams(params));
    let data = null;
    if (response.ok) {
      data = await response.json();
    } else {
      // tell user that game api is down
    }
    return data;
  }, [page, pageSize, sort, search]);

  // populate games when the component mounts
  useEffect(() => {
    const populateGamesData = async () => {
      const response = await fetchGameData();
      if (response !== null) {
        setGameState({ data: response, loading: false });
      } else {
        // tell user that game api is down
      }
    };
    populateGamesData();
  }, [fetchGameData]);

  // get total number of pages
  const { totalPages, totalResults } = gameState.data;

  // fetch new game data when a page is clicked
  const handlePageClick = async (event) => {
    page = event.selected + 1;
    const newData = await fetchGameData();
    setGameState({ data: newData, loading: false });
    const definedParams = getDefinedParams(
      ["page", page],
      ["pageSize", pageSize],
      ["sort", sort],
      ["search", search]
    );
    setSearchParams(definedParams);
  };

  const sortChangeHandler = (newSort) => {
    searchParams.set("sort", newSort);
    searchParams.set("page", 1);
    setSearchParams(searchParams);
  };

  const pageSizeChangeHandler = (newPageSize) => {
    searchParams.set("pageSize", parseInt(newPageSize));
    searchParams.set("page", 1);
    setSearchParams(searchParams);
  };

  const initialPage = page ? page - 1 : 0;
  const renderGames = (games) => {
    if (games.length === 0) {
      return (
        <>
          <p className="text-center search-results-none-found-header mt-4">
            There are no search games matching your search term: {search}
          </p>
          <img
            className="img-fluid  d-block m-auto"
            src={process.env.PUBLIC_URL + "/images/dead_file.png"}
            alt="No search results found"
          />
          <p className="text-center search-results-none-found-footer">
            Please try another search term.
          </p>
        </>
      );
    }
    return (
      <>
        {/* Heading */}
        <div
          id="game-index-heading"
          className="d-flex justify-content-center mt-4"
        >
          {searchParams.has("search") && (
            <h2 className="text-center">
              Games matching search term: {searchParams.get("search")}
            </h2>
          )}
          {!searchParams.has("search") && <h2>All Games</h2>}
        </div>

        <GameActions
          page={page}
          pageSize={pageSize}
          currentPageSize={gameState.data.games.length}
          sort={sort}
          totalResults={totalResults}
          onChangeSort={sortChangeHandler}
          onChangePageSize={pageSizeChangeHandler}
        />

        <Container className="p-0">
          {/* {games.length === 0 && } */}
          {games.map((g) => {
            return (
              <Game
                key={g.id}
                id={g.id}
                headerImageUrl={g.headerImageUrl}
                isFree={g.isFree}
                initialPrice={g.initialPrice}
                finalPrice={g.finalPrice}
                name={g.name}
                windowsSupport={g.windowsSupport}
                macSupport={g.macSupport}
                linuxSupport={g.linuxSupport}
                releaseDate={g.releaseDate}
              />
            );
          })}
        </Container>

        <ReactPaginate
          previousLabel={<ArrowLeft />}
          nextLabel={<ArrowRight />}
          breakLabel={"..."}
          pageCount={totalPages}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={handlePageClick}
          containerClassName="pagination justify-content-center mt-5"
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          breakClassName="page-item"
          breakLinkClassName="page-link"
          activeClassName="active"
          forcePage={initialPage}
          hrefBuilder={(page, pageCount, selected) => {
            if (page >= 1 && page <= pageCount) {
              return `/Games?page=${page}`;
            } else {
              return "#";
            }
          }}
        />
      </>
    );
  };

  let contents = gameState.loading ? (
    <p>
      <em>Loading...</em>
    </p>
  ) : (
    renderGames(gameState.data.games)
  );

  return <>{contents}</>;
}
