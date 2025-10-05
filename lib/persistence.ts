// Mock persistence layer for client-side compatibility
// In a real app, this would use proper file system operations

export interface PersistenceData {
  [key: string]: any;
}

const mockStorage: Map<string, PersistenceData> = new Map();

export const readFile = async (filePath: string): Promise<string> => {
  // Mock file reading
  const data = mockStorage.get(filePath);
  return data ? JSON.stringify(data) : '{}';
};

export const writeFile = async (filePath: string, data: string): Promise<void> => {
  // Mock file writing
  try {
    const parsedData = JSON.parse(data);
    mockStorage.set(filePath, parsedData);
  } catch {
    mockStorage.set(filePath, { content: data });
  }
};

export const exists = async (filePath: string): Promise<boolean> => {
  return mockStorage.has(filePath);
};

export const mkdir = async (dirPath: string): Promise<void> => {
  // Mock directory creation
  mockStorage.set(dirPath, {});
};

export const readdir = async (dirPath: string): Promise<string[]> => {
  // Mock directory reading
  const files: string[] = [];
  for (const [key] of mockStorage) {
    if (key.startsWith(dirPath)) {
      files.push(key);
    }
  }
  return files;
};

export const unlink = async (filePath: string): Promise<void> => {
  mockStorage.delete(filePath);
};

export const rmdir = async (dirPath: string): Promise<void> => {
  // Remove all files in directory
  for (const [key] of mockStorage) {
    if (key.startsWith(dirPath)) {
      mockStorage.delete(key);
    }
  }
};

export const loadState = async (filePath: string): Promise<any> => {
  const data = await readFile(filePath);
  try {
    return JSON.parse(data);
  } catch {
    return {};
  }
};

export const saveState = async (filePath: string, state: any): Promise<void> => {
  const data = JSON.stringify(state, null, 2);
  await writeFile(filePath, data);
};

export const hydrateDates = (data: any): any => {
  // Recursively convert date strings back to Date objects
  if (Array.isArray(data)) {
    return data.map(item => hydrateDates(item));
  } else if (data && typeof data === 'object') {
    const hydrated: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        hydrated[key] = new Date(value);
      } else {
        hydrated[key] = hydrateDates(value);
      }
    }
    return hydrated;
  }
  return data;
};