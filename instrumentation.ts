export async function register() {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return;
  }
  if (process.env.npm_lifecycle_event === "build") {
    return;
  }
  const { runtimeSecretsProblem } = await import("@/lib/kratos/config");
  const problem = runtimeSecretsProblem();
  if (problem) {
    console.error(problem);
    throw new Error(problem);
  }
}
