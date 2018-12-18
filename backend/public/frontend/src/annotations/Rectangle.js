import Annotation from "./Annotation"
import {fabric} from "fabric";


export default class Rectangle extends Annotation {
    constructor(context, x, y, width, height, scale, localID, documentWidth, documentHeight) {
        let object = new fabric.Rect({
            width: width,
            height: height,
            left: x,
            top: y,
            fill: 'rgba(255, 255, 200, 0.7)',
            scaleX: scale,
            scaleY: scale,
            fireRightClick: true
        });

        super(context, object, x, y, width, height, scale, localID, documentWidth, documentHeight);
    }

    toJSON() {
        const state = {
            type: "rectangle",
            data: {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height
            }
        };

        return JSON.stringify(state);
    }

    static fromJSON(context, properties, initialScale, localID, documentWidth, documentHeight) {
        const state = JSON.parse(properties);

        const annotation = new Rectangle(context, 0, 0, state.data.width,
            state.data.height, initialScale, localID, documentWidth, documentHeight);


        // Workaround. By setting the coordinates after constructing the instance, we can can use
        // the coordinate transformation functionality in the setter
        annotation.x = state.data.x;
        annotation.y = state.data.y;

        return annotation;
    }

    static drawable() {
        return true;
    }
}
