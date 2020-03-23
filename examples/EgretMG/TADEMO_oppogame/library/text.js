/**
 * 重写的文本加载器，代替引擎默认的文本加载器
 * 该代码中包含了大量日志用于辅助开发者调试
 * 正式上线时请开发者手动删除这些注释
 */
class TextProcessor {

    onLoadStart(host, resource) {

        const {
            root,
            url
        } = resource;

        let xhrURL = url.indexOf('://') >= 0 ? url : root + url; //获取网络加载url
        if (RES['getVirtualUrl']) {
            xhrURL = RES['getVirtualUrl'](xhrURL);
        }
        let oppo_path = window.oppo_path;
        if (oppo_path.isRemotePath(xhrURL)) {//判断是本地加载还是网络加载
            if (needCache(xhrURL)) {//通过缓存机制判断是否本地加载
                //通过缓存机制加载
                const targetFilename = oppo_path.getLocalFilePath(xhrURL);
                if (oppo_fs.existsSync(targetFilename)) {
                    //本地有缓存
                    return readLoaclText(oppo_path.getUserPath(targetFilename));
                } else {
                    //本地没有缓存,下载
                    return loadText(xhrURL).then((content) => {
                        //下载完成，把文本写到本地
                        return writeText(oppo_path.getUserPath(targetFilename), content)
                    })
                }
            } else {
                //无需缓存加载
                return loadText(xhrURL)

            }
        } else {
            //本地加载
            return readLoaclText(xhrURL)
        }
    }

    onRemoveStart(host, resource) {
        return Promise.resolve();
    }
}

function writeText(targetFilename, content) {
    return new Promise((resolve, reject) => {
        window.oppoFS.writeFile({
            filePath: targetFilename,
            data: content,
            success: function () {
                resolve(content)
            },
            fail: function (data, code) {
                reject();
            }
        })
    })
}

function readLoaclText(targetFilename) {
    return new Promise((resolve, reject) => {
        window.oppoFS.readFile({
            filePath: targetFilename,
            encoding: 'utf8',
            success: function (res) {
                resolve(res.data);
            },
            fail: function () {
                reject();
            }
        })
    })
}

function loadText(xhrURL) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
            if (xhr.status >= 400) {
                const message = `加载失败:${xhrURL}`;
                console.error(message);
                reject(message);
            } else {
                // console.log('loadText:', xhr.responseText)
                resolve(xhr.responseText);
            }
        }
        xhr.onerror = (e) => {
            const error = new RES.ResourceManagerError(1001, xhrURL);
            console.error(e);
            reject(error);
        }
        xhr.open("get", xhrURL);
        xhr.send();
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

RES.processor.map("text", new TextProcessor());
