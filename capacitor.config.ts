import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'org.bluerack.todo',
  appName: '두비두비',
  webDir: 'public',
  server: {
    url: 'https://todo.bluerack.org/',
  },
}

export default config
