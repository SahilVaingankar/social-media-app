import Image from "next/image";

export default function Home() {
  const user = { user: { email: "user@example.com" } }; // Replace with actual user data fetching logic
  return (
    <div className="inline">{user.user?.email ?? "User not logged in"}</div>
  );
}
