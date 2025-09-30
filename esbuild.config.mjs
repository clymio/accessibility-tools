import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

(async () => {
  const build = await esbuild.context({
    entryPoints: ['./src/electron/**/*'],
    splitting: false,
    sourcemap: false,
    treeShaking: true,
    outdir: 'build',
    external: ['electron', 'next', 'webpack', 'critters', 'pg-hstore'],
    format: 'cjs',
    bundle: true,
    platform: 'node',
    loader: { '.json': 'copy', '.svg': 'file' },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
    }
  });

  if (watch) {
    await build.watch();
    console.log('Watching for changes...');
  } else {
    await build.rebuild();
    console.log('Build completed.');
    process.exit(0);
  }
})();
