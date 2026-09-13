import type { NextConfig } from "next";
import { RENAMED_SET_IDS } from "./lib/renamedSets";

const nextConfig: NextConfig = {
  /** The sets' old routes (ticket 208): `/teacher/a/pset-2/mistakes?…` lands on `/teacher/a/pset-6/mistakes?…`. Not permanent: it is a demo, and a cached 308 would outlive any later rename. */
  async redirects() {
    return Object.entries(RENAMED_SET_IDS).flatMap(([from, to]) => [
      { source: `/teacher/a/${from}`, destination: `/teacher/a/${to}`, permanent: false },
      { source: `/teacher/a/${from}/:path*`, destination: `/teacher/a/${to}/:path*`, permanent: false },
    ]);
  },
};

export default nextConfig;
