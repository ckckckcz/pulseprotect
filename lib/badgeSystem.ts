export type UserProgress = {
  gamesPlayed: number;
  correctAnswers: number;
  totalPoints: number;
  badges: string[];
};

export type BadgeRule = {
  id: string;
  name: string;
  description: string;
  points: number;
  check: (progress: UserProgress) => boolean;
};

export const BADGE_RULES: BadgeRule[] = [
  {
    id: "badge-a",
    name: "Detektif Pemula",
    description: "Main 2x & benar 2x",
    points: 100,
    check: (progress) =>
      progress.gamesPlayed >= 2 && progress.correctAnswers >= 2,
  },
  {
    id: "badge-b",
    name: "Raih 100 Poin",
    description: "Total Poin minimal 100",
    points: 200,
    check: (progress) => progress.totalPoints >= 100,
  },
];

const STORAGE_KEY = "antifake_user_progress";
const defaultProgress: UserProgress = {
  gamesPlayed: 0,
  correctAnswers: 0,
  totalPoints: 0,
  badges: [],
};

export function loadUserProgress(): UserProgress {
  if (typeof window === "undefined") return defaultProgress;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultProgress;
  try {
    return JSON.parse(raw);
  } catch {
    return defaultProgress;
  }
}

export function saveUserProgress(progress: UserProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function addGameResult({ correct, points }: { correct: number; points: number }) {
  const progress = loadUserProgress();
  progress.gamesPlayed += 1;
  progress.correctAnswers += correct;
  progress.totalPoints += points;
  // Cek badge baru
  const newBadges = BADGE_RULES
    .filter((rule) => !progress.badges.includes(rule.id) && rule.check(progress))
    .map((rule) => rule.id);
  if (newBadges.length) progress.badges.push(...newBadges);
  saveUserProgress(progress);
  return { ...progress, newBadges };
}