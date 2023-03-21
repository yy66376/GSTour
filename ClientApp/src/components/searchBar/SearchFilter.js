import "./SearchFilter.css";
import { Button } from "reactstrap";

export default function SearchFilter({ category, onCategoryChange }) {
  const clickHandler = () => {
    onCategoryChange();
  };

  return (
    <Button
      className="search__filter"
      color="info"
      size="sm"
      outline
      onClick={clickHandler}
    >
      {category}
    </Button>
  );
}
