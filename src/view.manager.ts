'use strict';
import {Uri} from 'vscode';
import {MapView} from './map.view';

export class ViewManager {
    
  // singleton instance
  private static _instance: ViewManager;

  // tracked views for config/restore updates
  private _views: MapView[] = [];

  private constructor() {
  }

  /**
   * Creates view manager singleton instance.
   */
  public static get Instance() {
    return this._instance || (this._instance = new this());
  }

  /**
   * Adds new view instance for config/restore tracking.
   * @param view view instance to add.
   */
  public add(view: MapView): void {
    this._views.push(view!);
  }

  /**
   * Removes view instance from views tracking collection.
   * @param view view instance to remove.
   */
  public remove(view: MapView): void {
    let found = this._views.indexOf(view!);
    if (found >= 0) {
      this._views.splice(found, 1);
    }
  }

  /**
   * Returns matching view for the specified uri.
   * @param uri view uri.
   */
  public find(uri: Uri): MapView | undefined {
    return this._views.find(view => view.viewUri.toString() === uri.toString());
  }

  /**
   * Returns active view instance.
   */
  public active(): MapView | undefined {
    return this._views.find(view => view.visible);
  }
    
  /**
   * Reloads open views on extension config changes.
   */
  public configure(): void {
    this._views.forEach(view => view.configure());
  }
}

// export view manager singleton
export const viewManager = ViewManager.Instance;
