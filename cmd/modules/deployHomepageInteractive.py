from pathlib import Path


def run():
    homepage_content = """
    import React from 'react';

    export default function Home() {
        return (
            <main style={{ padding: '2rem' }}>
                <h1>Welcome to Hookah+</h1>
                <p>Your command center for flavor, flow, and loyalty intelligence.</p>
                <div style={{ marginTop: '1rem' }}>
                    <a href="/onboarding">Start Onboarding</a> | 
                    <a href="/demo"> See a Demo</a> | 
                    <a href="/live"> Join Live Session</a>
                </div>
            </main>
        );
    }
    """

    target_path = Path("app/page.tsx")
    target_path.parent.mkdir(parents=True, exist_ok=True)
    target_path.write_text(homepage_content.strip())

    return "✅ Hookah+ interactive homepage deployed to app/page.tsx"
