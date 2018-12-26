import Annotation from "./Annotation"
import {fabric} from "fabric";

export default class StickyNote extends Annotation {
    constructor(context, x, y, width, height, scale, localID, label) {
        let placeholder = new fabric.Textbox("Note", {
            width: 50,
            height: 50,
            left: x,
            top: y,
            backgroundColor: label.color,
            fill: 'black',
            scaleX: scale,
            scaleY: scale,
            fontSize: 15,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            editable: false
        });


        super(context, placeholder, x, y, width, height, scale, localID, label);

        this.expandedView = new fabric.Textbox("Text", {
            width: 300,
            height: 300,
            backgroundColor: "rgba(255, 255, 200, 1)",
            fill: "black",
            lockScalingY: true,
            lockScalingX: true,
            scaleX: scale,
            scaleY: scale,
            fontSize: 10,
            lockRotation: true
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

    handleDoubleClick() {
        let self = this;

        setTimeout(() => {
            if (!self.expanded) {
                console.log("Adding");
                self.expandedView.set("left", self.x * self._scale);
                self.expandedView.set("top", self.y * self._scale);

                self.context.add(self.expandedView);
                self.context.setActiveObject(self.expandedView);
            }
            else {
                console.log("Removing");
                self.context.remove(self.expandedView);
            }
            self.expanded = !self.expanded;
        }, 50);
    }

    static fromJSON(context, properties, initialScale, localID, label) {
        const state = JSON.parse(properties);

        const annotation = new StickyNote(context, state.data.x, state.data.y, state.data.width, state.data.height, initialScale, localID, label);
        annotation.expandedView.text = state.data.text;
        return annotation;
    }

    static drawable() {
        return false;
    }

    set scale(s) {
        this._scale = s;

        this.object.set("scaleX", this._scale);
        this.object.set("scaleY", this._scale );

        this.object.set("left", this._x * this._scale);
        this.object.set("top", this._y * this._scale);

        this.expandedView.set("scaleX", this._scale);
        this.expandedView.set("scaleY", this._scale );

        this.expandedView.set("left", this._x * this._scale);
        this.expandedView.set("top", this._y * this._scale);
    }

    applyColor() {
        this.object.set("backgroundColor", this.label.color);
        super.applyColor();
    }
}
