"use client";

import { useReducer } from "react";
import IpadStage from "@/components/IpadStage";
import StudentChrome from "./StudentChrome";
import OverviewScreen from "./screens/OverviewScreen";
import PracticeScreen from "./screens/PracticeScreen";
import ConfidenceScreen from "./screens/ConfidenceScreen";
import WorkingScreen from "./screens/WorkingScreen";
import { sessionAt, sessionReducer } from "@/lib/session";
import { ASSIGNMENT } from "@/data/assignment";
import type { Stage } from "@/data/types";

const CRUMB: Partial<Record<Stage, string>> = {
  practice: "Warm-up",
  confidence: "Before you start",
  working: ASSIGNMENT.title,
};

/** The whole student side: one client component, one reducer, one screen per stage. */
export default function StudentApp({ initStage }: { initStage: Stage }) {
  const [session, dispatch] = useReducer(sessionReducer, initStage, sessionAt);
  return (
    <IpadStage>
      <StudentChrome crumb={CRUMB[session.stage] ?? ASSIGNMENT.className}>
        {session.stage === "overview" && (
          <OverviewScreen onPractice={() => dispatch({ type: "practice/accept" })} onStart={() => dispatch({ type: "practice/decline" })} />
        )}
        {session.stage === "practice" && <PracticeScreen onDone={() => dispatch({ type: "practice/finish" })} />}
        {session.stage === "confidence" && (
          <ConfidenceScreen practice={session.practice} onSubmit={(confidence) => dispatch({ type: "confidence/set", confidence })} />
        )}
        {session.stage === "working" && <WorkingScreen session={session} />}
      </StudentChrome>
    </IpadStage>
  );
}
