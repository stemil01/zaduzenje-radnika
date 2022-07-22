const packager = require('electron-packager');
const { rebuild } = require('electron-rebuild');

packager({
    dir: '.',
    overwrite: true,
    platform: 'win32',
    arch: 'ia32',
    prune: true,
    afterCopy: [(buildPath, electronVersion, platform, arch, callback) => {
    rebuild({ buildPath, electronVersion, arch })
      .then(() => callback())
      .catch((error) => callback(error));
  }],
});
