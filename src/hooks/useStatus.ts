import { useEffect, useState } from "react";
import type { DashboardState, DemoState } from "../types";
import { getMockServices } from "../data/mockServices";
import { loadStatus } from "../data/statusApi";
const DEMO = import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE === "true";
export function useStatus(demo:DemoState) {
  const [state,setState]=useState<DashboardState>({kind:"loading"});
  const [revision,setRevision]=useState(0);
  const [refreshAt,setRefreshAt]=useState(0);
  const [now,setNow]=useState(Date.now);
  useEffect(()=>{
    const controller=new AbortController();
    setState({kind:"loading"});
    async function run() {
      try {
        if(DEMO) {
          if(demo==="loading")return;
          if(demo==="error")throw new Error("demo");
          if(!controller.signal.aborted)setState({kind:"ready",services:demo==="empty"?[]:getMockServices(),checkedAt:new Date().toISOString()});
        } else {
          const data=await loadStatus(controller.signal);
          if(controller.signal.aborted)return;
          setState({kind:"ready",services:data.services,checkedAt:data.checkedAt});
          setRefreshAt(Date.now()+60000);setNow(Date.now());
        }
      } catch {
        if(!controller.signal.aborted) {setState({kind:"error",message:DEMO?"This is a simulated connection error.":"The status API is unavailable or returned invalid data. Please try again."});setRefreshAt(0);}
      }
    }
    void run();return()=>controller.abort();
  },[demo,revision]);
  useEffect(()=>{if(refreshAt<=Date.now())return;const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[refreshAt]);
  const remaining=DEMO?0:Math.max(0,Math.ceil((refreshAt-now)/1000));
  return {state,isDemo:DEMO,remaining,refresh:()=>{if(remaining===0)setRevision(r=>r+1);}};
}
