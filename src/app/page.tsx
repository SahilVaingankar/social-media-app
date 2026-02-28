// import Image from "next/image";

// export default function Home() {
//   const user = { user: { email: "user@example.com" } }; // Replace with actual user data fetching logic
//   return (
//     <div className="inline">{user.user?.email ?? "User not logged in"}</div>
//   );
// }
"use client";
import Image from "next/image";
// import { auth } from "@/auth";
import { useEffect, useState } from "react";

interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  type: string;
  isAccountVerified: boolean;
}

export default function Home() {
  // const session = await auth();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/user");

      if (!res.ok) {
        console.error("Failed to fetch user");
        return;
      }

      const data = await res.json();
      setUser(data);
    }

    fetchUser();
  }, []);
  return (
    <div>
      {user?.email ?? "User not logged in"}
      <br />
      {user?.username ?? "No username"}
      <br />
      {user?.username ?? "No username"}
      <br />
      {user?.bio ?? "No bio"}
      <br />
      {user?.avatarUrl ? (
        <Image
          src={user.avatarUrl}
          alt="User avatar"
          width={100}
          height={100}
        />
      ) : (
        "No avatar"
      )}
    </div>
  );
}
