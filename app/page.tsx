import { auth } from "@clerk/nextjs/server";
import Studio from "@/components/Studio";
import Landing from "@/components/Landing";

export default async function Home() {
  const { userId } = await auth();
  return userId ? <Studio /> : <Landing />;
}
