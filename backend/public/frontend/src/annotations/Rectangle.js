import Annotation from "./Annotation"
import {fabric} from "fabric";


export default class Rectangle extends Annotation {
    constructor(context, x, y, width, height, scale, localID) {
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

        super(context, object, x, y, width, height, scale, localID);
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

    static fromJSON(context, properties, initialScale, localID) {
        const state = JSON.parse(properties);

        const annotation = new Rectangle(context, state.data.x, state.data.y, state.data.width, state.data.height, initialScale, localID);

        return annotation;
    }

    static drawable() {
        return true;
    }
}
