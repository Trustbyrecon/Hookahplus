#!/bin/bash

# Exit on first error
set -e

echo "== HookahPlus auto-fix starting =="

# 1️⃣ Ensure public directory exists
mkdir -p public

# 2️⃣ Convert logo to favicon.ico (requires ImageMagick)
if [ -f "Hookplus logo.png" ]; then
  echo "Converting HookahPlus logo to favicon.ico..."
  convert "Hookplus logo.png" -resize 32x32 public/favicon.ico
else
  echo "Hookplus logo.png not found, skipping favicon conversion."
fi

# 3️⃣ Create app/globals.css with Tailwind base styles
mkdir -p app
cat > app/globals.css <<EOL
@tailwind base;
@tailwind components;
@tailwind utilities;

/* HookahPlus Brand Base Styles */
html,
body {
  margin: 0;
  padding: 0;
  background-color: black;
  color: white;
  font-family: sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

* {
  box-sizing: border-box;
}
EOL
echo "Created app/globals.css"

# 4️⃣ Fix layout.tsx to have proper HTML root & metadataBase
LAYOUT_FILE="app/layout.tsx"
if [ -f "$LAYOUT_FILE" ]; then
  cat > "$LAYOUT_FILE" <<'EOL'
import './globals.css';

export const metadata = {
  metadataBase: new URL('https://hookahplus.net'),
  title: 'HookahPlus',
  description: 'The lounge operator stack built for revenue & reliability.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
EOL
  echo "Updated $LAYOUT_FILE"
else
  echo "$LAYOUT_FILE not found. Skipping layout.tsx update."
fi

# 5️⃣ Commit and push changes
git add app/globals.css public/favicon.ico app/layout.tsx
git commit -m "Fix globals.css missing, layout.tsx HTML root, add favicon, set metadataBase"
git push origin main

echo "== HookahPlus auto-fix complete =="
