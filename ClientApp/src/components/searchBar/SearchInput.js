import { Category } from "./SearchBar";
import "./SearchInput.css";

export default function SearchInput({ onType, onKeyDown, category }) {
  return (
    <input
      type="text"
      className="search__input"
      aria-label="search"
      placeholder={`Find ${category === Category.Games ? "game" : "event"}`}
      onChange={onType}
      onKeyDown={onKeyDown}
    />
  );
}
