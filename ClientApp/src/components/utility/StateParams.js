import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function useStateParams(
  initialState,
  paramsName,
  serialize,
  deserialize
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const existingValue = searchParams.get(paramsName);
  const [state, setState] = useState(
    existingValue ? deserialize(existingValue) : initialState
  );

  useEffect(() => {
    // Updates state when user navigates backwards or forwards in browser history
    if (existingValue && deserialize(existingValue) !== state) {
      setState(deserialize(existingValue));
    }
  }, [existingValue]);

  const onChange = (s) => {
    setState(s);
    searchParams.set(paramsName, serialize(s));
    setSearchParams(searchParams);
  };

  return [state, onChange];
}
