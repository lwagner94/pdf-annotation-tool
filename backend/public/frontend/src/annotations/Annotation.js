import colorHexToRGBA from "../utils/color";
import PIXEL_RATIO from "../utils/constants"

export default class Annotation {
    constructor(context, object, x, y, width, height, scale, localID, label) {
        this.context = context;
        this.localID = localID;
        this._label = label;

        this.object = object;
        this.object.annotationInstance = this;
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this.scale = scale;
    }


    addToContext() {
        this.context.add(this.object);
    }

    removeFromContext() {
        this.context.remove(this.object);
    }

    setAsActiveObject() {
        this.context.setActiveObject(this.object);
    }

    handleDoubleClick(context) {

    }

    recalculateSize() {
        this.width = this.object.width * (this.object.scaleX / this._scale);
        this.height = this.object.height * (this.object.scaleY / this._scale);
    }

    recalculatePosition() {
        this.x = this.object.left / this._scale;
        this.y = this.object.top / this._scale;
    }

    applyColor() {
        this.context.renderAll();
    }

    toJSON() {
        throw new Error("Invalid use of abstract class");
    }

    static fromJSON(properties, localID, label) {
        throw new Error("Invalid use of abstract class");
    }

    static drawable() {
        throw new Error("Invalid use of abstract class");
    }

    set x(x) {
        this._x = x;
    }

    get x() {
        return this._x;
    }

    set y(y) {
        this._y = y;
    }

    get y() {
        return this._y;
    }

    set width(w) {
        this._width = w;
        this.object.set('width', w);
        this.object.set('scaleX', this._scale);
    }

    get width() {
        return this._width;
    }

    set height(h) {
        this._height = h;
        this.object.set('height', h);
        this.object.set('scaleY', this._scale);
    }

    get height() {
        return this._height;
    }

    set scale(s) {
        this._scale = s;
        this.object.set("scaleX", this._scale);
        this.object.set("scaleY", this._scale);

        this.object.set("left", this._x * this._scale);
        this.object.set("top", this._y * this._scale);
    }

    set label(label) {
        this._label = label;
        this.applyColor();
    }

    get label() {
        return this._label;
    }
}

