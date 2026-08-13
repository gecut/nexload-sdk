"use client";

import { useEffect, useState } from "react";

type Product = { id: string; title: string };

export default function ProductList({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState(products);

  useEffect(() => {
    setFilteredItems(products.filter((product) => product.title.includes(query)));
  }, [products, query]);

  return <section>
    <input value={query} onChange={(event) => setQuery(event.target.value)} />
    {filteredItems.length === 0 ? <p>محصولی پیدا نشد.</p> : filteredItems.map((product) => <div key={product.id}>{product.title}</div>)}
  </section>;
}
