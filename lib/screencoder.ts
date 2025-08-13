import yaml from 'js-yaml';
import fs from 'fs';

export function loadScreencoderConfig() {
  try {
    return yaml.load(
      fs.readFileSync('./config/screencoder_config.yaml', 'utf8')
    );
  } catch (err) {
    console.error('Failed to load Screencoder config:', err);
    return {};
  }
}
