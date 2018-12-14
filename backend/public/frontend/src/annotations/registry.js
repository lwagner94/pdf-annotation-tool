import Rectangle from "./Rectangle"
import Textbox from "./Textbox"


export function getAnnotationClass(type) {
    switch (type) {
        case "rectangle":
            return Rectangle;
        case "textbox":
            return Textbox;
        default:
            throw new Error("Unknown annotation type");
    }
}

export function getAnnotationClassFromJSON(json) {
    const obj = JSON.parse(json);
    return getAnnotationClass(obj.type);
}