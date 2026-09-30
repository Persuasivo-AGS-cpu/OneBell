export type Exercise = {
  id: string; name: string; pattern: string; groups: string[]; primary: string; secondary: string;
  difficulty: number; level: 1 | 2 | 3; type: string; sides: string; position: string; requires: string | null;
  zones: string[]; cue: string; steps: string[]; mistakes: string[]; lowCeiling: boolean; noise: string;
  mode: "reps" | "time"; amount: number; perSide: boolean; img: string | null;
};
export type Level = "Principiante" | "Intermedio" | "Avanzado";
export type Profile = {
  name: string; weights: number[]; level: Level; space: string[]; concerns: string[]; days: number;
  voice: boolean; setupDone: boolean; testWeight: number | null;
};
export type Section = "Calentamiento" | "Programa" | "Bloque principal" | "Cierre";
export type SessionItem = { section: Section; exercise: Exercise; sets?: number; reps?: number; note?: string };
export type Screen = "setup" | "fittest" | "today" | "preview" | "workout" | "summary" | "calendar" | "programs" | "progress" | "library" | "profile";
