
export default class Annotation {
    constructor(context, object, left, top, width, height, scale, localID, documentWidth, documentHeight) {
        this.context = context;
        this.localID = localID;

        this.documentWidth = documentWidth;
        this.documentHeight = documentHeight;

        this.object = object;
        this._scale = scale;
        this._x = this.leftToX(left);
        this._y = this.topToY(top);
        this._width = width / this._scale;
        this._height = height / this._scale;
        this.object.annotationInstance = this;



        this.object.set("left", this.xToLeft(this.x));
        this.object.set("top", this.yToTop(this.y));
    }

    leftToX(left) {
        return left / this._scale;
    }

    xToLeft(x) {
        return x * this._scale;
    }

    topToY(top) {
        return this.documentHeight - (top / this._scale) - (this.object.height / this._scale);
    }

    yToTop(y) {
        return (this.documentHeight - y - (this.object.height / this._scale)) * this._scale;
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
        this.width = this.object.width * this.object.scaleX;
        this.height = this.object.height * this.object.scaleY;
    }

    recalculatePosition() {
        this.x = this.leftToX(this.object.left);
        this.y = this.topToY(this.object.top);

        console.log(this.x, this.y);
    }

    toJSON() {
        throw new Error("Invalid use of abstract class");
    }

    static fromJSON(properties, localID, documentWidth, documentHeight) {
        throw new Error("Invalid use of abstract class");
    }

    static drawable() {
        throw new Error("Invalid use of abstract class");
    }

    set x(x) {
        this._x = x;
        this.object.set("left", this.xToLeft(this.x));
    }

    get x() {
        return this._x;
    }

    set y(y) {
        this._y = y;
        this.object.set("top", this.yToTop(this.y));
    }

    get y() {
        return this._y;
    }

    set width(w) {
        this._width = w / this._scale;
        this.object.set('width', w / this._scale);
        this.object.set('scaleX', this._scale);
    }

    get width() {
        return this._width;
    }

    set height(h) {
        this._height = h / this._scale;
        this.object.set('height', h / this._scale);
        this.object.set('scaleY', this._scale);
    }

    get height() {
        return this._height;
    }

    set scale(s) {
        this._scale = s;
        this.object.set("scaleX", this._scale);
        this.object.set("scaleY", this._scale);

        this.object.set("left", this.xToLeft(this.x));
        this.object.set("top", this.yToTop(this.y));
    }
}

