import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

export const checkIn = httpsCallable(functions, "checkIn");
export const commitSelectDay = httpsCallable(functions, "commitSelectDay");
export const commitSelectTime = httpsCallable(functions, "commitSelectTime");
export const done = httpsCallable(functions, "done");
export const transferRequestIfUnanswered = httpsCallable(functions, "transferRequestIfUnanswered");
