import { getAllApplications, testConnection } from "./queries";

async function test() {
  console.log("Testing connection...");
  const connected = await testConnection();
  console.log("Connection successful:", connected);

  if (connected) {
    console.log("\nFetching all applications...");
    const applications = await getAllApplications();
    console.log("Found applications:", applications);
  }
}

test().catch(console.error); 