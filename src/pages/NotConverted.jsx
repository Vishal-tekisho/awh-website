import { useSearchParams, Link } from "react-router-dom";

export default function NotConverted() {
  const [params] = useSearchParams();
  const from = params.get("from");

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Inter, system-ui, sans-serif",
      background: "#f4f6f8",
      color: "#374151",
      textAlign: "center",
      padding: 24,
    }}>
      <h1 style={{ fontSize: 20, marginBottom: 8 }}>Page not yet available</h1>
      <p style={{ fontSize: 14, maxWidth: 420 }}>
        {from ? <>The page <b>{from}</b></> : "This page"} was referenced in the
        original design but no matching HTML/CSS/JS source exists in this project yet,
        so it hasn't been converted to React.
      </p>
      <Link to="/admin-dashboard" style={{ color: "#16a34a", marginTop: 16 }}>
        &larr; Back to Admin Dashboard
      </Link>
    </div>
  );
}
