import { Search } from "react-bootstrap-icons";
import "./SearchButton.css";

export default function SearchButton() {
  return (
    <button className="search__submit" aria-label="submit search">
      <Search />
    </button>
  );
}
