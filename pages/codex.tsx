import CodexRenderer from '../components/CodexRenderer';
import ReflexEventToCard from '../components/ReflexEventToCard';
import '../styles/codex.css';

export default function CodexPage() {
  return (
    <div className="codex-page">
      <section>
        <h1 className="codex-heading">Today's Codex Entry</h1>
        <CodexRenderer limit={1} />
      </section>
      <section>
        <h2 className="codex-heading">Recent Activations</h2>
        <div className="codex-scroll">
          <CodexRenderer offset={1} limit={15} />
          <ReflexEventToCard />
        </div>
      </section>
      <div className="codex-cta">
        Want to see what built this system? <span className="codex-link">View the Codex.</span>
      </div>
    </div>
  );
}
