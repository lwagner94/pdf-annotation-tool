import Annotation from "./Annotation"
import {fabric} from "fabric";


export default class StickyNote extends Annotation {
    constructor(x, y, width, height, scale, localID) {
        let object = new fabric.Rect({
            width: width,
            height: height,
            left: x,
            top: y,
            fill: '#999',
            scaleX: scale,
            scaleY: scale,
            // fireRightClick: true
        });

        super(object, x, y, width, height, scale, localID);

        this.simpleView = this.object;

        this.expandedView = new fabric.Textbox("foo", {
            width: width,
            height: height,
            left: x * scale,
            top: y * scale,
            backgroundColor: "#000000",
            fill: "#FFFFFF",
            lockScalingY: true,
            fontSize: 10,
            scaleX: scale,
            scaleY: scale
        });

        this.expandedView.annotationInstance = this;

        this.expanded = false;
    }

    toJSON() {
        const state = {
            type: "stickynote",
            data: {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
                text: this.expandedView.text
            }
        };

        return JSON.stringify(state);
    }

    handleDoubleClick(context) {
        setTimeout(() => {
            this.removeFromContext(context);

            if (this.expanded) {
                this.object = this.simpleView;
            }
            else {
                this.object = this.expandedView
            }

            this.object.set("left", this._x * this._scale);
            this.object.set("top", this._y * this._scale);

            this.expanded = !this.expanded;
            this.addToContext(context);
        }, 50);
    }

    static fromJSON(properties, initialScale, localID) {
        const state = JSON.parse(properties);

        const annotation = new StickyNote(state.data.x, state.data.y, state.data.width, state.data.height, initialScale, localID);
        annotation.expandedView.text = state.data.text;
        return annotation;
    }

    set scale(s) {
        this._scale = s;
        this.expandedView.set("scaleX", this._scale);
        this.expandedView.set("scaleY", this._scale);

        this.expandedView.set("left", this._x * this._scale);
        this.expandedView.set("top", this._y * this._scale);

        this.simpleView.set("scaleX", this._scale);
        this.simpleView.set("scaleY", this._scale);

        this.simpleView.set("left", this._x * this._scale);
        this.simpleView.set("top", this._y * this._scale);
    }
}
