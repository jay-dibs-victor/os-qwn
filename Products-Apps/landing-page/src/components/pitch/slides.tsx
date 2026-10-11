import type { ComponentType } from "react";
import type { SlideProps } from "./primitives";

import { Slide01Cover, Slide02Summary, Slide03Problem, Slide04ProblemDeep, Slide05Market } from "./slides-a";
import { Slide06WhyNow, Slide07MegacityStressTest, Slide08Solution, Slide09Architecture, Slide10AI } from "./slides-b";
import { Slide11BizModel, Slide12GTM, Slide13Traction, Slide14Competition, Slide15Team } from "./slides-c";
import { Slide16Financials, Slide17UnitEcon, Slide18UseOfFunds, Slide19TheAsk, Slide20Vision } from "./slides-d";

export interface SlideDef {
  title: string;
  component: ComponentType<SlideProps>;
}

export const slides: SlideDef[] = [
  { title: "Queens OS",               component: Slide01Cover },
  { title: "Executive Summary",       component: Slide02Summary },
  { title: "The Problem",             component: Slide03Problem },
  { title: "Problem Deep-Dive",       component: Slide04ProblemDeep },
  { title: "Market Opportunity",      component: Slide05Market },
  { title: "Why Now",                 component: Slide06WhyNow },
  { title: "The Megacity Stress-Test", component: Slide07MegacityStressTest },
  { title: "The Solution",            component: Slide08Solution },
  { title: "Product Architecture",    component: Slide09Architecture },
  { title: "AI Infrastructure",       component: Slide10AI },
  { title: "Business Model",          component: Slide11BizModel },
  { title: "Go-to-Market",           component: Slide12GTM },
  { title: "Traction & Milestones",   component: Slide13Traction },
  { title: "Competitive Landscape",   component: Slide14Competition },
  { title: "The Team",               component: Slide15Team },
  { title: "Financial Projections",   component: Slide16Financials },
  { title: "Unit Economics",         component: Slide17UnitEcon },
  { title: "Use of Funds",           component: Slide18UseOfFunds },
  { title: "The Ask",                component: Slide19TheAsk },
  { title: "Vision & Close",         component: Slide20Vision },
];
