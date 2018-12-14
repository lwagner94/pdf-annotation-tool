import uuid from "uuid-random"


export default class Annotation {
    constructor(object, x, y, width, height) {
        this.localID = uuid();
        this.object = object;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.object.annotationInstance = this;
    }


    addToContext(context) {
        context.add(this.object);
    }

    setAsActiveObject(context) {
        context.setActiveObject(this.object);
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
        this.object.set('scaleX', 1);
    }

    get width() {
        return this._width;
    }

    set height(h) {
        this._height = h;
        this.object.set('height', h);
        this.object.set('scaleY', 1);
    }

    get height() {
        return this._height;
    }
}
