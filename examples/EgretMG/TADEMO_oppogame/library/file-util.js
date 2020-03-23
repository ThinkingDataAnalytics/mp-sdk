/**
 * 封装OPPO小游戏的文件系统
 */
const oppoFS = qg.getFileSystemManager();
const SYS_ROOT = qg.env.USER_DATA_PATH + '/'

let fs_cache = {};

function walkFile(dirname, callback) {
    const files = oppoFS.readdirSync(dirname)
    var pending = files.length;
    if (!--pending) callback();
    for (let f of files) {
        const file = dirname + '/' + f;
        let p = file.replace(SYS_ROOT, "");
        if (fs_cache[p]) {
            fs_cache[p] = 0;
        }
        oppoFS.stat({
            path: file,
            success: function (res) {
                if (res.stat.isDirectory()) {
                    walkFile(file, () => {
                        if (!--pending) callback();
                    })
                } else {
                    if (!--pending) callback();
                }
            }
        })
    }
}

const oppo_fs = {
    /**
     * 遍历删除文件夹
     */
    remove: (dirname) => {
        let fullPath = SYS_ROOT + oppo_path.getLocalFilePath(dirname);
        oppoFS.stat({
            path: fullPath,
            success: function (res) {
                let p = fullPath.replace(SYS_ROOT, "");
                if (fs_cache[p]) {
                    fs_cache[p] = 0;
                }
                if (res.stat.isDirectory()) {
                    walkFile(fullPath, () => {
                        oppoFS.rmdirSync(fullPath, true)
                    });
                } else {
                    oppoFS.unlinkSync(fullPath)
                }
            },
            fail: function () {
                //file not exist
            }
        })
    },
    /**
     * 检查文件是否存在
     */
    existsSync: (p) => {
        let cache = fs_cache[p];
        if (cache == 0) {
            return false
        } else if (cache == 1) {
            return true;
        } else {
            p = oppo_path.normailze(p);
            try {
                oppoFS.accessSync(SYS_ROOT + p)
                fs_cache[p] = 1;
                return true;
            } catch (e) {
                fs_cache[p] = 0;
                return false;
            }
        }

    },
    downloadFile: (src, target) => {
        return new Promise((resolve, reject) => {
            qg.downloadFile({
                url: src,
                success: function (data) {
                    let tempFilePath = data.tempFilePath;
                    oppoFS.copyFileSync(tempFilePath, oppo_path.getUserPath(target))
                    resolve();
                },
                fail: function (data, code) {
                    reject(data)
                }
            })

        })
    }
}
const oppo_path = {
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
        for (let key in oppo_path.localFileMap) {
            if (p.indexOf(key) >= 0) {
                p = p.replace(key, oppo_path.localFileMap[key]);
                return oppo_path.normailze(p);
            }
        }
        //未设置key值，将按照地址名整理出资源路径，进行存储
        if (p.indexOf(":") >= 0 || p.indexOf('#') >= 0 || p.indexOf('?') >= 0) {
            p = p.replace(/[^a-z0-9.]/gi, "/");
        }
        return oppo_path.normailze(p);
    },
    // 获取户缓存地址
    getUserPath: (p) => {
        return SYS_ROOT + p;
    },
    // 本地资源文件key值表
    // 可按照网络资源地址分配本地地址，可修改
    // 以下为示例，开发者可根据需要进行修改
    localFileMap: {
        'http://10.0.5.52:8080/resource/remote': 'cache_crc32/assets/',
        // 'http://XXXXX/resource/config/': 'temp_text/',
        // 'http://XXXXX/resource/bin/': 'temp_bin/'
    }
}
window.oppo_path = oppo_path;
window.oppoFS = oppoFS;
