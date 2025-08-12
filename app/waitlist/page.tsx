export default function Page() {
      return (
        <main className="max-w-3xl mx-auto px-6 py-12">
          <h1 className="text-3xl mb-4">Hookah+ Waitlist</h1>
          <p className="opacity-80 mb-6">Placeholder for /waitlist (L+4 scaffolding). Replace with real content.</p>
          <form name="waitlist" method="POST" data-netlify="true" className="grid gap-3 max-w-md">
  <input type="hidden" name="form-name" value="waitlist" />
  <input name="name" placeholder="Name" className="px-3 py-2 rounded" required />
  <input type="email" name="email" placeholder="Email" className="px-3 py-2 rounded" required />
  <input name="company" placeholder="Lounge / Company" className="px-3 py-2 rounded" />
  <button type="submit" className="px-4 py-2 rounded-xl shadow">Join Waitlist</button>
</form>
        </main>
      );
    }
