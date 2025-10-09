import { useEffect, useState } from "react";

export default function TestApiConnection() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8080/api/eavs/states?electionYear=2024")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">API Connection Test</h2>
      <p>Received {data.length} entries.</p>
      <ul className="list-disc pl-6">
        {data.slice(0, 5).map((item, i) => (
          <li key={i}>{item.stateFull || "(no name)"}</li>
        ))}
      </ul>
    </div>
  );
}
