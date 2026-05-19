import dotenv from "dotenv";

dotenv.config();

const requiredEnv = ["DATABASE_URL", "JWT_SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(
    `Missing required environment variable${missingEnv.length > 1 ? "s" : ""}: ${missingEnv.join(", ")}`
  );
  console.error("Create or update .env before starting the server.");
  process.exit(1);
}

try {
  const databaseUrl = new URL(process.env.DATABASE_URL);

  if (!databaseUrl.protocol.startsWith("postgres")) {
    console.warn("DATABASE_URL does not look like a PostgreSQL connection string.");
  }
} catch {
  console.error("DATABASE_URL is not a valid URL.");
  process.exit(1);
}

const { default: app } = await import("./app.js");
const { default: prisma } = await import("./config/prisma.js");

try {
  await prisma.$connect();
  console.log("Database connection established.");
} catch (error) {
  console.error("Database connection failed. Check DATABASE_URL and PostgreSQL service.");
  console.error(error);
  process.exit(1);
}

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`BORO KULTURE API running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error(`Failed to start BORO KULTURE API on port ${PORT}`);
  console.error(error.message);
  process.exit(1);
});
