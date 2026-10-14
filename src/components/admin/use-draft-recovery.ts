"use client";
import {useEffect,useRef,useState} from "react";
import type {BlogPostInput} from "@/lib/blog-types";
import {adminApi} from "./api";
type Recovery={post:BlogPostInput;baseVersion:number;generation:number;updatedAt:string};
export function useDraftRecovery({id,post,version,dirty,loading,busy}:{id?:string;post:BlogPostInput;version:number;dirty:boolean;loading:boolean;busy:boolean}){
  const key=useRef(""),generation=useRef(0),pending=useRef<Promise<unknown>|null>(null),suspended=useRef(false);
  const [candidate,setCandidate]=useState<Recovery|null>(null),[status,setStatus]=useState("Draft recovery is idle.");
  useEffect(()=>{if(loading)return;let active=true;const slot=`havenfield:recovery:${id||"new"}`;const stored=sessionStorage.getItem(slot);key.current=stored||crypto.randomUUID();sessionStorage.setItem(slot,key.current);adminApi<{recovery:Recovery|null}>(`/api/admin/autosaves/${key.current}`).then(result=>{if(!active)return;generation.current=result.recovery?.generation||0;setCandidate(result.recovery);}).catch(()=>{if(active)setStatus("Recovery check failed. Your writing remains in this tab.");});return()=>{active=false;};},[id,loading]);
  useEffect(()=>{if(loading||busy||!dirty||candidate||post.status!=="draft")return;let active=true;const timer=setTimeout(()=>{if(!key.current||suspended.current)return;setStatus("Saving recovery draft…");const request=adminApi(`/api/admin/autosaves/${key.current}`,{method:"PUT",body:JSON.stringify({key:key.current,postId:id||null,baseVersion:version,generation:++generation.current,post})});pending.current=request;request.then(()=>{if(active)setStatus("Recovery draft saved. The article still needs an explicit save.");}).catch(()=>{if(active)setStatus("Recovery save failed. Keep this tab open; sign in again if your session expired.");}).finally(()=>{if(pending.current===request)pending.current=null;});},1500);return()=>{active=false;clearTimeout(timer);};},[post,version,dirty,id,loading,busy,candidate]);
  async function discard(){suspended.current=true;try{await pending.current?.catch(()=>undefined);if(key.current)await adminApi(`/api/admin/autosaves/${key.current}`,{method:"DELETE"});setCandidate(null);setStatus("Recovery draft cleared.");}finally{suspended.current=false;}}
  function recover(){if(!candidate)return null;if(candidate.baseVersion!==version){setStatus("Recovery was based on an older article. Copy it below and merge your writing manually.");return null;}const result=candidate.post;setCandidate(null);setStatus("Recovery loaded into the editor. Review and explicitly save it.");return result;}
  return {candidate,status,discard,recover};
}
