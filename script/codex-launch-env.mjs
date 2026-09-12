// Shell Node.js settings must not leak into the packaged Electron runtime.
export function codexLaunchEnv(source = process.env) {
  const env = { ...source };
  delete env.NODE_OPTIONS;
  delete env.NODE_PATH;
  delete env.ELECTRON_RUN_AS_NODE;
  return env;
}
