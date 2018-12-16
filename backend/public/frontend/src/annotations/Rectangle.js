import Annotation from "./Annotation"
import {fabric} from "fabric";


export default class Rectangle extends Annotation {
    constructor(x, y, width, height, scale, localID) {
        let object = new fabric.Rect({
            width: width,
            height: height,
            left: x,
            top: y,
            fill: '#000',
            scaleX: scale,
            scaleY: scale,
            fireRightClick: true
        });

        super(object, x, y, width, height, scale, localID);
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

    static fromJSON(properties, initialScale, localID) {
        const state = JSON.parse(properties);

        const annotation = new Rectangle(state.data.x, state.data.y, state.data.width, state.data.height, initialScale, localID);

        return annotation;
    }
}
