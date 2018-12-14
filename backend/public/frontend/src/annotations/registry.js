import Rectangle from "./Rectangle"
import Textbox from "./Textbox"


export default function getAnnotationClass(type) {

    switch (type) {
        case "rectangle":
            return Rectangle;
        case "textbox":
            return Textbox;
        default:
            throw new Error("Unknown annotation type");
    }

}