import React, { useState } from "react";

function LandSearchFilter({ onFilter }) {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onFilter) {
      onFilter({
        search,
        location,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined
      });
    }
  };

  const handleReset = () => {
    setSearch('');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    if (onFilter) {
      onFilter({});
    }
  };

  return (
    <form onSubmit={handleSearch} className="mb-8 rounded-3xl bg-white p-5 shadow-lg backdrop-blur">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800"> Find Your Perfect Land </h2>
        <p className="text-sm text-gray-500"> Search and filter available lands for lease </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <input type="text"
          placeholder="Search by title or description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-lime-200 bg-white px-4 py-3 text-sm focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200" />

        <input type="text"
          placeholder=" Location "
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="rounded-xl border border-lime-200 bg-white px-4 py-3 text-sm focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200" />

        <input type="number"
          placeholder="Min Price (₹ / mon)"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="rounded-xl border border-lime-200 bg-white px-4 py-3 text-sm focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200" />

        <input type="number"
          placeholder="Max Price (₹ / mon)"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="rounded-xl border border-lime-200 bg-white px-4 py-3 text-sm focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200" />
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button type="button"
          onClick={handleReset}
          className="rounded-xl border border-lime-500 px-5 py-2.5 text-sm font-medium text-lime-700 transition hover:bg-lime-50">
          Reset
        </button>

        <button type="submit"
          className="rounded-xl bg-lime-500 px-6 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-lime-600">
          Search Lands
        </button>
      </div>
    </form>
  );
}

export default LandSearchFilter;