import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav
      style={{
        padding: "15px 30px",
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Link
        to="/"
        style={{
          textDecoration: "none",
          fontSize: "22px",
          fontWeight: "bold",
          color: "#111",
        }}
      >
        College Canteen
      </Link>

      <div
        style={{
          display: "flex",
          gap: "20px",
        }}
      >
        <Link to="/">Dashboard</Link>

        <Link to="/book">Book Meal</Link>

        <Link to="/bookings">My Bookings</Link>
      </div>
    </nav>
  );
}
