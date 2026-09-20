// Each event has a stable unique `id` (never an array index — see Experiment 4,
// section 3, "Key Selection Comparison Matrix" — this is what keeps reconciliation
// cheap and keeps drag state from breaking on reorder).
export const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const initialEvents = [
  { id: "evt-1", title: "Design review", time: "09:00", day: 0, tag: "work" },
  { id: "evt-2", title: "1:1 with mentor", time: "11:30", day: 0, tag: "work" },
  { id: "evt-3", title: "DSA — Trees", time: "18:00", day: 0, tag: "study" },

  { id: "evt-4", title: "Gym — Push day", time: "07:00", day: 1, tag: "fitness" },
  { id: "evt-5", title: "Mock interview", time: "15:00", day: 1, tag: "work" },

  { id: "evt-6", title: "ML lecture", time: "10:00", day: 2, tag: "study" },
  { id: "evt-7", title: "Sprint planning", time: "14:00", day: 2, tag: "work" },
  { id: "evt-8", title: "Gym — Pull day", time: "18:30", day: 2, tag: "fitness" },

  { id: "evt-9", title: "Code review", time: "12:00", day: 3, tag: "work" },

  { id: "evt-10", title: "System design", time: "09:30", day: 4, tag: "study" },
  { id: "evt-11", title: "Gym — Legs", time: "18:00", day: 4, tag: "fitness" },
  { id: "evt-12", title: "Team retro", time: "16:00", day: 4, tag: "work" },

  { id: "evt-13", title: "Contest — LeetCode", time: "20:00", day: 5, tag: "study" },

  { id: "evt-14", title: "Long run", time: "08:00", day: 6, tag: "fitness" },
  { id: "evt-15", title: "Resume polish", time: "17:00", day: 6, tag: "work" },
];

export const TAG_COLORS = {
  work: { bg: "bg-signal/10", border: "border-signal/40", dot: "bg-signal" },
  study: { bg: "bg-flag/10", border: "border-flag/40", dot: "bg-flag" },
  fitness: { bg: "bg-alert/10", border: "border-alert/40", dot: "bg-alert" },
};
