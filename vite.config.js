import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
export default defineConfig({
    server: {
        host: true,
        port: 5173
    },
    preview: {
        host: true,
        port: 5173
    },
    resolve: {
        alias: (() => {
            const root = fileURLToPath(new URL('.', import.meta.url));
            return {
                '@': path.resolve(root, 'src'),
                '@config': path.resolve(root, 'config')
            };
        })()
    },
    build: {
        target: 'es2020',
        sourcemap: true
    }
});
