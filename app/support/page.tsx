export default function Page() {
      return (
        <main className="max-w-3xl mx-auto px-6 py-12">
          <h1 className="text-3xl mb-4">Hookah+ Support</h1>
          <p className="opacity-80 mb-6">Placeholder for /support (L+4 scaffolding). Replace with real content.</p>
          <form name="support" method="POST" data-netlify="true" className="grid gap-3 max-w-md">
  <input type="hidden" name="form-name" value="support" />
  <input name="email" type="email" placeholder="Email" className="px-3 py-2 rounded" required />
  <textarea name="message" placeholder="How can we help?" className="px-3 py-2 rounded min-h-[140px]" required></textarea>
  <button type="submit" className="px-4 py-2 rounded-xl shadow">Send</button>
</form>
        </main>
      );
    }
