"use client";

import { FormEvent, useMemo, useState, useEffect } from "react";
import { Calendar, PlusCircle, SlidersHorizontal } from "lucide-react";
import { SlotPresetSelector } from "@/app/components/poll/SlotPresetSelector";
import { generateTimeSlots, formatTime } from "@/lib/time-slots";
import { generateDateRange, getNextWeekRange, getNextMonthRange } from "@/lib/utils/date-ranges";
import { buildSelectedSlots } from "@/lib/utils/poll-slots";
import { useRouter } from "next/navigation";

export default function CreatePollPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    let voterId = localStorage.getItem("inmytime_voter_id");

    if (!voterId) {
      voterId = crypto.randomUUID();
      localStorage.setItem("inmytime_voter_id", voterId);
    }
  }, []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [singleDate, setSingleDate] = useState("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [targetDates, setTargetDates] = useState<string[]>([]);

  const [dailyStartTime, setDailyStartTime] = useState("09:00");
  const [dailyEndTime, setDailyEndTime] = useState("17:00");
  const [slotDuration, setSlotDuration] = useState<number>(60);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAddSingleDate = () => {
    setError(null);
    if (!singleDate) return;

    setTargetDates((prev) => {
      if (prev.includes(singleDate)) return prev;
      return [...prev, singleDate].sort();
    });

    setSingleDate("");
  };

  const handleAddRange = () => {
    setError(null);
    if (!rangeStart || !rangeEnd) {
      setError("Please choose start and end dates.");
      return;
    }

    const dates = generateDateRange(rangeStart, rangeEnd);

    if (dates.length === 0) {
      setError("Invalid date range.");
      return;
    }

    setTargetDates((prev) => {
      const set = new Set(prev);
      dates.forEach((d) => set.add(d));
      return Array.from(set).sort();
    });
  };

  const handleRemoveDate = (date: string) => {
    setTargetDates((prev) => prev.filter((d) => d !== date));
  };

  const MAX_PREVIEW_DATES = 16;

  const previewDates = useMemo(
    () => targetDates.slice(0, MAX_PREVIEW_DATES),
    [targetDates]
  );

  const sampleSlots = useMemo(() => {
    if (
      targetDates.length === 0 ||
      !dailyStartTime ||
      !dailyEndTime ||
      !slotDuration ||
      slotDuration <= 0
    ) {
      return [];
    }

    const firstDate = targetDates[0];
    const start = new Date(`${firstDate}T${dailyStartTime}`);
    const end = new Date(`${firstDate}T${dailyEndTime}`);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return [];
    }

    return generateTimeSlots({ start, end }, slotDuration).slice(0, 6);
  }, [targetDates, dailyStartTime, dailyEndTime, slotDuration]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    if (!title.trim()) {
      setLoading(false);
      return setError("Title is required.");
    }
    if (targetDates.length === 0) {
      setLoading(false);
      return setError("Add at least one target date.");
    }
    if (!dailyStartTime || !dailyEndTime) {
      setLoading(false);
      return setError("Set time window.");
    }
    if (!slotDuration || slotDuration <= 0) {
      setLoading(false);
      return setError("Invalid slot duration.");
    }

    const voterId = localStorage.getItem("inmytime_voter_id");
    const voterName = localStorage.getItem("inmytime_voter_name") || "Owner";

    if (!voterId) {
      setError("User identity not found in localStorage.");
      setLoading(false);
      return;
    }

    const createPayload = {
      title,
      description,
      ownerId: voterId,
      config: {
        targetDates,
        dailyStartTime,
        dailyEndTime,
        slotDuration,
      },
    };

    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        return setError(data.message || "Failed to create poll.");
      }

      const pollId = data.pollId;
      if (!pollId) {
        setLoading(false);
        return setError("Poll creation succeeded but poll ID missing.");
      }

      const selectedSlots = buildSelectedSlots(
        targetDates,
        dailyStartTime,
        dailyEndTime,
        slotDuration
      );

      const votePayload = {
        tempVoterId: voterId,
        voterName,
        selectedSlots,
      };

      const voteRes = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(votePayload),
      });

      const voteData = await voteRes.json();

      if (!voteRes.ok) {
        setLoading(false);
        return setError(voteData.message || "Failed to submit your vote.");
      }

      router.push(`/polls/${pollId}`);
    } catch (err) {
      console.error(err);
      setError("Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-indigo-50 py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center md:text-left">
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-500 font-semibold">
            Create Poll
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-slate-900">
            Find the{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              perfect time
            </span>{" "}
            for your team
          </h1>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-100 flex flex-col md:flex-row items-stretch">
          <div className="w-full md:w-7/12 p-6 sm:p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  Event title <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Product sync, sprint review, study session…"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Add an optional note…"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-slate-800">
                    Target dates <span className="text-pink-500">*</span>
                  </h2>
                  <span className="text-xs text-slate-500">
                    {targetDates.length} selected
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                    <p className="text-xs font-semibold mb-2 text-slate-700 uppercase tracking-wide">
                      Single day
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={singleDate}
                        onChange={(e) => setSingleDate(e.target.value)}
                        className="flex-1 rounded-xl border px-3 py-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddSingleDate}
                        disabled={!singleDate}
                        className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
                      >
                        <PlusCircle className="w-3 h-3" />
                        Add
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                    <p className="text-xs font-semibold mb-2 text-slate-700 uppercase tracking-wide">
                      Date range
                    </p>

                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={rangeStart}
                          onChange={(e) => setRangeStart(e.target.value)}
                          className="w-1/2 rounded-xl border px-3 py-2 text-xs"
                        />
                        <input
                          type="date"
                          value={rangeEnd}
                          onChange={(e) => setRangeEnd(e.target.value)}
                          className="w-1/2 rounded-xl border px-3 py-2 text-xs"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAddRange}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-600"
                      >
                        <PlusCircle className="w-3 h-3" />
                        Add range
                      </button>

                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            const { start, end } = getNextWeekRange();
                            setRangeStart(start);
                            setRangeEnd(end);

                            const dates = generateDateRange(start, end);
                            setTargetDates((prev) => {
                              const set = new Set(prev);
                              dates.forEach((d) => set.add(d));
                              return Array.from(set).sort();
                            });
                          }}
                          className="px-3 py-1.5 text-xs rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                        >
                          Next Week
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const { start, end } = getNextMonthRange();
                            setRangeStart(start);
                            setRangeEnd(end);

                            const dates = generateDateRange(start, end);
                            setTargetDates((prev) => {
                              const set = new Set(prev);
                              dates.forEach((d) => set.add(d));
                              return Array.from(set).sort();
                            });
                          }}
                          className="px-3 py-1.5 text-xs rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200"
                        >
                          Next Month
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {targetDates.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No dates selected yet.
                    </p>
                  ) : (
                    targetDates.map((d) => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1 rounded-full border bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                      >
                        {d}
                        <button
                          type="button"
                          onClick={() => handleRemoveDate(d)}
                          className="text-[11px] font-bold"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                  <p className="text-sm font-semibold text-slate-800">
                    Daily time window
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="block text-xs mb-1">Start</label>
                    <input
                      type="time"
                      value={dailyStartTime}
                      onChange={(e) => setDailyStartTime(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs mb-1">End</label>
                    <input
                      type="time"
                      value={dailyEndTime}
                      onChange={(e) => setDailyEndTime(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <SlotPresetSelector
                      value={slotDuration}
                      onChange={setSlotDuration}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              {successMessage && (
                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                  {successMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90 disabled:opacity-50"
              >
                {loading ? "Creating…" : "Create Poll"}
              </button>
            </form>
          </div>

          <div className="w-full md:w-5/12 bg-slate-900 text-slate-50 px-6 py-7 md:px-7 md:py-10 flex flex-col justify-between">
            <div className="flex flex-col flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-300">
                Live Preview
              </p>

              <h2 className="mt-2 text-lg font-semibold">
                Available Times Overview
              </h2>

              <div className="mt-5 space-y-3 flex-1 overflow-y-auto">
                {previewDates.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Add dates to see preview
                  </p>
                ) : (
                  previewDates.map((d, idx) => (
                    <div key={d} className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
                          style={{ width: `${Math.max(15, 100 - idx * 5)}%` }}
                        />
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-medium">
                          {new Date(d).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {dailyStartTime} – {dailyEndTime}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {sampleSlots.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] text-slate-400 mb-2">
                    First day example slots:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {sampleSlots.map((slot) => (
                      <span
                        key={slot.toISOString()}
                        className="rounded-full bg-slate-800 px-2 py-1 text-[11px]"
                      >
                        {formatTime(slot)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-slate-700 pt-4 text-xs text-slate-400 flex gap-3">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />{" "}
                No signup needed
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-pink-400" />{" "}
                Instant availability view
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
