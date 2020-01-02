'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class ViewManager {
    constructor() {
        // tracked views for config/restore updates
        this._views = [];
    }
    /**
     * Creates view manager singleton instance.
     */
    static get Instance() {
        return this._instance || (this._instance = new this());
    }
    /**
     * Adds new view instance for config/restore tracking.
     * @param view view instance to add.
     */
    add(view) {
        this._views.push(view);
    }
    /**
     * Removes view instance from views tracking collection.
     * @param view view instance to remove.
     */
    remove(view) {
        let found = this._views.indexOf(view);
        if (found >= 0) {
            this._views.splice(found, 1);
        }
    }
    /**
     * Returns matching view for the specified uri.
     * @param uri view uri.
     */
    find(uri) {
        return this._views.find(view => view.viewUri.toString() === uri.toString());
    }
    /**
     * Returns active view instance.
     */
    active() {
        return this._views.find(view => view.visible);
    }
    /**
     * Reloads open views on extension config changes.
     */
    configure() {
        this._views.forEach(view => view.configure());
    }
}
exports.ViewManager = ViewManager;
// export view manager singleton
exports.viewManager = ViewManager.Instance;
//# sourceMappingURL=view.manager.js.map