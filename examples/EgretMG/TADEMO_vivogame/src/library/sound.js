const fileutil = require('./file-util');
const path = fileutil.path;
const fs = fileutil.fs;

/**
 * 重写的声音加载器，代替引擎默认的声音加载器
 * 该代码中包含了大量日志用于辅助开发者调试
 * 正式上线时请开发者手动删除这些注释
 */
class SoundProcessor {

    onLoadStart(host, resource) {

        const {
            root,
            url
        } = resource;
        let soundSrc = root + url;
        if (RES['getVirtualUrl']) {
            soundSrc = RES['getVirtualUrl'](soundSrc);
        }
        if (path.isRemotePath(soundSrc)) { //判断是本地加载还是网络加载
            if (!needCache(soundSrc)) {//通过缓存机制判断是否本地加载
                //无需缓存加载
                return loadSound(soundSrc);
            } else {
                //通过缓存机制加载
                const fullname = path.getLocalFilePath(soundSrc);
                if (fs.existsSync(fullname)) {
                    //本地有缓存
                    return loadSound(path.getUserPath(fullname))
                } else {
                    //本地没有缓存,下载
                    return fs.downloadFile(soundSrc, fullname).then(() => {
                        //下载完成，再从缓存里读取
                        return loadSound(path.getUserPath(fullname));
                    }, () => {
                        return;
                    })
                }
            }
        } else {
            //本地加载
            return loadSound(soundSrc)
        }

    }

    onRemoveStart(host, resource) {
        return Promise.resolve();
    }
}

function loadSound(soundURL) {
    return new Promise((resolve, reject) => {
        let sound = new egret.Sound();
        sound.addEventListener(egret.Event.COMPLETE, function(){
            resolve(sound)
        }, this);
        sound.addEventListener(egret.IOErrorEvent.IO_ERROR, function(){
            const e = new RES.ResourceManagerError(1001, soundURL);
            reject(e)
        }, this);
        sound.load(soundURL);
    })
}


/**
 * 由于小游戏限制只有50M的资源可以本地存储，
 * 所以开发者应根据URL进行判断，将特定资源进行本地缓存
 */
function needCache(assUrl) {
    if (assUrl.indexOf("remote/resource/") >= 0) {
        return true;
    } else {
        return false;
    }
}



const processor = new SoundProcessor();
RES.processor.map("sound", processor);
