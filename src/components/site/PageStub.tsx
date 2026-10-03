export function PageStub({ title, note }: { title: string; note: string }) {
  return (
    <section className="bg-light-grey">
      <div className="mx-auto max-w-7xl px-5 py-24">
        <h1 className="text-h1 text-deep-blue">{title}</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">{note}</p>
      </div>
    </section>
  );
}
