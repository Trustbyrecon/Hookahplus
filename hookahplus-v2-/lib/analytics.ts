export const track = (name: string, data?: any) => {
  if (typeof window === "undefined") return;
  
  (window as any).gtag?.("event", name, data);
  (window as any).plausible?.(name, { props: data });
};
