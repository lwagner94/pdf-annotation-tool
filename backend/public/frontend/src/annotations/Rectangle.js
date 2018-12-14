import Annotation from "./Annotation"
import {fabric} from "fabric";


export default class Rectangle extends Annotation {
    constructor(x, y, width, height) {
        let object = new fabric.Rect({
            width: width,
            height: height,
            left: x,
            top: y,
            fill: '#000'
        });

        super(object, x, y, width, height);
    }
}
