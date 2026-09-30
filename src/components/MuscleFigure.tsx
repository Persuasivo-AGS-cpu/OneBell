// Silueta de frente y espalda (del prototipo de Lovable), con zonas iluminadas según los grupos trabajados.
export function MuscleFigure({ back, groups }: { back: boolean; groups: Set<string> }) {
  const on = (g: string) => (groups.has(g) ? 0.95 : 0.12);
  return (
    <figure className="text-center">
      <svg width="102" height="174" viewBox="0 0 102 174" role="img" aria-label={back ? "Vista de espalda" : "Vista de frente"} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" className="text-muted-foreground">
        <circle cx="51" cy="14" r="11" />
        <path d="M43 25v7l-12 4-10 29 7 4 10-24 4 9-4 35 7 2-2 37-5 37 12 2 6-43 4-27 4 27 6 43 12-2-5-37-2-37 7-2-4-35 4-9 10 24 7-4-10-29-12-4v-7" />
        {back
          ? <path fill="var(--primary)" stroke="none" opacity={on("Espalda")} d="M36 38 45 34h12l9 4-3 27-12 8-12-8z" />
          : <path fill="var(--primary)" stroke="none" opacity={Math.max(on("Core"), on("Pecho"))} d="M43 53h16l4 26-12 7-12-7z" />}
        <path fill="var(--primary)" stroke="none" opacity={Math.max(on("Hombros"), on("Brazos"))} d="M32 40 39 36l-2 19-8 12-5-3zM70 40l-7-4 2 19 8 12 5-3z" />
        <path fill="var(--primary)" stroke="none" opacity={Math.max(on("Piernas"), back ? on("Glúteos") : 0)} d="M40 93l12 3-4 29-5 37-9-2 5-39zM62 93l-12 3 4 29 5 37 9-2-5-39z" />
      </svg>
      <figcaption className="mt-2 text-sm font-semibold text-muted-foreground">{back ? "Espalda" : "Frente"}</figcaption>
    </figure>
  );
}
