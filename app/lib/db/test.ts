import { getAllApplications, testConnection } from "./queries";

async function test() {
  console.log("Testing connection...");
  const connected = await testConnection();
  console.log("Connection successful:", connected);

  if (connected) {
    console.log("\nFetching all applications...");
    const participantApplications = await getAllApplications("participant");
    const judgeApplications = await getAllApplications("judge");
    console.log("Found participant applications:", participantApplications);
    console.log("Found judge applications:", judgeApplications);
  }
}

test().catch(console.error);
