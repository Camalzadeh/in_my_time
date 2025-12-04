"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [pollId, setPollId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const checkPoll = async () => {
    if (!pollId.trim()) return;

    try {
      const res = await fetch(`/api/polls/${pollId}`);

      if (res.status === 200) {
        router.push(`/poll/${pollId}`);
      } else {
        setError("No poll found with this ID");
      }
    } catch (_) {
      setError("Something went wrong");
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "400px", margin: "auto" }}>
      <h1 style={{ marginBottom: "20px" }}>Search Poll By ID</h1>

      <input
        type="text"
        value={pollId}
        onChange={(e) => {
          setPollId(e.target.value);
          setError("");
        }}
        placeholder="Enter poll ID"
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "16px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          marginBottom: "12px",
        }}
      />

      <button
        onClick={checkPoll}
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "16px",
          background: "#4f46e5",
          color: "white",
          border: "none",
          borderRadius: "8px",
        }}
      >
        Find Poll
      </button>

      {error && <p style={{ marginTop: "10px", color: "red" }}>{error}</p>}
    </div>
  );
}