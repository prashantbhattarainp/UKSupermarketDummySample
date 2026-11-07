export function createHealthService(database = null) {
  return {
    async getHealthStatus() {
      const databaseState =
        database && typeof database.getStatus === "function"
          ? database.getStatus()
          : "disconnected";

      return {
        data: {
          application: "running",
          database: databaseState,
          environment: process.env.NODE_ENV ?? "development",
          timestamp: new Date().toISOString(),
        },
        meta: {},
        error: null,
      };
    },
  };
}
