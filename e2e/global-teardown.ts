import { clearLearningItems } from "./helpers/db-cleanup";

async function globalTeardown() {
  try {
    console.log("Cleaning up learning_items table...");
    await clearLearningItems();
    console.log("Successfully cleaned up learning_items table");
  } catch (error) {
    console.error("Failed to clean up database:", error);
    throw error;
  }
}

export default globalTeardown;
