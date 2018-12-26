import Annotation from "./Annotation"
import {fabric} from "fabric";


export default class Textbox extends Annotation {
    constructor(context, x, y, width, height, scale, localID, label) {
        let object = new fabric.Textbox("Text", {
            width: width,
            height: height,
            left: x * scale,
            top: y * scale,
            backgroundColor: label.color,
            fill: "black",
            lockScalingY: true,
            fontSize: 10,
            scaleX: scale,
            scaleY: scale,
            lockRotation: true
        });

        super(context, object, x, y, width, height, scale, localID, label);
    }

    toJSON() {
        const state = {
            type: "textbox",
            data: {
                text: this.object.text,
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

        const annotation = new Textbox(context, state.data.x, state.data.y, state.data.width, state.data.height, initialScale, localID, label);

        annotation.object.text = state.data.text;

        return annotation;
    }

    static drawable() {
        return true;
    }

}