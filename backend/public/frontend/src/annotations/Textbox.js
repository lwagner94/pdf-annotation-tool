import Annotation from "./Annotation"
import {fabric} from "fabric";


export default class Textbox extends Annotation {
    constructor(x, y, width, height) {
        let object = new fabric.Textbox("foo", {
            width: width,
            height: height,
            left: x,
            top: y,
            backgroundColor: "#000000",
            fill: "#FFFFFF",
            lockScalingY: true,
            fontSize: 20
        });

        super(object, x, y, width, height);
    }

}