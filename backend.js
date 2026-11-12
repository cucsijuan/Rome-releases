// The viewer's data from the simulation running here, in WebAssembly (the desktop viewer's backend.js asks a server).
import { dotnet } from "./_framework/dotnet.js";

const { getAssemblyExports, getConfig } = await dotnet.create();
const sim = (await getAssemblyExports(getConfig().mainAssemblyName)).Rome.Viewer.Program;
const seed = Number(new URLSearchParams(location.search).get("seed") || 1);
const map = JSON.parse(sim.Start(seed));

// One thread: the simulation runs a frame on each of the page's frames, with a budget that leaves time to draw.
let last = performance.now();
function frame(now) {
  sim.Frame((now - last) / 1000, 10);
  last = now;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

export const api = {
  live: true,
  map: async () => map,
  state: async () => JSON.parse(sim.State()),
  agent: async id => JSON.parse(sim.Agent(id)),
  building: async id => JSON.parse(sim.Building(id)),
  speed: async x => JSON.parse(sim.Speed(x)),
};
