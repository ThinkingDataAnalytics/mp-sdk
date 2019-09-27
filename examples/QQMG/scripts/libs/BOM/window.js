import Document from './src/Document';
import Image from './src/Image';
import Canvas from './src/Canvas';
import Audio from './src/Audio';

export * from './src/Window';

const canvas = new Canvas();
const document = new Document();

export {
    canvas,
    document,
    Image,
    Audio
};