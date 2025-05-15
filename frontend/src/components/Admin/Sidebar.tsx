import { Link } from "react-router-dom";

const Sidebar = () => (
  <nav>
    <ul>
      <li><Link to="/admin">Dashboard</Link></li>
      <li><Link to="/admin/users">Users</Link></li>
      <li><Link to="/admin/settings">Settings</Link></li>
    </ul>
  </nav>
);

export default Sidebar;
