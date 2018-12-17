import Rectangle from "./Rectangle"
import Textbox from "./Textbox"
import StickyNote from "./StickyNote"


export function getAnnotationClass(type) {
    switch (type) {
        case "rectangle":
            return Rectangle;
        case "textbox":
            return Textbox;
        case "stickynote":
            return StickyNote;
        default:
            throw new Error("Unknown annotation type");
    }
}

export function getAnnotationClassFromJSON(json) {
    const obj = JSON.parse(json);
    return getAnnotationClass(obj.type);
}