"use client";
import { useAppSelector } from "@/store/hook";
import { RootState } from "@/store/store";

export default function Home() {
  const user = useAppSelector((state: RootState) => state.auth);
  console.log(user);

  return <div className="inline">{user.user?.email}</div>;
}
