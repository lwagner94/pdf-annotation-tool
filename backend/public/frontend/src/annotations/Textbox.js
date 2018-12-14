import Annotation from "./Annotation"
import {fabric} from "fabric";


export default class Textbox extends Annotation {
    constructor(x, y, width, height, scale, localID) {
        let object = new fabric.Textbox("foo", {
            width: width,
            height: height,
            left: x * scale,
            top: y * scale,
            backgroundColor: "#000000",
            fill: "#FFFFFF",
            lockScalingY: true,
            fontSize: 20,
            scaleX: scale,
            scaleY: scale
        });

        super(object, x, y, width, height, scale, localID);
        this.annotationType = "textbox";
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

    static fromJSON(properties, initialScale, localID) {
        const state = JSON.parse(properties);

        const annotation = new Textbox(state.data.x, state.data.y, state.data.width, state.data.height, initialScale, localID);

        annotation.object.text = state.data.text;

        return annotation;
    }

}