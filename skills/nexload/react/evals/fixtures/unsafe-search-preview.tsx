"use client";

import { useEffect, useState } from "react";

export const SearchPreview = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/search?q=${query}`).then((response) => response.text()).then((value) => {
      setResult(value);
      setLoading(false);
    });
  }, [query]);

  return <div>
    <input value={query} onChange={(event) => setQuery(event.target.value)} />
    {loading && <p>در حال جستجو...</p>}
    <div dangerouslySetInnerHTML={{ __html: result ?? query }} />
  </div>;
};
