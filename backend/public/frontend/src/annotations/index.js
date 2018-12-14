import {fabric} from 'fabric';
import uuid from "uuid-random"
import EventBus from "@/EventBus"

import {getAnnotationClass, getAnnotationClassFromJSON} from "./registry"

import store from "../store"


class Annotations {

    constructor(context, width, height, scale, pageNumber) {
        this.context = new fabric.Canvas(context);
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
    }

    registerCallbacks() {
        const self = this;
        EventBus.$on("set-drawing", mode => {
            self.drawMode = mode;
        });

        this.context.on("mouse:down", opt => {
            if (!self.drawMode)
                return;

            const mouse = self.context.getPointer(opt.e);
            self.startedDrawing = true;
            self.drawStartPos.x = this.normalizeCoordinate(mouse.x);
            self.drawStartPos.y = this.normalizeCoordinate(mouse.y);

            const AnnotationClass = getAnnotationClass(self.drawMode);
            const annotation = new AnnotationClass(self.drawStartPos.x,
                self.drawStartPos.y, 0, 0, this._scale, uuid());
            this._annotations.push(annotation);
            annotation.addToContext(self.context);
            self.context.renderAll();
            annotation.setAsActiveObject(self.context);
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
            annotation.addToContext(self.context);
            self.context.renderAll();

            this.storeAnnotation(annotation);
            EventBus.$emit("set-drawing", null);
        });

        this.context.on("object:moved", opt => {
            const annotation = opt.target.annotationInstance;
            annotation.recalculatePosition();
            this.storeAnnotation(annotation);
        });

        this.context.on("object:scaled", opt => {
            const annotation = opt.target.annotationInstance;
            annotation.recalculateSize();
            this.storeAnnotation(annotation);
        });
    }

    drawAnnotations() {
        const annotations = store.getters.annotationsForPage(this._pageNumber);

        for (let annotation of annotations) {
            const AnnotationType = getAnnotationClassFromJSON(annotation.properties);
            const newAnnotation = AnnotationType.fromJSON(annotation.properties, this._scale, annotation.localID);
            console.log(newAnnotation);
            newAnnotation.addToContext(this.context);
            this._annotations.push(newAnnotation);
        }

        this.context.renderAll();
    }

    storeAnnotation(annotation) {
            store.commit("storeAnnotation", {
                id: null,
                localID: annotation.localID,
                setID: null, // TODO
                pageNumber: this._pageNumber,
                properties: annotation.toJSON()
        });
    }

    normalizeCoordinate(coord) {
        return coord / this._scale;
    }

    render() {
        this.context.renderAll();
    }

    dispose() {
        this.context.dispose();
        delete this.context;
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
            annotation.addToContext(this.context);
        }
    }
}


export default Annotations;