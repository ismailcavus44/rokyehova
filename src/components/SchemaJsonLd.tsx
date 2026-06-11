type Props = {
  graph: Record<string, unknown>[];
};

export function SchemaJsonLd({ graph }: Props) {
  if (graph.length === 0) {
    return null;
  }

  const schema = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
