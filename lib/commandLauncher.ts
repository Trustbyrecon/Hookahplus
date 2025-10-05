import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

interface CommandResult {
  success: boolean;
  stdout?: string;
  stderr?: string;
  error?: string;
}

const commandLauncher = {
  "dev.start": async (args: any = {}) => {
    console.log("🚀 Starting development server...");
    try {
      const { stdout, stderr } = await execAsync('npm run dev');
      return { success: true, stdout, stderr };
    } catch (error) {
      console.error("Failed to start dev server:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  "admin.build": async (args: any = {}) => {
    console.log("🔨 Building project...");
    try {
      const { stdout, stderr } = await execAsync('npm run build');
      return { success: true, stdout, stderr };
    } catch (error) {
      console.error("Build failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  "admin.test": async (args: any = {}) => {
    console.log("🧪 Running tests...");
    try {
      const { stdout, stderr } = await execAsync('npm test');
      return { success: true, stdout, stderr };
    } catch (error) {
      console.error("Tests failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  "admin.lint": async (args: any = {}) => {
    console.log("🔍 Running linter...");
    try {
      const { stdout, stderr } = await execAsync('npm run lint');
      return { success: true, stdout, stderr };
    } catch (error) {
      console.error("Linting failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  "admin.clean": async (args: any = {}) => {
    console.log("🧹 Cleaning project...");
    try {
      const { stdout, stderr } = await execAsync('npm run clean');
      return { success: true, stdout, stderr };
    } catch (error) {
      console.error("Clean failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  "git.status": async (args: any = {}) => {
    console.log("📊 Checking git status...");
    try {
      const { stdout, stderr } = await execAsync('git status --porcelain');
      return { success: true, stdout, stderr };
    } catch (error) {
      console.error("Git status failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  "git.add": async (args: any = {}) => {
    console.log("➕ Adding files to git...");
    try {
      const { stdout, stderr } = await execAsync('git add .');
      return { success: true, stdout, stderr };
    } catch (error) {
      console.error("Git add failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  "git.commit": async (args: any = {}) => {
    const message = args.message || 'Auto-commit';
    console.log(`💾 Committing with message: ${message}`);
    try {
      const { stdout, stderr } = await execAsync(`git commit -m "${message}"`);
      return { success: true, stdout, stderr };
    } catch (error) {
      console.error("Git commit failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  "git.push": async (args: any = {}) => {
    console.log("🚀 Pushing to remote...");
    try {
      const { stdout, stderr } = await execAsync('git push');
      return { success: true, stdout, stderr };
    } catch (error) {
      console.error("Git push failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  "npm.install": async (args: any = {}) => {
    console.log("📦 Installing dependencies...");
    try {
      const { stdout, stderr } = await execAsync('npm install');
      return { success: true, stdout, stderr };
    } catch (error) {
      console.error("NPM install failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  "npm.update": async (args: any = {}) => {
    console.log("🔄 Updating dependencies...");
    try {
      const { stdout, stderr } = await execAsync('npm update');
      return { success: true, stdout, stderr };
    } catch (error) {
      console.error("NPM update failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  "npm.audit": async (args: any = {}) => {
    console.log("🔒 Running security audit...");
    try {
      const { stdout, stderr } = await execAsync('npm audit');
      return { success: true, stdout, stderr };
    } catch (error) {
      console.error("NPM audit failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  "deploy.vercel": async (args: any = {}) => {
    console.log("🚀 Deploying to Vercel...");
    try {
      const { stdout, stderr } = await execAsync('vercel --prod');
      return { success: true, stdout, stderr };
    } catch (error) {
      console.error("Vercel deployment failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  "deploy.netlify": async (args: any = {}) => {
    console.log("🌐 Deploying to Netlify...");
    try {
      const { stdout, stderr } = await execAsync('netlify deploy --prod');
      return { success: true, stdout, stderr };
    } catch (error) {
      console.error("Netlify deployment failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  "db.migrate": async (args: any = {}) => {
    console.log("🗄️ Running database migrations...");
    try {
      const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
      return { success: true, stdout, stderr };
    } catch (error) {
      console.error("Database migration failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  "db.seed": async (args: any = {}) => {
    console.log("🌱 Seeding database...");
    try {
      const { stdout, stderr } = await execAsync('npx prisma db seed');
      return { success: true, stdout, stderr };
    } catch (error) {
      console.error("Database seeding failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  },

  "db.reset": async (args: any = {}) => {
    console.log("🔄 Resetting database...");
    try {
      const { stdout, stderr } = await execAsync('npx prisma migrate reset --force');
      return { success: true, stdout, stderr };
    } catch (error) {
      console.error("Database reset failed:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
};

export default commandLauncher;