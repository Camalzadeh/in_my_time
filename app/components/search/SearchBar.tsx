"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [id, setId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSearch = async () => {
    setError("");

    if (!id.trim()) {
      setError("Please enter an ID.");
      return;
    }

    try {
      const res = await fetch(`/api/poll/${id}`);

      if (res.ok) {
        router.push(`/poll/${id}`);
      } else {
        setError("No poll found with this ID.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-md mx-auto mt-6">
      <input
        type="text"
        placeholder="Enter poll ID"
        className="border border-gray-300 p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />

      <button
        onClick={handleSearch}
        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 transition text-white rounded-xl w-full"
      >
        Search
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}