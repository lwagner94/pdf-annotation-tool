import {fabric} from 'fabric';
import uuid from "uuid-random"
import EventBus from "@/EventBus"

import {getAnnotationClass, getAnnotationClassFromJSON} from "./registry"

import store from "../store"


class Annotations {

    constructor(context, width, height, scale, pageNumber, menu) {
        this.context = new fabric.Canvas(context, {fireRightClick: true, stopContextMenu: true});
        this._pageNumber = pageNumber;
        this.drawMode = false;
        this.startedDrawing = false;
        this.drawStartPos = {
            x: 0,
            y: 0
        };

        this._scale = scale;

        this._annotations = [];

        this.context.setWidth(width);
        this.context.setHeight(height);
        this.registerCallbacks();
        this.drawAnnotations();
        this.menu = menu;
        this.menuVisible = false;
    }

    registerCallbacks() {
        const self = this;
        this.setDrawingCallback = mode => {
            console.log(mode);
            self.drawMode = mode;
        };

        EventBus.$on("set-drawing", this.setDrawingCallback);

        // EventBus.$on("reload-annotations", () => {
        //     for (let annotation of self._annotations) {
        //         annotation.removeFromContext();
        //     }
        //
        //     self._annotations = [];
        //     // self.drawAnnotations();
        // });

        this.context.on("mouse:down", opt => {
            let mouse;

            mouse = self.context.getPointer(opt.e);


            if (opt.button === 3 && opt.target) {
                self.showContextMenu(mouse.x, mouse.y, opt.target.annotationInstance);
            }
            else {
                self.hideContextMenu();
            }

            if (!self.drawMode) {
                return;

            }

            self.drawStartPos.x = this.normalizeCoordinate(mouse.x);
            self.drawStartPos.y = this.normalizeCoordinate(mouse.y);


            const AnnotationClass = getAnnotationClass(self.drawMode);
            const annotation = new AnnotationClass(self.context, self.drawStartPos.x,
                self.drawStartPos.y, 0, 0, this._scale, uuid(), store.getters.activeLabel);
            this._annotations.push(annotation);

            if (AnnotationClass.drawable()) {
                self.startedDrawing = true;
            }
            else {
                this.storeAnnotation(annotation);
                EventBus.$emit("set-drawing", null);
            }


            annotation.addToContext();
            self.context.renderAll();
            annotation.setAsActiveObject();
        });
        this.context.on("mouse:move", opt => {
            if (!self.drawMode)
                return false;

            if(!self.startedDrawing) {
                return false;
            }

            const mouse = self.context.getPointer(opt.e);

            const w = Math.abs(this.normalizeCoordinate(mouse.x) - self.drawStartPos.x);
            const h = Math.abs(this.normalizeCoordinate(mouse.y) - self.drawStartPos.y);

            if (!w || !h) {
                return false;
            }

            const object = self.context.getActiveObject();
            const annotation = object.annotationInstance;

            annotation.width = w;
            annotation.height = h;
            self.context.renderAll();
        });
        this.context.on("mouse:up", opt => {
            if (!self.drawMode)
                return false;

            if(self.startedDrawing) {
                self.startedDrawing = false;
            }

            const object = self.context.getActiveObject();
            const annotation = object.annotationInstance;
            annotation.removeFromContext();
            annotation.addToContext();
            self.context.renderAll();

            this.storeAnnotation(annotation);
            EventBus.$emit("set-drawing", null);
        });

        this.context.on("object:modified", opt => {
            const annotation = opt.target.annotationInstance;
            annotation.recalculateSize();
            annotation.recalculatePosition();
            this.updateAnnotation(annotation);
        });

        this.context.on("mouse:dblclick", opt => {
            if (opt.target) {
                opt.target.annotationInstance.handleDoubleClick(self.context);
            }
        });

        this.context.on("selection:created", opt => {
            if (opt.selected.length > 1) {
                self.context.discardActiveObject();
            }
        });

    }

    showContextMenu(x, y, annotationInstance) {
        this.menu.setVisible(true);
        this.menu.setPosition(x, y);

        this.menu.setDeleteCallback(() => {
            this.removeAnnotation(annotationInstance)
        });
        this.menu.setRepeatByFontStyleCallback(() => {
            this.repeatByFontStyle(annotationInstance);
        });
        this.menu.setRepeatByPageCallback(() => {
            this.repeatByPage(annotationInstance);
        });

        this.menu.setLabelCallback((label) => {
            annotationInstance.label = label;
            this.updateAnnotation(annotationInstance);
        });
    }

    hideContextMenu() {
        this.menu.setVisible(false);
        this.menu.cleanup();
    }

    drawAnnotations() {
        const annotations = store.getters.annotationsForPage(this._pageNumber);

        for (let annotation of annotations) {
            const AnnotationType = getAnnotationClassFromJSON(annotation.properties);

            const newAnnotation = AnnotationType.fromJSON(this.context, annotation.properties, this._scale, annotation.localID,
                store.getters.labelByID(annotation.labelID));

            newAnnotation.addToContext();
            this._annotations.push(newAnnotation);
        }

        this.context.renderAll();
    }

    removeAnnotation(annotation) {
        console.log("Remove annotation: ", annotation, this);
        annotation.removeFromContext();

        store.commit("storeAnnotation", {
            localID: annotation.localID,
            pageNumber: this._pageNumber,
            properties: annotation.toJSON(),
            dirty: false,
            created: false,
            deleted: true
        });

        EventBus.$emit("annotations-modified");

        const index = this._annotations.findIndex(a => a.localID === annotation.localID);

        if (index > -1) {
            this._annotations.splice(index, 1);
        }
    }

    repeatByFontStyle(annotation) {
        EventBus.$emit("repeat-by-fontstyle", annotation.localID);
    }

    repeatByPage(annotation) {
        EventBus.$emit("repeat-by-page", annotation.localID, "even");
    }

    storeAnnotation(annotation) {
        store.commit("storeAnnotation", {
            labelID: annotation.label.id,
            localID: annotation.localID,
            pageNumber: this._pageNumber,
            properties: annotation.toJSON(),
            dirty: false,
            created: true,
            deleted: false
        });

        EventBus.$emit("annotations-modified");
    }

    updateAnnotation(annotation) {
        store.commit("storeAnnotation", {
            labelID: annotation.label.id,
            localID: annotation.localID,
            pageNumber: this._pageNumber,
            properties: annotation.toJSON(),
            dirty: true,
            created: false,
            deleted: false
        });

        EventBus.$emit("annotations-modified");
    }

    normalizeCoordinate(coord) {
        return coord / this._scale;
    }

    render() {
        this.context.renderAll();
    }

    dispose() {
        EventBus.$off("set-drawing", this.setDrawingCallback);
        this.menu = null;
        this.context.clear();
        this.context.dispose();
        this._annotations = null;
        // delete this.context;
    }

    set width(w) {
        this.context.setWidth(w);
    }

    set height(h) {
        this.context.setHeight(h);
    }



    set scale(s) {
        this._scale = s;

        for (let annotation of this._annotations) {
            annotation.scale = this._scale;

            // This is necessary so that it is possible to move the annotation on it's new position, not sure why.
            // If we don't do this, the cursor shows the movement-arrows on the old position before scaling
            annotation.removeFromContext();
            annotation.addToContext();
        }
    }
}


export default Annotations;