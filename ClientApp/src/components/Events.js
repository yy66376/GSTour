import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Game from "./games/Game";
import Event from "./events/Event";
import { Container, Button } from "reactstrap";
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

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [eventState, setEventState] = useState({
    data: {},
    loading: true,
  });
  const navigate = useNavigate();

  console.log("Rendered!");

  // Get search parameters
  let page = parseInt(searchParams.get("page") ? searchParams.get("page") : 1);
  let pageSize = parseInt(
    searchParams.get("pageSize") ? searchParams.get("pageSize") : 10
  );
  let sort = searchParams.get("sort");
  let search = searchParams.get("search");

  const fetchEventData = useCallback(async () => {
    const params = getDefinedParams(
      ["page", page],
      ["pageSize", pageSize],
      ["sort", sort],
      ["search", search]
    );
    const response = await fetch("api/Events?" + new URLSearchParams(params));
    let data = null;
    if (response.ok) {
      data = await response.json();
    } else {
      // tell user that game api is down
    }
    return data;
  }, [page, pageSize, sort, search]);

  // populate events when the component mounts
  useEffect(() => {
    const populateEventsData = async () => {
      console.log("fetching new data");
      const response = await fetchEventData();
      if (response !== null) {
        setEventState({ data: response, loading: false });
      } else {
        // tell user that game api is down
      }
    };
    populateEventsData();
  }, [fetchEventData]);

  // get total number of pages
  const { totalPages, totalResults } = eventState.data;

  // fetch new event data when a page is clicked
  const handlePageClick = async (event) => {
    page = event.selected + 1;
    const newData = await fetchEventData();
    setEventState({ data: newData, loading: false });
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

  const createButtonClickHandler = () => {
    navigate("/Events/Create");
  };

  const initialPage = page ? page - 1 : 0;
  console.log("Initial page: " + initialPage);
  const renderEvents = (events) => {
    return (
      <>
        {/* Heading */}
        <div
          id="game-index-heading"
          className="d-flex justify-content-center mt-4"
        >
          {searchParams.has("search") && (
            <h2 className="text-center">
              Events matching search term: {searchParams.get("search")}
            </h2>
          )}
          {!searchParams.has("search") && <h2>All Events</h2>}
        </div>

        <GameActions
          page={page}
          pageSize={pageSize}
          currentPageSize={eventState.data.events.length}
          sort={sort}
          totalResults={totalResults}
          onChangeSort={sortChangeHandler}
          onChangePageSize={pageSizeChangeHandler}
        />

        <div className="create-event-container d-flex justify-content-end mt-3">
          <Button color="primary" onClick={createButtonClickHandler}>
            Create Event
          </Button>
        </div>

        <Container className="p-0">
          {/* {events.length === 0 && } */}
          {events.map((g) => {
            return (
              <Event
                id={g.id}
                name={g.name}
                date={g.date}
                location={g.location}
                game={g.game}
                organizerName={g.organizerName}
                headerImageUrl={g.headerImageUrl}
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
              return `/Events?page=${page}`;
            } else {
              return "#";
            }
          }}
        />
      </>
    );
  };

  let contents = eventState.loading ? (
    <p>
      <em>Loading...</em>
    </p>
  ) : (
    renderEvents(eventState.data.events)
  );

  return <>{contents}</>;
}
