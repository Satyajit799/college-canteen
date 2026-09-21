import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        College Canteen
      </Link>

      <div className="navbar-links">
        <Link to="/">Dashboard</Link>
        <Link to="/book">Book Meal</Link>
        <Link to="/bookings">My Bookings</Link>
      </div>
    </nav>
  );
}