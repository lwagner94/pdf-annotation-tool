import Annotation from "./Annotation"
import {fabric} from "fabric";


export default class Textbox extends Annotation {
    constructor(context, x, y, width, height, scale, localID, documentWidth, documentHeight) {
        let object = new fabric.Textbox("foo", {
            width: width,
            height: height,
            left: x * scale,
            top: y * scale,
            backgroundColor: "rgba(255, 255, 200, 1)",
            fill: "black",
            lockScalingY: true,
            fontSize: 20,
            scaleX: scale,
            scaleY: scale
        });

        super(context, object, x, y, width, height, scale, localID, documentWidth, documentHeight);
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

    static fromJSON(context, properties, initialScale, localID, documentWidth, documentHeight) {
        const state = JSON.parse(properties);

        const annotation = new Textbox(context, 0, 0, state.data.width, state.data.height,
            initialScale, localID, documentWidth, documentHeight);

        annotation.object.text = state.data.text;

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