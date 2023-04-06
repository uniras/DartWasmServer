export async function filebaseInit() {
  let fs;
  let isDeno;

  if (typeof globalThis.Deno !== "undefined") {
    fs = Deno;
    isDeno = true;
  } else {
    fs = await import('fs');
    isDeno = false;
  }

  return {
    writeFile: async (path, data) => {
      if (fs === null) return;
      fs.writeFile(path, data);
    },

    readFile: async (path, encoding = '') => {
      if (fs === null) return '';
      if (encoding === '') {
        return await fs.readFile(path);
      } else {
        if (isDeno) {
          const data = await fs.readFile(path);
          const decoder = new TextDecoder(encoding);
          return decoder.decode(data);
        } else {
          return await fs.readFile(path, { encoding: encoding });
        }
      }
    },

    copyFile: async (src, dest) => {
      if (fs === null) return;
      if (isDeno) {
        const data = await fs.readFile(src);
        await fs.writeFile(dest, data);
      } else {
        await fs.copyFile(src, dest);
      }
    },

    removeFile: async (path) => {
      if (fs === null) return;
      if (isDeno) {
        await fs.remove(path);
      } else {
        await fs.unlink(path);
      }
    },

    existFile: async (path) => {
      if (fs === null) return false;
      if (isDeno) {
        try {
          await fs.stat(path);
          return true;
        } catch (error) {
          return false;
        }
      } else {
        try {
          await fs.access(path);
          return true;
        } catch (error) {
          return false;
        }
      }
    }
  };
}