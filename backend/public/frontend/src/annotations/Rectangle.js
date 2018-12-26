import Annotation from "./Annotation"
import colorHexToRGBA from "../utils/color"
import {fabric} from "fabric";


export default class Rectangle extends Annotation {
    constructor(context, x, y, width, height, scale, localID, label) {
        let object = new fabric.Rect({
            width: width,
            height: height,
            left: x,
            top: y,
            fill: colorHexToRGBA(label.color, 0.5),
            scaleX: scale,
            scaleY: scale,
            fireRightClick: true,
            lockRotation: true
        });

        super(context, object, x, y, width, height, scale, localID, label);
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

    static fromJSON(context, properties, initialScale, localID, label) {
        const state = JSON.parse(properties);

        const annotation = new Rectangle(context, state.data.x, state.data.y, state.data.width, state.data.height, initialScale, localID, label);

        return annotation;
    }

    static drawable() {
        return true;
    }
}
