import Chassis from "../api/app";
import GenericAPIPlugin from "./plugins/generic";
import HardenAPIsPlugin from "./plugins/harden";

const app = new Chassis();
if (!app.ctx) throw new Error("app not configured");

// register plugins

app.install(new GenericAPIPlugin());
app.install(new HardenAPIsPlugin());

app.start();
