/**
 * Optional dependency: only needed when PDF generation is used (e.g. staff playbook).
 * Not installed on Vercel; runtime handles missing module.
 */
declare module "puppeteer" {
  const p: any;
  export default p;
}
