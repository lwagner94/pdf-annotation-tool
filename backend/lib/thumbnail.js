const fs = require('fs');
const {createCanvas} = require('canvas');
const pdfjs = require('pdfjs-dist');

class CanvasFactory {
    static create(width, height) {
        const canvas = createCanvas(width, height);

        return {
            canvas: canvas,
            context: canvas.getContext("2d")
        }
    }

    static reset(container, width, height) {
        container.canvas.height = height;
        container.canvas.width = width;
    }

    static destroy(container) {
        delete container.canvas;
        delete container.context;
    }
}

function generateThumbnail(path) {
    let canvas = null;
    const pdfData = new Uint8Array(fs.readFileSync(path));
    return pdfjs.getDocument(pdfData).promise.then(pdfDocument => {
        return pdfDocument.getPage(1)
    }).then(page => {
        const viewport = page.getViewport(1.0);
        const container = CanvasFactory.create(viewport.width, viewport.height);
        canvas = container.canvas;

        const renderContext = {
            canvasFactory: CanvasFactory,
            canvasContext: container.context,
            viewport: viewport
        };
        return page.render(renderContext).promise
    }).then(() => {
        return canvas.toBuffer();
    });
}

module.exports.generateThumbnail = generateThumbnail;