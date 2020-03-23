/**
 * 封装QQ小游戏的文件系统
 */
const qqFs = qq.getFileSystemManager();
const QQ_ROOT = qq.env.USER_DATA_PATH + "/";

function walkFile(dirname, callback) {
    const files = qqFs.readdirSync(dirname)
    for (let f of files) {
        const file = dirname + "/" + f;
        const stat = qqFs.statSync(file);
        if (stat.isDirectory()) {
            walkFile(file, callback);
        } else {
            callback(file)
        }
    }
}


function walkDir(dirname, callback) {
    const files = qqFs.readdirSync(dirname)
    for (let f of files) {
        const file = dirname + "/" + f;
        const stat = qqFs.statSync(file);
        if (stat.isDirectory()) {
            walkDir(file, callback);
            callback(file)
        }
    }
}

let fs_cache = {};

export const fs = {

    /**
     * 遍历删除文件夹
     */
    remove: (dirname) => {
        if (!fs.existsSync(dirname))
            return;
        const globalDirname = QQ_ROOT + dirname;
        walkFile(globalDirname, (file) => {
            qqFs.unlinkSync(file);
            let p = file.replace(QQ_ROOT, "");
            p = path.normailze(p);
            if (fs_cache[p]) {
                fs_cache[p] = 0;
            }
        })
        walkDir(globalDirname, (dir) => {
            qqFs.rmdirSync(dir);
            let p = dir.replace(QQ_ROOT, "");
            p = path.normailze(p);
            if (fs_cache[p]) {
                fs_cache[p] = 0;
            }
        })
    },

    /**
     * 检查文件是否存在
     */
    existsSync: (p) => {
        const cache = fs_cache[p];
        if (cache == 0) {
            return false;
        } else if (cache == 1) {
            return true;
        } else {
            try {
                qqFs.accessSync(QQ_ROOT + p);
                p = path.normailze(p);
                if (p) {
                    fs_cache[p] = 1;
                }
                return true;
            } catch (e) {
                p = path.normailze(p);
                fs_cache[p] = 0;
                return false;
            }
        }

    },


    writeSync: (p, content) => {
        p = path.normailze(p);
        fs_cache[p] = 1;
        qqFs.writeFileSync(QQ_ROOT + p, content);
    },

    readSync: (p, format) => {
        format = format || 'utf-8';
        return qqFs.readFileSync(QQ_ROOT + p, format);
    },

    /**
     * 创建文件夹
     */
    mkdirsSync: (p) => {
        // console.log(`mkdir: ${p}`)
        const time1 = Date.now();

        if (!fs.existsSync(p)) {
            const dirs = p.split('/');
            let current = "";
            for (let i = 0; i < dirs.length; i++) {
                const dir = dirs[i]
                current += dir + "/";
                if (!fs.existsSync(current)) {
                    let p = path.normailze(current);
                    fs_cache[p] = 1;
                    qqFs.mkdirSync(QQ_ROOT + current)

                }
            }
        } else {
            return;
        }
        const time2 = Date.now() - time1;
        // console.log(`mkdir: ${p} ${time2} ms`)
    },


    /**
     * 解压 zip 文件
     */
    unzip: (zipFilePath, targetPath) => {
        zipFilePath = QQ_ROOT + zipFilePath;
        targetPath = QQ_ROOT + targetPath;
        return new Promise((resolve, reject) => {
            //console.log(zipFilePath)
            qqFs.unzip({
                zipFilePath,
                targetPath,
                success: () => {
                    //console.log('success')
                    resolve();
                },
                fail(e) {
                    //console.log(e)
                    reject(e)
                }
            })
        })
    },
    /////
    setFsCache: (p, value) => {
        fs_cache[p] = value;
    }
}

export const path = {

    dirname: (p) => {
        const arr = p.split("/");
        arr.pop();
        return arr.join('/');
    },


    isRemotePath: (p) => {
        return p.indexOf("http://") == 0 || p.indexOf("https://") == 0;
    },

    normailze: (p) => {
        let arr = p.split("/");
        let original = p.split("/");
        for (let a of arr) {
            if (a == '' || a == null) {
                let index = original.indexOf(a);
                original.splice(index, 1);
            }
        }
        if (original.length > 0) {
            return original.join('/');
        }
    },
    // 根据key值表获取本地缓存路径
    // 通过本函数可将网络地址转化为本地缓存地址
    // 可通过编辑key值表来创建多个缓存路径
    getLocalFilePath: (p) => {
        for (let key in path.localFileMap) {
            if (p.indexOf(key) >= 0) {
                p = p.replace(key, path.localFileMap[key]);
                return path.normailze(p);
            }
        }
        //未设置key值，将按照地址名整理出资源路径，进行存储
        if (p.indexOf(":") >= 0 || p.indexOf('#') >= 0 || p.indexOf('?') >= 0) {
            p = p.replace(/[^a-z0-9.]/gi, "/");
        }
        return path.normailze(p);
    },
    // 获取QQ的用户缓存地址
    getQQUserPath: (p) => {
        return QQ_ROOT + p;
    },
    // 本地资源文件key值表
    // 可按照网络资源地址分配本地地址，可修改
    // 以下为示例，开发者可根据需要进行修改
    localFileMap: {
        // 'http://XXXXX/resource/assets/': 'temp_image/',
        // 'http://XXXXX/resource/config/': 'temp_text/',
        // 'http://XXXXX/resource/bin/': 'temp_bin/'
    }
}
