import { Page, test, expect } from '@playwright/test';
import { z } from 'zod';
import { click, fill, select, waitFor, navigate, screenshot } from './skills';
import { softContains, expectUrlIncludes } from './assertions';

// Step schema allows a testplan to drive actions declaratively
export const StepSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('navigate'), url: z.string() }),
  z.object({ action: z.literal('click'), selector: z.string(), description: z.string().optional() }),
  z.object({ action: z.literal('fill'), selector: z.string(), value: z.string() }),
  z.object({ action: z.literal('select'), selector: z.string(), value: z.string() }),
  z.object({ action: z.literal('waitFor'), selector: z.string(), state: z.enum(['visible','hidden','attached','detached']).default('visible'), timeout: z.number().optional() }),
  z.object({ action: z.literal('assertUrl'), includes: z.string() }),
  z.object({ action: z.literal('assertText'), selector: z.string(), includes: z.string() }),
  z.object({ action: z.literal('screenshot'), name: z.string().default('step') }),
]);
export type Step = z.infer<typeof StepSchema>;

export const PlanSchema = z.object({
  name: z.string(),
  description: z.string(),
  steps: z.array(StepSchema),
});
export type Plan = z.infer<typeof PlanSchema>;

export class Agent {
  constructor(private page: Page, private plan: Plan) {}

  async run() {
    for (let i = 0; i < this.plan.steps.length; i++) {
      const step = this.plan.steps[i];
      console.log(`Step ${i + 1}: ${step.action}`);
      switch (step.action) {
        case 'navigate': await navigate(this.page, step.url); break;
        case 'click': await click(this.page, step.selector, step.description); break;
        case 'fill': await fill(this.page, step.selector, step.value); break;
        case 'select': await select(this.page, step.selector, step.value); break;
        case 'waitFor': await waitFor(this.page, step.selector, step.state, step.timeout); break;
        case 'assertUrl': await expectUrlIncludes(this.page, step.includes); break;
        case 'assertText': await softContains(this.page, step.selector, step.includes); break;
        case 'screenshot': await screenshot(this.page, step.name); break;
      }
    }
  }
}
