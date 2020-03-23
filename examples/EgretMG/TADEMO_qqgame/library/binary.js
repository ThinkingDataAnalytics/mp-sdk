const fileutil = require('./file-util');
const path = fileutil.path;
const fs = fileutil.fs;
const QQFS = qq.getFileSystemManager();

class BinaryProcessor {

    onLoadStart(host, resource) {

        const {
            root,
            url
        } = resource;

        return new Promise((resolve, reject) => {

            let xhrURL = url.indexOf('://') >= 0 ? url : root + url;
            if (RES['getVirtualUrl']) {
                xhrURL = RES['getVirtualUrl'](xhrURL);
            }
            if (path.isRemotePath(xhrURL)) {
                if (needCache(xhrURL)) {
                    const targetFilename = path.getLocalFilePath(xhrURL);
                    if (fs.existsSync(targetFilename)) {
                        //缓存命中
                        let data = QQFS.readFileSync(path.getQQUserPath(targetFilename));
                        resolve(data);
                    } else {
                        loadBinary(xhrURL).then((content) => {
                            const dirname = path.dirname(targetFilename);
                            fs.mkdirsSync(dirname);
                            fs.writeSync(targetFilename, content);
                            let needRead = needReadFile();
                            if (needRead) {
                                content = QQFS.readFileSync(path.getQQUserPath(targetFilename));
                            }
                            resolve(content);
                        }).catch((e) => {
                            reject(e);
                        });
                    }

                } else {
                    loadBinary(xhrURL).then((content) => {
                        resolve(content);
                    }).catch((e) => {
                        reject(e);
                    });
                }
            } else {
                try {
                    const content = QQFS.readFileSync(xhrURL);
                    resolve(content);
                } catch (e) {
                    resolve(null);
                }
            }
        });
    }

    onRemoveStart(host, resource) {
        return Promise.resolve();
    }
}

let qqSystemInfo;

function needReadFile() {
    if (!qqSystemInfo) {
        qqSystemInfo = qq.getSystemInfoSync();
    }
    let sdkVersion = qqSystemInfo.SDKVersion;
    let platform = qqSystemInfo.system.split(" ").shift();
    return (sdkVersion <= '2.2.3') && (platform == 'iOS');
}

function loadBinary(xhrURL) {
    return new Promise((resolve, reject) => {
        qq.request({
            url: xhrURL,
            method: 'get',
            responseType: 'arraybuffer',
            success: function success(_ref) {
                resolve(_ref.data)
            },
            fail: function fail(_ref2) {
                const error = new RES.ResourceManagerError(1001, xhrURL);
                console.error('load binary error',xhrURL);
                reject(error)
            }
        });
    });

}

/**
 * 由于QQ小游戏限制只有50M的资源可以本地存储，
 * 所以开发者应根据URL进行判断，将特定资源进行本地缓存
 */
function needCache(url) {
    if (url.indexOf("miniGame/resource/") >= 0) {
        return true;
    } else {
        return false;
    }
}



const processor = new BinaryProcessor();
RES.processor.map("bin", processor);
