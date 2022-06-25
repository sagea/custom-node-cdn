import * as path from "https://deno.land/std@0.57.0/path/mod.ts";

type ShellExecOptions = Partial<Pick<Deno.RunOptions, 'cwd' | 'env' | 'stdin'>>;

const statSafe = async (loc: string) => {
  try {
    const result = await Deno.stat(loc);
    return [null, result] as const;
  } catch(err) {
    return [err, null] as const;
  }
}
export class Shell {
  cwd: string = path.dirname(path.fromFileUrl(import.meta.url));
  async cd(change: string) {
    const nextCwd = path.join(this.cwd, change);
    const [err, fileInfo] = await statSafe(nextCwd);
    if (!fileInfo) {
      if (err && err.kind === Deno.errors.NotFound) {
        throw new Error('Folder not found');
      }
      throw err;
    }
    if (!fileInfo.isDirectory) {
      throw new Error('File or symlink is not a directory');
    }
    this.cwd = nextCwd;
    return true;
  }
  async cp(filename: string, outfile: string) {
    const entry = path.join(this.cwd, filename);
    const out = path.join(this.cwd, outfile);
    await this.e(`Copying ${filename} to ${outfile}`, `cp ${entry} ${out}`)
  }
  async mkdir(dirname: string) {
    await this.esafe(`Creating directory`, `mkdir ${dirname}`);
  }
  async writeFile(filename: string, contents: string, options?: Deno.WriteFileOptions) {
    const fileLoc = path.join(this.cwd, filename);
    console.log(`Writing file ${fileLoc}`);
    const t = new TextEncoder().encode(contents);
    await Deno.writeFile(fileLoc, t, options);
  }
  async e(step: string, command: string, options: ShellExecOptions = {}) {
    console.log('⏳ Running:', step);
    try {
      const p = Deno.run({
        cwd: this.cwd,
        cmd: ['/bin/sh', '-c', command],
        stderr: 'piped',
        stdout: 'piped',
        // stdout: 'piped',
        ...options
      });
      
      let response = "";
      let errResponse = "";
      const decoder = new TextDecoder();
      const buff = new Uint8Array(1);
      const buffErr = new Uint8Array(1);
      while (true) {
        let res;
        let errResult;
        let emptyC = 0;
        let errorC = 0;
        try {
          errResult = await p.stderr?.read(buffErr)
          if (errResult) {
            response = response + decoder.decode(buffErr);
            await Deno.stderr.write(buffErr);
          } else {
            emptyC++;
          }
        } catch (err) {
          errorC++;
        }
        try {
          res = await p.stdout?.read(buff);
          if (res) {
            response = response + decoder.decode(buff);
            await Deno.stdout.write(buff);
          } else {
            emptyC++;
          }
        } catch (err) {
          errorC++;
        }
        if (errorC === 2 || emptyC === 2) {
          break;
        }
      }

      const status = await p.status();
      p.stdout?.close();
      p.stderr?.close();
      p.close();
      if (status.success) {
        console.log('✅ Success:', step)
        return response;
      }
      throw errResponse;
    } catch (err) {
      console.log('❌ Error:', step, err);
      throw err;
    }
  }
  async esafe(step: string, command: string, options: ShellExecOptions = {}) {
    try {
      const result = await this.e(step, command, options);
      return [null, result]
    } catch (err) {
      return [err, null];
    }
  }
}
