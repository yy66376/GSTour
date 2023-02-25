import { useEffect, useState } from "react";
import { Col, Input, Label, Row } from "reactstrap";
import "./GameActions.css";

export default function GameActions({
  currentPageSize,
  page,
  pageSize,
  sort,
  totalResults,
  onChangeSort,
  onChangePageSize,
}) {
  const [selectedPageSize, setSelectedPageSize] = useState(pageSize);
  const [selectedSort, setSelectedSort] = useState(sort);

  useEffect(() => {
    setSelectedPageSize(pageSize);
    setSelectedSort(sort);
  }, [sort, pageSize]);

  const resultStart = (page - 1) * pageSize + 1;
  const resultEnd = (page - 1) * pageSize + currentPageSize;

  const pageSizes = [15, 20, 40, 50];
  const sortOptions = [
    { name: "Names (A-Z)", value: "name_asc" },
    { name: "Names (Z-A)", value: "name_desc" },
    { name: "Release Date (Newest)", value: "date_desc" },
    { name: "Release Date (Oldest)", value: "date_asc" },
    { name: "Price: Low to High", value: "price_asc" },
    { name: "Price: High to Low", value: "price_desc" },
  ];

  const pageSizeChangeHandler = (event) => {
    onChangePageSize(event.target.value);
    setSelectedPageSize(event.target.value);
  };

  const pageSortChangeHandler = (event) => {
    onChangeSort(event.target.value);
    setSelectedSort(event.target.value);
  };

  return (
    <Row>
      <Col sm={6}>
        <p className="show-results-text">
          Showing results {resultStart} - {resultEnd} of {totalResults}
        </p>
      </Col>

      <Col sm={6} className="d-flex justify-content-end">
        {/* Number of results per page */}
        <div id="page-size" className="me-3">
          <Label for="page-size-select">Results per page: &nbsp;</Label>
          <Input
            className="form-select-sm"
            type="select"
            name="page-size-select"
            id="page-size-select"
            onChange={pageSizeChangeHandler}
            value={selectedPageSize}
          >
            <option value="10">...</option>
            {pageSizes.map((p) => (
              <option key={p} value={p.toString()}>
                {p}
              </option>
            ))}
          </Input>
        </div>

        {/* Sorting results */}
        <div id="page-sort">
          <Label for="page-sort-select">Sort by: &nbsp;</Label>
          <Input
            className="form-select-sm"
            type="select"
            name="page-sort-select"
            id="page-sort-select"
            onChange={pageSortChangeHandler}
            value={selectedSort}
          >
            <option value="default">...</option>
            {sortOptions.map((sortOption) => (
              <option key={sortOption.value} value={sortOption.value}>
                {sortOption.name}
              </option>
            ))}
          </Input>
        </div>
      </Col>
    </Row>
  );
}
