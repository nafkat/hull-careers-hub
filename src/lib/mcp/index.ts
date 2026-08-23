import { defineMcp } from "@lovable.dev/mcp-js";
import listOpenJobsTool from "./tools/list-open-jobs";
import getJobTool from "./tools/get-job";

export default defineMcp({
  name: "hull-careers-hub",
  title: "Hull Careers Hub",
  version: "0.1.0",
  instructions:
    "Public careers tools for EUROHULL Shipyards. Use `list_open_jobs` to browse active openings and `get_job` to read one listing in full. Only publicly advertised job data is exposed; applications and admin data are not available.",
  tools: [listOpenJobsTool, getJobTool],
});
