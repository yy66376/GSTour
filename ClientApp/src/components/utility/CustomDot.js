export default function CustomDot({ index, onClick, active }) {
  const clickHandler = (event) => {
    event.preventDefault();
    onClick();
  };

  return (
    <button className={active ? "active" : "inactive"} onClick={clickHandler}>
      <img alt="screenshot" src="#" />
    </button>
  );
}
