import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.resolve('./app_config.json');

export interface AppConfig {
  mediaRoot: string | null;
}

const defaultConfig: AppConfig = {
  mediaRoot: null,
};

export function getConfig(): AppConfig {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return defaultConfig;
    }
  }
  return defaultConfig;
}

export function saveConfig(config: AppConfig) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}
