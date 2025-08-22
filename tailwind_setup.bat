
@echo off
:: Tailwind Core Setup Batch Script

echo Installing TailwindCSS, PostCSS, and Autoprefixer...
npm install -D tailwindcss postcss autoprefixer

echo Initializing Tailwind config with PostCSS...
npx --yes tailwindcss init -p

echo Creating index.css with Tailwind directives...
echo @tailwind base; > src\index.css
echo @tailwind components; >> src\index.css
echo @tailwind utilities; >> src\index.css

echo Tailwind Core Setup Complete.
