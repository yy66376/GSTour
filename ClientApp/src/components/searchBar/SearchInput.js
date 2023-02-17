import "./SearchInput.css";

export default function SearchInput({ onType, onKeyDown }) {
  return (
    <input
      type="text"
      className="search__input"
      aria-label="search"
      placeholder="Find a game"
      onChange={onType}
      onKeyDown={onKeyDown}
    />
  );
}
